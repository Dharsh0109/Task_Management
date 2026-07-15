import { X } from 'lucide-react';

const TaskDetailModal = ({ task, onClose }) => {
  if (!task) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 p-4">
      <div className="w-full max-w-lg rounded-md border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-text-primary">{task.title}</h3>
            <p className="mt-1 text-sm text-text-secondary">{task.description || 'No description provided.'}</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-text-secondary">
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 grid gap-3 text-sm text-text-secondary sm:grid-cols-2">
          <div>
            <span className="block font-medium text-text-primary">Status</span>
            <span>{task.status}</span>
          </div>
          <div>
            <span className="block font-medium text-text-primary">Priority</span>
            <span>{task.priority}</span>
          </div>
          <div>
            <span className="block font-medium text-text-primary">Due date</span>
            <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</span>
          </div>
          <div>
            <span className="block font-medium text-text-primary">Project</span>
            <span>{task.project?.name || 'Unassigned'}</span>
          </div>
          <div>
            <span className="block font-medium text-text-primary">Tags</span>
            <span>{task.tags?.length ? task.tags.join(', ') : 'None'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
