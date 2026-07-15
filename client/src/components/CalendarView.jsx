import { useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const priorityColors = {
  low: '#64748B',
  medium: '#B7791F',
  high: '#BE123C',
};

const CalendarView = ({ tasks, onSelectTask }) => {
  const [view, setView] = useState('month');

  const events = useMemo(
    () =>
      tasks
        .filter((task) => task.dueDate)
        .map((task) => ({
          id: task._id,
          title: task.title,
          start: new Date(task.dueDate),
          end: new Date(task.dueDate),
          allDay: true,
          resource: task,
          color: priorityColors[task.priority] || priorityColors.medium,
        })),
    [tasks]
  );

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: event.color,
      borderColor: event.color,
      color: 'white',
      borderRadius: '0.375rem',
      border: 'none',
      padding: '2px 6px',
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-text-secondary">Click a task to view details.</div>
        <div className="inline-flex rounded-md border border-border bg-surface p-1">
          {['month', 'week', 'agenda'].map((option) => (
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

      <div className="rounded-md border border-border bg-surface p-3">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          onSelectEvent={(event) => onSelectTask(event.resource)}
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'agenda']}
          className="min-h-[500px]"
        />
      </div>
    </div>
  );
};

export default CalendarView;
