import { Filter, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';

const FilterBar = ({ filters, tags, projects, onFilterChange, onReset }) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateScreen = () => setIsMobile(window.innerWidth < 768);
    updateScreen();
    window.addEventListener('resize', updateScreen);
    return () => window.removeEventListener('resize', updateScreen);
  }, []);

  const renderControls = () => (
    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
      <label className="flex flex-col gap-1 text-sm text-text-secondary">
        <span>Status</span>
        <select
          value={filters.status}
          onChange={(event) => onFilterChange('status', event.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-text-primary outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In progress</option>
          <option value="done">Done</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-text-secondary">
        <span>Priority</span>
        <select
          value={filters.priority}
          onChange={(event) => onFilterChange('priority', event.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-text-primary outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-text-secondary">
        <span>Project</span>
        <select
          value={filters.project}
          onChange={(event) => onFilterChange('project', event.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-text-primary outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All projects</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-text-secondary">
        <span>Tag</span>
        <select
          value={filters.tag}
          onChange={(event) => onFilterChange('tag', event.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-text-primary outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All tags</option>
          {tags.map((tag) => (
            <option key={tag._id} value={tag.name}>
              {tag.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-text-secondary">
        <span>Start date</span>
        <input
          type="date"
          value={filters.startDate}
          onChange={(event) => onFilterChange('startDate', event.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-text-primary outline-none focus:ring-2 focus:ring-primary"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-text-secondary">
        <span>End date</span>
        <input
          type="date"
          value={filters.endDate}
          onChange={(event) => onFilterChange('endDate', event.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-text-primary outline-none focus:ring-2 focus:ring-primary"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-text-secondary">
        <span>Sort</span>
        <select
          value={`${filters.sort}:${filters.order}`}
          onChange={(event) => {
            const [sort, order] = event.target.value.split(':');
            onFilterChange('sort', sort);
            onFilterChange('order', order);
          }}
          className="rounded-md border border-border bg-surface px-3 py-2 text-text-primary outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="createdAt:desc">Newest</option>
          <option value="dueDate:asc">Due soon</option>
          <option value="priority:desc">Priority</option>
        </select>
      </label>
    </div>
  );

  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-primary" />
          <h2 className="font-display text-lg font-semibold text-text-primary">Filters</h2>
        </div>
        {isMobile ? (
          <button
            onClick={() => setShowMobileFilters((value) => !value)}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-alt px-3 py-2 text-sm text-text-primary"
          >
            <Filter size={14} />
            Filters
          </button>
        ) : null}
      </div>

      {isMobile ? (
        showMobileFilters ? (
          <div className="space-y-3">
            {renderControls()}
            <button onClick={onReset} className="rounded-md border border-border px-3 py-2 text-sm text-text-secondary">
              Reset filters
            </button>
          </div>
        ) : null
      ) : (
        <div className="space-y-3">
          {renderControls()}
          <button onClick={onReset} className="rounded-md border border-border px-3 py-2 text-sm text-text-secondary">
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
