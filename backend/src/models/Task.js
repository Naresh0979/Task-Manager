const { dbConnectionPool } = require('../config/db');

/**
 * Format date for MySQL DATE column
 * @param {Date|string} date - The date to format
 * @returns {string|null} Formatted date or null
 */
const formatDate = (date) => {
  if (!date) return null;
  
  let dateObj;
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  // Check if valid date
  if (isNaN(dateObj.getTime())) return null;
  
  // Format as YYYY-MM-DD for DATE column type
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Find all tasks with pagination
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (starts from 1)
 * @param {number} options.limit - Number of items per page
 * @returns {Promise<Object>} Object containing tasks array and pagination metadata
 */
const findAll = async (options = {}) => {
  try {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;
    
    // Get total count
    const [countResult] = await dbConnectionPool.query('SELECT COUNT(*) as total FROM tasks');
    const total = countResult[0].total;
    
    // Get paginated tasks
    const [rows] = await dbConnectionPool.query(`
      SELECT 
        id, title, description, due_date as dueDate, completed,
        created_at as createdAt, updated_at as updatedAt
      FROM tasks
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
    
    return {
      tasks: rows,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Find task by ID
 * @param {number} id - Task ID
 * @returns {Promise<Object>} Task object
 */
const findById = async (id) => {
  try {
    const [rows] = await dbConnectionPool.query(`
      SELECT 
        id, title, description, due_date as dueDate, completed,
        created_at as createdAt, updated_at as updatedAt
      FROM tasks
      WHERE id = ?
    `, [id]);
    
    return rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new task
 * @param {Object} taskData - Task data
 * @returns {Promise<Object>} Created task
 */
const create = async (taskData) => {
  try {
    const {
      title,
      description,
      dueDate,
      completed = false
    } = taskData;
    
    const formattedDueDate = formatDate(dueDate);
    
    const [result] = await dbConnectionPool.query(`
      INSERT INTO tasks
      (title, description, due_date, completed)
      VALUES (?, ?, ?, ?)
    `, [
      title,
      description || null,
      formattedDueDate,
      completed ? 1 : 0
    ]);
    
    const id = result.insertId;
    return findById(id);
  } catch (error) {
    throw error;
  }
};

/**
 * Update a task
 * @param {number} id - Task ID
 * @param {Object} taskData - Updated task data
 * @returns {Promise<Object>} Updated task
 */
const update = async (id, taskData) => {
  try {
    const updateFields = [];
    const values = [];
    
    // Copy and modify taskData to handle date format
    const processedData = { ...taskData };
    if (processedData.dueDate) {
      processedData.dueDate = formatDate(processedData.dueDate);
    }
    
    for (const [key, value] of Object.entries(processedData)) {
      // Convert camelCase to snake_case
      const field = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      
      // Skip fields that don't exist in the table
      if (!['title', 'description', 'due_date', 'completed'].includes(field)) {
        continue;
      }
      
      // For boolean values, convert to 0/1
      if (typeof value === 'boolean') {
        updateFields.push(`${field} = ?`);
        values.push(value ? 1 : 0);
      } else {
        updateFields.push(`${field} = ?`);
        values.push(value === undefined ? null : value);
      }
    }
    
    if (updateFields.length === 0) {
      return findById(id);
    }
    
    values.push(id);
    
    await dbConnectionPool.query(`
      UPDATE tasks
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, values);
    
    return findById(id);
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a task
 * @param {number} id - Task ID
 * @returns {Promise<boolean>} Success status
 */
const deleteTask = async (id) => {
  try {
    const [result] = await dbConnectionPool.query('DELETE FROM tasks WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Find a task by sheet ID and row index or create it if it doesn't exist
 * @param {Object} criteria - Search criteria
 * @param {Object} taskData - Task data to create if not found
 * @returns {Promise<Object>} Task object
 */
const findOneAndUpdate = async (criteria, taskData) => {
  try {
    // Check if task exists
    const { sheetId, rowIndex } = criteria;
    
    const [existingTasks] = await dbConnectionPool.query(`
      SELECT id FROM tasks
      WHERE sheet_id = ? AND row_index = ?
    `, [sheetId, rowIndex]);
    
    if (existingTasks.length > 0) {
      // Update existing task
      return update(existingTasks[0].id, taskData);
    } else {
      // Create new task
      return create(taskData);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Validates task data
 * @param {Object} taskData - Task data to validate
 * @throws {Error} Validation error
 */
const validate = (taskData) => {
  const { title } = taskData;
  
  if (!title || title.trim() === '') {
    throw new Error('Title is required');
  }
  
  if (title.length > 100) {
    throw new Error('Title cannot be more than 100 characters');
  }
  
  if (taskData.description && taskData.description.length > 500) {
    throw new Error('Description cannot be more than 500 characters');
  }
  
  return true;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  delete: deleteTask, // Renamed because 'delete' is a reserved keyword
  findOneAndUpdate,
  validate,
  formatDate
}; 