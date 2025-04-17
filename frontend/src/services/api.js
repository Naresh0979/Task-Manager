import axios from 'axios';

const API_URL = '/api';

// Task API calls
export const getTasks = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/tasks`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await axios.post(`${API_URL}/tasks`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (id, taskData) => {
  try {
    const response = await axios.put(`${API_URL}/tasks/${id}`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/tasks/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Google Sheets import
export const importTasksFromSheet = async (sheetUrl) => {
  try {
    const response = await axios.post(`${API_URL}/import`, { sheetUrl });
    return response.data;
  } catch (error) {
    console.error('Error importing tasks from sheet:', error);
    throw error;
  }
}; 