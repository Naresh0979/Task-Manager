const Task = require('../models/Task');
const { extractSheetId, fetchSheetData } = require('../utils/sheetsExtractor');

// Import tasks from Google Sheet
exports.importTasks = async (req, res) => {
  try {
    const { sheetUrl } = req.body;
    
    // Validate input
    if (!sheetUrl) {
      return res.status(400).json({ message: 'Google Sheet URL is required' });
    }
    
    // Extract sheet ID
    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) {
      return res.status(400).json({ message: 'Invalid Google Sheet URL' });
    }
    
    // Fetch data from sheet
    const tasks = await fetchSheetData(sheetId);
    
    // Get existing tasks to check for duplicates
    const result = await Task.findAll();
    const existingTasks = result.tasks || [];
    const existingTitles = new Set(existingTasks.map(task => task.title.toLowerCase().trim()));
    
    // Save tasks to database
    const savedTasks = [];
    const skippedTasks = [];
    const errors = [];
    
    for (const task of tasks) {
      try {
        // Check for duplicates based on title
        const normalizedTitle = task.title.toLowerCase().trim();
        if (existingTitles.has(normalizedTitle)) {
          skippedTasks.push({ title: task.title, reason: 'Duplicate task title' });
          continue;
        }
        
        // Simplify task object to match new schema
        const simplifiedTask = {
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          completed: task.completed || false
        };

        // Create task directly
        const savedTask = await Task.create(simplifiedTask);
        savedTasks.push(savedTask);
        
        // Add to set of existing titles to prevent duplicates within the current import batch
        existingTitles.add(normalizedTitle);
      } catch (error) {
        errors.push({ task: task.title, error: error.message });
      }
    }
    
    res.status(201).json({
      message: `Imported ${savedTasks.length} tasks successfully${skippedTasks.length > 0 ? `, skipped ${skippedTasks.length} duplicates` : ''}`,
      tasks: savedTasks,
      skippedTasks: skippedTasks.length > 0 ? skippedTasks : undefined,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Import Error:', error);
    res.status(500).json({ message: 'Failed to import tasks', error: error.message });
  }
};

// Get all tasks
exports.getTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await Task.findAll({ page, limit });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  try {
    // Validate task data
    Task.validate(req.body);
    
    // Create task
    const savedTask = await Task.create(req.body);
    res.status(201).json(savedTask);
  } catch (error) {
    if (error.message.includes('required') || error.message.includes('cannot be')) {
      return res.status(400).json({ message: 'Validation error', errors: { message: error.message } });
    }
    res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if task exists
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Validate task data if title is being updated
    if (req.body.title) {
      Task.validate({ ...existingTask, ...req.body });
    }
    
    // Update task
    const task = await Task.update(id, req.body);
    res.status(200).json(task);
  } catch (error) {
    if (error.message.includes('required') || error.message.includes('cannot be')) {
      return res.status(400).json({ message: 'Validation error', errors: { message: error.message } });
    }
    res.status(500).json({ message: 'Failed to update task', error: error.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if task exists
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Delete task
    await Task.delete(id);
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
}; 