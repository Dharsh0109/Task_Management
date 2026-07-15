import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../utils/api';
import ProjectSidebar from '../components/ProjectSidebar';
import FilterBar from '../components/FilterBar';
import SearchBar from '../components/SearchBar';
import CalendarView from '../components/CalendarView';
import TaskDetailModal from '../components/TaskDetailModal';
import CreateTaskModal from '../components/CreateTaskModal';
import useDebounce from '../hooks/useDebounce';

const DashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const socketRef = useRef(null);
  const [view, setView] = useState('list');
  const [selectedTask, setSelectedTask] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    project: searchParams.get('project') || '',
    tag: searchParams.get('tag') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    sort: searchParams.get('sort') || 'createdAt',
    order: searchParams.get('order') || 'desc',
  });

  const debouncedSearch = useDebounce(search, 300);

  const query = useMemo(() => ({
    q: debouncedSearch,
    status: filters.status,
    priority: filters.priority,
    project: filters.project,
    tag: filters.tag,
    startDate: filters.startDate,
    endDate: filters.endDate,
    sort: filters.sort,
    order: filters.order,
  }), [debouncedSearch, filters]);

  useEffect(() => {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    setSearchParams(params, { replace: true });
  }, [query, setSearchParams]);

  const fetchProjects = async () => {
    const response = await api.get('/api/projects');
    return response.data;
  };

  const fetchTags = async () => {
    const response = await api.get('/api/tags', { params: { project: '' } });
    return response.data;
  };

  const fetchTasks = async () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('q', debouncedSearch);
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.tag) params.set('tag', filters.tag);
    if (filters.project) params.set('project', filters.project);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.order) params.set('order', filters.order);

    const response = await api.get(`/api/tasks/search?${params.toString()}`);
    return response.data;
  };

  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects, staleTime: 10000 });
  const { data: tags = [] } = useQuery({ queryKey: ['tags', filters.project || ''], queryFn: fetchTags, staleTime: 10000 });
  const { data: tasks = [] } = useQuery({ queryKey: ['tasks', query], queryFn: fetchTasks, staleTime: 5000 });

  useEffect(() => {
    const socket = io('http://localhost:5000', { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));

    const applyTaskChange = (task) => {
      queryClient.setQueriesData({ predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === 'tasks' }, (current = []) => {
        if (!Array.isArray(current)) return [];

        const taskId = task?._id;
        if (!taskId) return current;

        if (task?.__deleted) {
          return current.filter((item) => item._id !== taskId);
        }

        const exists = current.some((item) => item._id === taskId);
        if (!exists) {
          return [task, ...current];
        }

        return current.map((item) => (item._id === taskId ? task : item));
      });

      if (selectedTask?._id === task?._id) {
        setSelectedTask(task);
      }
    };

    socket.on('task:created', applyTaskChange);
    socket.on('task:updated', applyTaskChange);
    socket.on('task:status-changed', applyTaskChange);
    socket.on('task:deleted', (payload) => {
      queryClient.setQueriesData({ predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === 'tasks' }, (current = []) => {
        if (!Array.isArray(current)) return [];
        return current.filter((item) => item._id !== payload._id);
      });
      if (selectedTask?._id === payload._id) {
        setSelectedTask(null);
      }
    });
    socket.on('task:subtasks-updated', applyTaskChange);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('task:created', applyTaskChange);
      socket.off('task:updated', applyTaskChange);
      socket.off('task:status-changed', applyTaskChange);
      socket.off('task:deleted');
      socket.off('task:subtasks-updated', applyTaskChange);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [queryClient, selectedTask]);

  useEffect(() => {
    if (!socketRef.current) return;

    if (filters.project) {
      socketRef.current.emit('join-project', filters.project);
    }

    return () => {
      if (filters.project) {
        socketRef.current.emit('leave-project', filters.project);
      }
    };
  }, [filters.project]);

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: '',
      priority: '',
      project: '',
      tag: '',
      startDate: '',
      endDate: '',
      sort: 'createdAt',
      order: 'desc',
    });
    setSearch('');
  };

  const handleCreateProject = async (event) => {
    event.preventDefault();
    const name = window.prompt('Project name');
    if (!name?.trim()) return;

    const response = await api.post('/api/projects', { name: name.trim() });
    const project = response.data;
    queryClient.setQueryData(['projects'], (current = []) => [project, ...current]);
    handleFilterChange('project', project._id);
  };

  const handleCreateTag = async (payload) => {
    const response = await api.post('/api/tags', {
      ...payload,
      project: filters.project || projects[0]?._id || '',
    });
    const tag = response.data;
    queryClient.setQueryData(['tags', filters.project || ''], (current = []) => [...current, tag]);
  };

  const handleUpdateTag = async (id, payload) => {
    const response = await api.put(`/api/tags/${id}`, payload);
    const updatedTag = response.data;
    queryClient.setQueryData(['tags', filters.project || ''], (current = []) => current.map((tag) => (tag._id === id ? updatedTag : tag)));
  };

  const handleDeleteTag = async (id) => {
    await api.delete(`/api/tags/${id}`);
    queryClient.setQueryData(['tags', filters.project || ''], (current = []) => current.filter((tag) => tag._id !== id));
  };

  const handleUpdateTask = async (taskId, payload) => {
    const response = await api.put(`/api/tasks/${taskId}`, payload);

    const updatedTask = response.data;
    queryClient.setQueriesData({ predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === 'tasks' }, (current = []) => {
      if (!Array.isArray(current)) return [];
      return current.map((task) => (task._id === taskId ? updatedTask : task));
    });
    return updatedTask;
  };

  const handleCreateTask = async (payload) => {
    const response = await api.post('/api/tasks', payload);

    const task = response.data;
    queryClient.setQueriesData({ predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === 'tasks' }, (current = []) => {
      if (!Array.isArray(current)) return [task];
      return [task, ...current.filter((item) => item._id !== task._id)];
    });
    return task;
  };

  return (
    <div className="min-h-screen bg-surface-alt p-4 md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <div className="rounded-md border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold text-text-primary">Dashboard</h1>
              <p className="mt-1 text-sm text-text-secondary">Search, filter, and organize your tasks.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link to="/analytics" className="rounded-md border border-border bg-surface-alt px-3 py-2 text-sm text-text-secondary">Analytics</Link>
              <Link to="/settings" className="rounded-md border border-border bg-surface-alt px-3 py-2 text-sm text-text-secondary">Settings</Link>
              <div className="flex items-center gap-2 rounded-full border border-border bg-surface-alt px-2.5 py-1 text-xs text-text-secondary">
                <span className={`h-2.5 w-2.5 rounded-full ${socketConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                <span className="hidden sm:inline">Live</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="space-y-3">
            <ProjectSidebar
              projects={projects}
              activeProjectId={filters.project}
              onSelectProject={(projectId) => handleFilterChange('project', projectId)}
              onCreateProject={handleCreateProject}
            />
          </div>
          <div className="space-y-4">
            <SearchBar value={search} onChange={setSearch} />
            <FilterBar filters={filters} tags={tags} projects={projects} onFilterChange={handleFilterChange} onReset={handleResetFilters} />
            <div className="rounded-md border border-border bg-surface p-4">
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-lg font-semibold text-text-primary">Tasks</h2>
                  <span className="rounded-full border border-border bg-surface-alt px-2.5 py-1 text-xs text-text-secondary">{tasks.length} items</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => setIsCreateOpen(true)} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-hover">
                    Add task
                  </button>
                  <div className="inline-flex rounded-md border border-border bg-surface-alt p-1">
                    {['list', 'calendar'].map((option) => (
                      <button
                        key={option}
                        onClick={() => setView(option)}
                        className={`rounded-md px-3 py-1 text-sm capitalize ${view === option ? 'bg-primary text-white' : 'text-text-secondary'}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {view === 'calendar' ? (
                <CalendarView tasks={tasks} onSelectTask={setSelectedTask} />
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task._id}
                      className="w-full rounded-md border border-border bg-surface-alt p-3 text-left"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <button onClick={() => setSelectedTask(task)} className="min-w-0 flex-1 text-left">
                          <h3 className="font-display text-base font-semibold text-text-primary">{task.title}</h3>
                          <p className="mt-1 text-sm text-text-secondary">{task.description || 'No description yet.'}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full border border-border px-2 py-1 text-xs text-text-secondary">{task.status}</span>
                            {task.tags?.map((tag) => (
                              <span key={tag} className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">{tag}</span>
                            ))}
                          </div>
                        </button>
                        <div className="flex items-center gap-3 text-sm text-text-secondary">
                          <div className="text-right">
                            <div className="font-medium text-text-primary">{task.priority}</div>
                            <div>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</div>
                          </div>
                          <label className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-2 py-1 text-xs">
                            <input
                              type="checkbox"
                              checked={task.status === 'done'}
                              onChange={async (event) => {
                                const nextStatus = event.target.checked ? 'done' : 'todo';
                                const updatedTask = await handleUpdateTask(task._id, { status: nextStatus });
                                queryClient.setQueriesData({ predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === 'tasks' }, (current = []) => {
                                  if (!Array.isArray(current)) return [];
                                  return current.map((item) => (item._id === task._id ? updatedTask : item));
                                });
                              }}
                            />
                            Done
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedTask ? <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} /> : null}
            <CreateTaskModal
              isOpen={isCreateOpen}
              onClose={() => setIsCreateOpen(false)}
              onCreate={handleCreateTask}
              projects={projects}
              tags={tags}
              defaultProjectId={filters.project || projects[0]?._id || ''}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
