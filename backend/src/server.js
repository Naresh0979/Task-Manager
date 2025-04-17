const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database config
const { initDb } = require('./config/db');

// Import routes
const taskRoutes = require('./routes/taskRoutes');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDb()
  .then(() => {
    console.log('Database connected and initialized');
  })
  .catch(err => {
    console.error('Could not initialize database', err);
    process.exit(1);
  });

// Routes
app.use('/api', taskRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('Task Manager API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 