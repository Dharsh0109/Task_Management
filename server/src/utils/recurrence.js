const cron = require('node-cron');
const Task = require('../models/Task');

const addDays = (date, amount) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const addWeeks = (date, amount) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount * 7);
  return next;
};

const addMonths = (date, amount) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount);
  return next;
};

const getNextDueDate = (dueDate, recurrenceRule) => {
  const baseDate = dueDate ? new Date(dueDate) : new Date();

  switch (recurrenceRule) {
    case 'daily':
      return addDays(baseDate, 1);
    case 'weekly':
      return addWeeks(baseDate, 1);
    case 'monthly':
      return addMonths(baseDate, 1);
    default:
      return null;
  }
};

const createRecurringTaskOccurrences = async () => {
  const today = new Date();
  const tasks = await Task.find({ isRecurring: true, recurrenceRule: { $in: ['daily', 'weekly', 'monthly'] } });

  for (const task of tasks) {
    const shouldCreateNext = task.status === 'done' || (task.dueDate && new Date(task.dueDate) < today);

    if (!shouldCreateNext) continue;

    const nextDueDate = getNextDueDate(task.dueDate || today, task.recurrenceRule);

    if (!nextDueDate) continue;

    await Task.create({
      title: task.title,
      description: task.description,
      dueDate: nextDueDate,
      priority: task.priority,
      status: 'todo',
      project: task.project,
      assignedTo: task.assignedTo,
      tags: task.tags,
      subtasks: task.subtasks,
      isRecurring: true,
      recurrenceRule: task.recurrenceRule,
    });
  }
};

const startRecurrenceJob = () => {
  cron.schedule('0 0 * * *', async () => {
    await createRecurringTaskOccurrences();
  });
};

module.exports = { startRecurrenceJob, createRecurringTaskOccurrences };
