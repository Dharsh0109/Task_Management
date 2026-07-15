import { Plus, Tag as TagIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';

const TagManager = ({ tags, onCreateTag, onUpdateTag, onDeleteTag }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#4F46E5');
  const [editingId, setEditingId] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!name.trim()) return;

    if (editingId) {
      onUpdateTag(editingId, { name: name.trim(), color });
      setEditingId('');
    } else {
      onCreateTag({ name: name.trim(), color });
    }

    setName('');
    setColor('#4F46E5');
  };

  const startEdit = (tag) => {
    setEditingId(tag._id);
    setName(tag.name);
    setColor(tag.color || '#4F46E5');
  };

  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <TagIcon size={16} className="text-primary" />
        <h2 className="font-display text-lg font-semibold text-text-primary">Tags</h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-md border border-border bg-surface-alt px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary"
          placeholder="Tag name"
        />
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
            className="h-9 w-12 cursor-pointer rounded-md border border-border bg-surface"
          />
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-hover">
            <Plus size={14} />
            {editingId ? 'Save tag' : 'Add tag'}
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {tags.map((tag) => (
          <div key={tag._id} className="flex items-center justify-between rounded-md border border-border bg-surface-alt px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: tag.color || '#4F46E5' }} />
              <span className="text-sm text-text-primary">{tag.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => startEdit(tag)} className="text-sm text-primary">
                Edit
              </button>
              <button onClick={() => onDeleteTag(tag._id)} className="text-danger">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagManager;
