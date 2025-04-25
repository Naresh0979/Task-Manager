const taskService = require('../services/taskService');

// Import tasks
exports.importTasks = async (req, res) => {
  try {
    const result = await taskService.importTasksFromSheet(req.body.sheetUrl);
    res.status(201).json(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Failed to import tasks' });
  }
};

// Get all tasks
exports.getTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await taskService.getAllTasks(page, limit);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
};

// Create a task
exports.createTask = async (req, res) => {
  try {
    const savedTask = await taskService.createNewTask(req.body);
    res.status(201).json(savedTask);
  } catch (error) {
    const status = error.message.includes('required') || error.message.includes('cannot be') ? 400 : 500;
    res.status(status).json({ message: 'Validation error', errors: { message: error.message } });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const task = await taskService.updateExistingTask(req.params.id, req.body);
    res.status(200).json(task);
  } catch (error) {
    const status = error.status || (error.message.includes('required') ? 400 : 500);
    res.status(status).json({ message: error.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const result = await taskService.deleteTaskById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
};
