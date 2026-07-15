import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useMemo, useState } from 'react';
import { CheckCircle2, CircleDashed, LoaderCircle, MoveRight, Repeat2 } from 'lucide-react';

const columns = [
  { key: 'todo', title: 'To Do', icon: CircleDashed },
  { key: 'in-progress', title: 'In Progress', icon: LoaderCircle },
  { key: 'done', title: 'Done', icon: CheckCircle2 },
];

const KanbanBoard = ({ tasks, onUpdateTask }) => {
  const [localTasks, setLocalTasks] = useState(tasks);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const groupedTasks = useMemo(() => {
    const grouped = columns.reduce((acc, column) => {
      acc[column.key] = localTasks.filter((task) => task.status === column.key);
      return acc;
    }, {});

    return grouped;
  }, [localTasks]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const nextStatus = over.data?.current?.status || over.id;
    const taskId = active.id;
    const previousTasks = localTasks;

    const updatedTasks = localTasks.map((task) => (task._id === taskId ? { ...task, status: nextStatus } : task));
    setLocalTasks(updatedTasks);

    try {
      await onUpdateTask(taskId, { status: nextStatus });
    } catch (error) {
      setLocalTasks(previousTasks);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-text-secondary">Drag cards between columns to update status.</div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 md:overflow-visible">
          {columns.map((column) => {
            const Icon = column.icon;
            return (
              <div key={column.key} className="min-w-[280px] flex-1 rounded-md border border-border bg-surface p-3 md:min-w-0">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="text-primary" />
                    <h3 className="font-display text-base font-semibold text-text-primary">{column.title}</h3>
                  </div>
                  <span className="rounded-md border border-border bg-surface-alt px-2 py-1 text-xs text-text-secondary">
                    {groupedTasks[column.key].length}
                  </span>
                </div>
                <div className="space-y-2">
                  {groupedTasks[column.key].map((task) => (
                    <TaskCard key={task._id} task={task} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DndContext>
  );
};

const TaskCard = ({ task }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useDraggable({
    id: task._id,
    data: { task, status: task.status },
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab rounded-md border border-border bg-surface-alt p-3 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-display text-sm font-semibold text-text-primary">{task.title}</h4>
            {task.isRecurring ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                <Repeat2 size={11} />
                {task.recurrenceRule || 'repeat'}
              </span>
            ) : null}
          </div>
          <p className="mt-1 truncate text-sm text-text-secondary">{task.description}</p>
        </div>
        <MoveRight size={14} className="shrink-0 text-primary" />
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
        <span>{task.priority}</span>
        <span className="truncate">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
      </div>
    </div>
  );
};

function useDraggable(config) {
  const { attributes, listeners, setNodeRef, transform, transition } = require('@dnd-kit/core').useDraggable(config);
  return { attributes, listeners, setNodeRef, transform, transition };
}

export default KanbanBoard;
