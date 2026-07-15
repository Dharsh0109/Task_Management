import { useState } from 'react';
import { X, Repeat2 } from 'lucide-react';

const CreateTaskModal = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [recurrenceRule, setRecurrenceRule] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!title.trim()) return;

    onCreate({
      title: title.trim(),
      description: description.trim(),
      priority,
      recurrenceRule,
    });

    setTitle('');
    setDescription('');
    setPriority('medium');
    setRecurrenceRule('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 p-4">
      <div className="w-full max-w-lg rounded-md border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-text-primary">Create task</h3>
            <p className="mt-1 text-sm text-text-secondary">Add a task and optionally make it repeat.</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-text-secondary">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm text-text-secondary">Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-md border border-border bg-surface-alt px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary" />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-text-secondary">Description</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows="3" className="w-full rounded-md border border-border bg-surface-alt px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary" />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm text-text-secondary">Priority</span>
              <select value={priority} onChange={(event) => setPriority(event.target.value)} className="w-full rounded-md border border-border bg-surface-alt px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-text-secondary">Repeat</span>
              <select value={recurrenceRule} onChange={(event) => setRecurrenceRule(event.target.value)} className="w-full rounded-md border border-border bg-surface-alt px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary">
                <option value="">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
          </div>

          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-hover">
            <Repeat2 size={14} />
            Create task
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
