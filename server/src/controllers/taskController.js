exports.getTasks = async (req, res, next) => {
  try {
    res.json({ message: 'Task controller ready' });
  } catch (error) {
    next(error);
  }
};
