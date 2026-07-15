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
  };

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
