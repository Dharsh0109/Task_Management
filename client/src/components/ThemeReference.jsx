import { AlertCircle, CalendarDays, CheckCircle2, Clock3, Plus, Trash2 } from 'lucide-react';

const buttonBase = 'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors';
const cardBase = 'rounded-md border border-border bg-surface p-4';

const ThemeReference = () => {
  return (
    <div className="min-h-screen bg-surface-alt p-6 text-text-primary">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="rounded-md border border-border bg-surface p-6">
          <p className="font-body text-sm font-medium uppercase tracking-[0.2em] text-text-secondary">
            Design system
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-primary">
            Theme Reference
          </h1>
          <p className="mt-3 max-w-2xl font-body text-sm text-text-secondary">
            This screen gathers the core UI tokens for buttons, cards, priorities, and form controls in one place.
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className={`${cardBase} space-y-4`}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-text-primary">Buttons</h2>
              <span className="font-body text-sm text-text-secondary">Primary actions</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className={`${buttonBase} bg-primary text-white hover:bg-primary-hover`}>
                <Plus size={16} />
                Add task
              </button>
              <button className={`${buttonBase} bg-surface text-text-primary`}>View details</button>
              <button className={`${buttonBase} border-danger text-danger hover:bg-surface-alt`}>
                <Trash2 size={16} />
                Delete task
              </button>
            </div>
          </div>

          <div className={`${cardBase} space-y-4`}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-text-primary">Inputs</h2>
              <span className="font-body text-sm text-text-secondary">Form styling</span>
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block font-body text-sm text-text-secondary">Task title</span>
                <input
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 font-body text-sm text-text-primary outline-none transition focus:ring-2 focus:ring-primary"
                  placeholder="Write a task title"
                />
              </label>
              <label className="block">
                <span className="mb-1 block font-body text-sm text-text-secondary">Notes</span>
                <textarea
                  rows="3"
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 font-body text-sm text-text-primary outline-none transition focus:ring-2 focus:ring-primary"
                  placeholder="Add details"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className={`${cardBase} border-l-4 border-priority-low`}>
            <div className="flex items-center gap-2">
              <Clock3 size={16} className="text-priority-low" />
              <h3 className="font-display text-base font-semibold text-text-primary">Low priority</h3>
            </div>
            <p className="mt-2 font-body text-sm text-text-secondary">Uses the slate accent as a subtle left border.</p>
          </div>

          <div className={`${cardBase} border-l-4 border-priority-medium`}>
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-priority-medium" />
              <h3 className="font-display text-base font-semibold text-text-primary">Medium priority</h3>
            </div>
            <p className="mt-2 font-body text-sm text-text-secondary">This keeps the visual weight restrained and consistent.</p>
          </div>

          <div className={`${cardBase} border-l-4 border-priority-high`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-priority-high" />
              <h3 className="font-display text-base font-semibold text-text-primary">High priority</h3>
            </div>
            <p className="mt-2 font-body text-sm text-text-secondary">The rose accent acts as a small signal, not a loud badge.</p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className={`${cardBase} space-y-3`}>
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-primary" />
              <h2 className="font-display text-lg font-semibold text-text-primary">Task card</h2>
            </div>
            <div className="rounded-md border border-border bg-surface-alt p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-base font-semibold text-text-primary">Draft launch checklist</h3>
                  <p className="mt-1 font-body text-sm text-text-secondary">Review the release notes before handoff.</p>
                </div>
                <span className="rounded-md border border-border bg-surface px-2 py-1 font-body text-xs text-text-secondary">
                  Today
                </span>
              </div>
            </div>
          </div>

          <div className={`${cardBase} space-y-3`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-success" />
              <h2 className="font-display text-lg font-semibold text-text-primary">Status states</h2>
            </div>
            <div className="space-y-2">
              <div className="rounded-md border border-border bg-surface px-3 py-2 font-body text-sm text-text-secondary">
                <span className="font-medium text-success">Success:</span> Task completed
              </div>
              <div className="rounded-md border border-border bg-surface px-3 py-2 font-body text-sm text-text-secondary">
                <span className="font-medium text-warning">Warning:</span> Review due date
              </div>
              <div className="rounded-md border border-border bg-surface px-3 py-2 font-body text-sm text-text-secondary">
                <span className="font-medium text-danger">Danger:</span> Blocker needs attention
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ThemeReference;
