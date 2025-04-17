const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool 
const dbConnectionPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'task_manager',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database tables
const initDb = async () => {
  try {
    const connection = await dbConnectionPool.getConnection();
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        due_date DATE,
        completed BOOLEAN DEFAULT false
      )
    `);
    
    console.log('Database initialized successfully with simplified schema');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

module.exports = {
  dbConnectionPool,
  initDb
}; 