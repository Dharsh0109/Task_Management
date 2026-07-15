const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');

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
  res.status(201).json(task);
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

  res.json(task);
});

exports.deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

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

  res.json(task);
});
