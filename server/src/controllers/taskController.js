const mongoose = require('mongoose');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');
const { emitTaskEvent } = require('../socket');

exports.getTasks = asyncHandler(async (req, res) => {
  const { status, priority, project, tag, sort = 'createdAt', order = 'desc', search } = req.query;

  const query = {};

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (project) query.project = project;
  if (tag) query.tags = { $in: [tag] };
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const sortOrder = order === 'asc' ? 1 : -1;
  const tasks = await Task.find(query)
    .populate('project', 'name')
    .populate('assignedTo', 'name email')
    .sort({ [sort]: sortOrder });

  res.json(tasks);
});

exports.createTask = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    isRecurring: Boolean(req.body.recurrenceRule),
  };

  const task = await Task.create(payload);
  const populatedTask = await Task.findById(task._id).populate('project', 'name').populate('assignedTo', 'name email');
  emitTaskEvent('task:created', populatedTask);
  res.status(201).json(populatedTask);
});

exports.getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate('project', 'name').populate('assignedTo', 'name email');

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  res.json(task);
});

exports.updateTask = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    isRecurring: req.body.recurrenceRule ? true : req.body.isRecurring || false,
    updatedAt: new Date(),
  };

  if (req.body.status === 'done') {
    payload.completedAt = new Date();
  } else if (req.body.status && req.body.status !== 'done') {
    payload.completedAt = null;
  }

  const task = await Task.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const populatedTask = await Task.findById(task._id).populate('project', 'name').populate('assignedTo', 'name email');
  emitTaskEvent('task:updated', populatedTask);
  if (req.body.status) {
    emitTaskEvent('task:status-changed', populatedTask);
  }
  if (req.body.subtasks) {
    emitTaskEvent('task:subtasks-updated', populatedTask);
  }
  res.json(populatedTask);
});

exports.deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  emitTaskEvent('task:deleted', { _id: req.params.id, project: task.project });
  res.json({ message: 'Task deleted' });
});

exports.searchTasks = asyncHandler(async (req, res) => {
  const { q = '', status, priority, project, tag, sort = 'createdAt', order = 'desc' } = req.query;

  const query = {
    $or: [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ],
  };

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (project) query.project = project;
  if (tag) query.tags = { $in: [tag] };

  const sortOrder = order === 'asc' ? 1 : -1;
  const tasks = await Task.find(query)
    .populate('project', 'name')
    .populate('assignedTo', 'name email')
    .sort({ [sort]: sortOrder });

  res.json(tasks);
});

exports.toggleRecurrence = asyncHandler(async (req, res) => {
  const { recurrenceRule } = req.body;
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { recurrenceRule: recurrenceRule || '', isRecurring: Boolean(recurrenceRule) },
    { new: true, runValidators: true }
  );

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const populatedTask = await Task.findById(task._id).populate('project', 'name').populate('assignedTo', 'name email');
  emitTaskEvent('task:updated', populatedTask);
  emitTaskEvent('task:subtasks-updated', populatedTask);
  res.json(populatedTask);
});

exports.getAnalytics = asyncHandler(async (req, res) => {
  const projectId = req.query.project;
  const match = projectId ? { project: new mongoose.Types.ObjectId(projectId) } : {};
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - 13);
  const weekStart = new Date();
  weekStart.setDate(now.getDate() - 6);

  const [completionTrend, statusBreakdown, priorityBreakdown, burndownData] = await Promise.all([
    Task.aggregate([
      {
        $match: {
          ...match,
          status: 'done',
          completedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          completed: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Task.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Task.aggregate([
      { $match: match },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Task.aggregate([
      {
        $match: {
          ...match,
          createdAt: { $gte: startDate },
        },
      },
      {
        $facet: {
          createdSeries: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                created: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          completedSeries: [
            {
              $match: { status: 'done' },
            },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
                completed: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]),
  ]);

  const dateRange = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (13 - index));
    return date.toISOString().split('T')[0];
  });

  const completionMap = Object.fromEntries(completionTrend.map((entry) => [entry._id, entry.completed]));
  const completionSeries = dateRange.map((date) => ({
    date,
    completed: completionMap[date] || 0,
  }));

  const createdMap = Object.fromEntries((burndownData[0]?.createdSeries || []).map((entry) => [entry._id, entry.created]));
  const completedMap = Object.fromEntries((burndownData[0]?.completedSeries || []).map((entry) => [entry._id, entry.completed]));

  let cumulativeCreated = 0;
  let cumulativeCompleted = 0;
  const burndownSeries = dateRange.map((date) => {
    cumulativeCreated += createdMap[date] || 0;
    cumulativeCompleted += completedMap[date] || 0;

    return {
      date,
      remaining: Math.max(0, cumulativeCreated - cumulativeCompleted),
    };
  });

  const [totalTasks, completedCount, overdueCount] = await Promise.all([
    Task.countDocuments(match),
    Task.countDocuments({ ...match, status: 'done' }),
    Task.countDocuments({ ...match, status: { $ne: 'done' }, dueDate: { $lt: now } }),
  ]);

  const completedThisWeek = await Task.countDocuments({
    ...match,
    status: 'done',
    completedAt: { $gte: weekStart },
  });

  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  res.json({
    summary: {
      totalTasks,
      completedThisWeek,
      overdueCount,
      completionRate,
    },
    completionSeries,
    statusBreakdown,
    priorityBreakdown,
    burndownSeries,
  });
});
