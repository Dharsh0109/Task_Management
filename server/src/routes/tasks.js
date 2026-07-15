const express = require('express');
const {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  searchTasks,
  toggleRecurrence,
} = require('../controllers/taskController');

const router = express.Router();

router.get('/search', searchTasks);
router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.put('/:id/recurrence', toggleRecurrence);
router.delete('/:id', deleteTask);

module.exports = router;
