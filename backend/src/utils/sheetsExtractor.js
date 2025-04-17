const axios = require('axios');
const validator = require('validator');
const { parse } = require('csv-parse/sync');

/**
 * Extract the sheet ID from a Google Sheets URL
 * @param {string} url - The Google Sheets URL
 * @returns {string|null} - The extracted sheet ID or null if invalid
 */
const extractSheetId = (url) => {
  // Validate that input is a URL
  if (!validator.isURL(url)) {
    return null;
  }

  // Check if it's a Google Sheets URL
  if (!url.includes('docs.google.com/spreadsheets')) {
    return null;
  }

  // Extract the sheet ID from the URL
  const matches = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (matches && matches[1]) {
    return matches[1];
  }

  return null;
};

/**
 * Parse a date string in various formats
 * @param {string} dateStr - The date string to parse
 * @returns {Date|null} - A valid Date object or null if invalid
 */
const parseDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  // Clean the input
  const cleanDateStr = dateStr.trim();
  if (!cleanDateStr) return null;
  
  // Try to parse with built-in Date
  const date = new Date(cleanDateStr);
  
  // Check if valid date
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  // For formats that JS Date doesn't handle well, try manual parsing
  const formats = [
    // MM/DD/YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    // DD-MM-YYYY
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/
  ];
  
  for (const regex of formats) {
    const match = cleanDateStr.match(regex);
    if (match) {
      const [_, part1, part2, year] = match;
      
      // Try as MM/DD/YYYY first
      let parsed = new Date(parseInt(year), parseInt(part1) - 1, parseInt(part2));
      
      // If not valid, try as DD/MM/YYYY
      if (isNaN(parsed.getTime())) {
        parsed = new Date(parseInt(year), parseInt(part2) - 1, parseInt(part1));
      }
      
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }
  
  return null;
};

/**
 * Fetch data from a Google Sheet
 * @param {string} sheetId - The Google Sheet ID
 * @returns {Promise<Array>} - Promise resolving to array of tasks
 */
const fetchSheetData = async (sheetId) => {
  try {
    // Use the Google Sheets API to get data in CSV format
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    const response = await axios.get(url);
    
    // Parse CSV data using csv-parse library
    const rows = parse(response.data, {
      columns: false,
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true
    });
    
    // First row contains headers
    const headers = rows[0];
    
    // Find indices for required fields
    const titleIndex = headers.findIndex(h => h.toLowerCase() === 'title');
    const descriptionIndex = headers.findIndex(h => h.toLowerCase() === 'description');
    const dueDateIndex = headers.findIndex(h => h.toLowerCase() === 'due date' || h.toLowerCase() === 'duedate');
    const completedIndex = headers.findIndex(h => h.toLowerCase() === 'completed');
    
    // Validate that required fields exist
    if (titleIndex === -1) {
      throw new Error('Sheet must contain a "Title" column');
    }
    
    // Convert rows to task objects
    const tasks = [];
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i];
      
      // Skip if there are not enough values or the title is missing
      if (values.length <= titleIndex || !values[titleIndex].trim()) {
        continue;
      }
      
      const task = {
        title: values[titleIndex] || 'Untitled Task',
      };
      
      // Add optional fields if they exist
      if (descriptionIndex !== -1 && descriptionIndex < values.length) {
        task.description = values[descriptionIndex] || '';
      }
      
      if (dueDateIndex !== -1 && dueDateIndex < values.length && values[dueDateIndex]) {
        const parsedDate = parseDate(values[dueDateIndex]);
        if (parsedDate) {
          task.dueDate = parsedDate;
        }
      }
      
      if (completedIndex !== -1 && completedIndex < values.length) {
        const completedValue = (values[completedIndex] || '').toLowerCase();
        task.completed = completedValue === 'true' || completedValue === 'yes' || completedValue === '1';
      }
      
      tasks.push(task);
    }
    
    return tasks;
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw new Error('Failed to fetch data from Google Sheet');
  }
};

module.exports = {
  extractSheetId,
  fetchSheetData
}; 