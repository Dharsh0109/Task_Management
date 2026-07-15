import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import ProjectSidebar from '../components/ProjectSidebar';
import TagManager from '../components/TagManager';
import FilterBar from '../components/FilterBar';
import SearchBar from '../components/SearchBar';
import KanbanBoard from '../components/KanbanBoard';
import CalendarView from '../components/CalendarView';
import TaskDetailModal from '../components/TaskDetailModal';
import CreateTaskModal from '../components/CreateTaskModal';
import AnalyticsCharts from '../components/AnalyticsCharts';
import useDebounce from '../hooks/useDebounce';

const DashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const socketRef = useRef(null);
  const [view, setView] = useState('kanban');
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
    const response = await fetch('http://localhost:5000/api/projects');
    if (!response.ok) throw new Error('Failed to load projects');
    return response.json();
  };

  const fetchTags = async () => {
    const response = await fetch('http://localhost:5000/api/tags?project=');
    if (!response.ok) throw new Error('Failed to load tags');
    return response.json();
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

    const response = await fetch(`http://localhost:5000/api/tasks/search?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to load tasks');
    return response.json();
  };

  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects, staleTime: 10000 });
  const { data: tags = [] } = useQuery({ queryKey: ['tags', filters.project || ''], queryFn: fetchTags, staleTime: 10000 });
  const { data: tasks = [] } = useQuery({ queryKey: ['tasks', query], queryFn: fetchTasks, staleTime: 5000 });
  const { data: analytics = { summary: { totalTasks: 0, completedThisWeek: 0, overdueCount: 0, completionRate: 0 }, completionSeries: [], statusBreakdown: [], priorityBreakdown: [], burndownSeries: [] } } = useQuery({
    queryKey: ['analytics', filters.project || ''],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.project) params.set('project', filters.project);
      const response = await fetch(`http://localhost:5000/api/tasks/analytics?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load analytics');
      return response.json();
    },
    staleTime: 10000,
  });

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

  const handleCreateTag = async (payload) => {
    const response = await fetch('http://localhost:5000/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        project: filters.project || projects[0]?._id || '',
      }),
    });
    const tag = await response.json();
    queryClient.setQueryData(['tags', filters.project || ''], (current = []) => [...current, tag]);
  };

  const handleUpdateTag = async (id, payload) => {
    const response = await fetch(`http://localhost:5000/api/tags/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const updatedTag = await response.json();
    queryClient.setQueryData(['tags', filters.project || ''], (current = []) => current.map((tag) => (tag._id === id ? updatedTag : tag)));
  };

  const handleDeleteTag = async (id) => {
    await fetch(`http://localhost:5000/api/tags/${id}`, { method: 'DELETE' });
    queryClient.setQueryData(['tags', filters.project || ''], (current = []) => current.filter((tag) => tag._id !== id));
  };

  const handleUpdateTask = async (taskId, payload) => {
    const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to update task');
    }

    const updatedTask = await response.json();
    queryClient.setQueriesData({ predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === 'tasks' }, (current = []) => {
      if (!Array.isArray(current)) return [];
      return current.map((task) => (task._id === taskId ? updatedTask : task));
    });
    return updatedTask;
  };

  const handleCreateTask = async (payload) => {
    const response = await fetch('http://localhost:5000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const task = await response.json();
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
            <div className="flex items-center gap-2 rounded-full border border-border bg-surface-alt px-2.5 py-1 text-xs text-text-secondary">
              <span className={`h-2.5 w-2.5 rounded-full ${socketConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span className="hidden sm:inline">Live</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <ProjectSidebar projects={projects} activeProjectId={filters.project} onSelectProject={(projectId) => handleFilterChange('project', projectId)} />
          <div className="space-y-4">
            <SearchBar value={search} onChange={setSearch} />
            <FilterBar filters={filters} tags={tags} projects={projects} onFilterChange={handleFilterChange} onReset={handleResetFilters} />
            <TagManager tags={tags} onCreateTag={handleCreateTag} onUpdateTag={handleUpdateTag} onDeleteTag={handleDeleteTag} />
            <div className="rounded-md border border-border bg-surface p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-lg font-semibold text-text-primary">Productivity analytics</h2>
              </div>
              <AnalyticsCharts
                summary={analytics.summary}
                completionSeries={analytics.completionSeries}
                statusBreakdown={analytics.statusBreakdown}
                priorityBreakdown={analytics.priorityBreakdown}
                burndownSeries={analytics.burndownSeries}
              />
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-lg font-semibold text-text-primary">Tasks</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => setIsCreateOpen(true)} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-hover">
                    Add task
                  </button>
                  <div className="inline-flex rounded-md border border-border bg-surface-alt p-1">
                  {['kanban', 'list', 'calendar'].map((option) => (
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

              {view === 'kanban' ? (
                <KanbanBoard tasks={tasks} onUpdateTask={handleUpdateTask} />
              ) : view === 'calendar' ? (
                <CalendarView tasks={tasks} onSelectTask={setSelectedTask} />
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <button
                      key={task._id}
                      onClick={() => setSelectedTask(task)}
                      className="w-full rounded-md border border-border bg-surface-alt p-3 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-base font-semibold text-text-primary">{task.title}</h3>
                        <span className="text-sm text-text-secondary">{task.priority}</span>
                      </div>
                      <p className="mt-1 text-sm text-text-secondary">{task.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedTask ? <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} /> : null}
            <CreateTaskModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreate={handleCreateTask} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
