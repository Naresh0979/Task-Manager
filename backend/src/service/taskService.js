const Task = require('../models/Task');
const { extractSheetId, fetchSheetData } = require('../utils/sheetsExtractor');

async function importTasksFromSheet(sheetUrl) {
  if (!sheetUrl) {
    throw { status: 400, message: 'Google Sheet URL is required' };
  }

  const sheetId = extractSheetId(sheetUrl);
  if (!sheetId) {
    throw { status: 400, message: 'Invalid Google Sheet URL' };
  }

  const tasks = await fetchSheetData(sheetId);

  const bulkTasks = [];
  const skippedTasks = [];

  for (const task of tasks) {
  
    bulkTasks.push({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      completed: task.completed || false
    });

  }

  let savedTasks = [];
  let errors = [];

  if (bulkTasks.length > 0) {
    try {
      savedTasks = await Task.bulkCreate(bulkTasks); // Faster: bulk insert
    } catch (error) {
      errors.push({ task: 'Bulk Insert', error: error.message });
    }
  }

  return {
    message: `Imported ${savedTasks.length} tasks successfully${skippedTasks.length > 0 ? `, skipped ${skippedTasks.length} duplicates` : ''}`,
    tasks: savedTasks,
    skippedTasks: skippedTasks.length > 0 ? skippedTasks : undefined,
    errors: errors.length > 0 ? errors : undefined
  };
}


async function getAllTasks(page = 1, limit = 10) {
  return await Task.findAll({ page, limit });
}

async function createNewTask(taskData) {
  Task.validate(taskData);
  return await Task.create(taskData);
}

async function updateExistingTask(id, updatedData) {
  const existingTask = await Task.findById(id);
  if (!existingTask) {
    throw { status: 404, message: 'Task not found' };
  }

  if (updatedData.title) {
    Task.validate({ ...existingTask, ...updatedData });
  }

  return await Task.update(id, updatedData);
}

async function deleteTaskById(id) {
  const existingTask = await Task.findById(id);
  if (!existingTask) {
    throw { status: 404, message: 'Task not found' };
  }

  await Task.delete(id);
  return { message: 'Task deleted successfully' };
}

module.exports = {
  importTasksFromSheet,
  getAllTasks,
  createNewTask,
  updateExistingTask,
  deleteTaskById
};
