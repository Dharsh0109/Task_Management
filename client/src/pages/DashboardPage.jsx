import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProjectSidebar from '../components/ProjectSidebar';
import TagManager from '../components/TagManager';
import FilterBar from '../components/FilterBar';
import SearchBar from '../components/SearchBar';
import KanbanBoard from '../components/KanbanBoard';
import CalendarView from '../components/CalendarView';
import TaskDetailModal from '../components/TaskDetailModal';
import CreateTaskModal from '../components/CreateTaskModal';
import useDebounce from '../hooks/useDebounce';

const DashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [tags, setTags] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState('kanban');
  const [selectedTask, setSelectedTask] = useState(null);
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

  useEffect(() => {
    fetch('http://localhost:5000/api/projects')
      .then((response) => response.json())
      .then((data) => setProjects(data));

    fetch('http://localhost:5000/api/tags?project=')
      .then((response) => response.json())
      .then((data) => setTags(data));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('q', debouncedSearch);
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.project) params.set('project', filters.project);
    if (filters.tag) params.set('tag', filters.tag);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.order) params.set('order', filters.order);

    fetch(`http://localhost:5000/api/tasks/search?${params.toString()}`)
      .then((response) => response.json())
      .then((data) => setTasks(data));
  }, [debouncedSearch, filters]);

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
    setTags((current) => [...current, tag]);
  };

  const handleUpdateTag = async (id, payload) => {
    const response = await fetch(`http://localhost:5000/api/tags/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const updatedTag = await response.json();
    setTags((current) => current.map((tag) => (tag._id === id ? updatedTag : tag)));
  };

  const handleDeleteTag = async (id) => {
    await fetch(`http://localhost:5000/api/tags/${id}`, { method: 'DELETE' });
    setTags((current) => current.filter((tag) => tag._id !== id));
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
    setTasks((current) => current.map((task) => (task._id === taskId ? updatedTask : task)));
  };

  const handleCreateTask = async (payload) => {
    const response = await fetch('http://localhost:5000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const task = await response.json();
    setTasks((current) => [task, ...current]);
  };

  return (
    <div className="min-h-screen bg-surface-alt p-4 md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <div className="rounded-md border border-border bg-surface p-4">
          <h1 className="font-display text-2xl font-semibold text-text-primary">Dashboard</h1>
          <p className="mt-1 text-sm text-text-secondary">Search, filter, and organize your tasks.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <ProjectSidebar projects={projects} activeProjectId={filters.project} onSelectProject={(projectId) => handleFilterChange('project', projectId)} />
          <div className="space-y-4">
            <SearchBar value={search} onChange={setSearch} />
            <FilterBar filters={filters} tags={tags} projects={projects} onFilterChange={handleFilterChange} onReset={handleResetFilters} />
            <TagManager tags={tags} onCreateTag={handleCreateTag} onUpdateTag={handleUpdateTag} onDeleteTag={handleDeleteTag} />
            <div className="rounded-md border border-border bg-surface p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
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
