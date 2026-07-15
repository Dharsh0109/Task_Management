const Tag = require('../models/Tag');
const asyncHandler = require('../utils/asyncHandler');

exports.getTags = asyncHandler(async (req, res) => {
  const query = req.query.project ? { project: req.query.project } : {};
  const tags = await Tag.find(query).sort({ name: 1 });
  res.json(tags);
});

exports.createTag = asyncHandler(async (req, res) => {
  const tag = await Tag.create({
    ...req.body,
    project: req.body.project,
  });

  res.status(201).json(tag);
});

exports.updateTag = asyncHandler(async (req, res) => {
  const tag = await Tag.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tag) {
    return res.status(404).json({ message: 'Tag not found' });
  }

  res.json(tag);
});

exports.deleteTag = asyncHandler(async (req, res) => {
  const tag = await Tag.findByIdAndDelete(req.params.id);

  if (!tag) {
    return res.status(404).json({ message: 'Tag not found' });
  }

  res.json({ message: 'Tag deleted' });
});
