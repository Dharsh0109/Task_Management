const Project = require('../models/Project');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');

exports.getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json(projects);
});

exports.createProject = asyncHandler(async (req, res) => {
  const project = await Project.create({
    ...req.body,
    owner: req.user._id,
    members: req.body.members || [],
  });

  res.status(201).json(project);
});

exports.getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  res.json(project);
});

exports.updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  res.json(project);
});

exports.deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  await Task.deleteMany({ project: req.params.id });
  res.json({ message: 'Project deleted' });
});
