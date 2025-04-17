import React, { useState, useEffect, useImperativeHandle } from 'react';
import { Box, Container, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import { getTasks, createTask, updateTask, deleteTask } from '../services/api';
import { useTheme, useMediaQuery } from '@mui/material';

function TaskContainer({ onNotify, refreshRef }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State management
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  // Expose refresh function to parent
  useEffect(() => {
    if (refreshRef) {
      refreshRef.current = (action) => {
        if (action === 'add') {
          handleAddTask();
        } else {
          fetchTasks();
        }
      };
    }
    return () => {
      if (refreshRef) {
        refreshRef.current = null;
      }
    };
  }, [refreshRef]);

  // Fetch tasks from API on component mount
  useEffect(() => {
    fetchTasks();
  }, [pagination.page]); // Refetch when page changes

  // Fetch all tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const result = await getTasks(pagination.page, pagination.limit);
      setTasks(result.tasks);
      setPagination(result.pagination);
    } catch (error) {
      onNotify('Failed to load tasks. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Task management
  const handleAddTask = () => {
    setCurrentTask(null);
    setDialogOpen(true);
  };

  const handleEditTask = (task) => {
    setCurrentTask(task);
    setDialogOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (taskData.id) {
        // Update existing task
        const updatedTask = await updateTask(taskData.id, taskData);
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === updatedTask.id ? updatedTask : task
          )
        );
        onNotify('Task updated successfully!');
      } else {
        // Add new task
        const newTask = await createTask(taskData);
        setTasks(prevTasks => [newTask, ...prevTasks]);
        onNotify('Task added successfully!');
      }
    } catch (error) {
      onNotify(
        taskData.id
          ? 'Failed to update task. Please try again.' 
          : 'Failed to add task. Please try again.',
        'error'
      );
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      onNotify('Task deleted successfully!');
    } catch (error) {
      onNotify('Failed to delete task. Please try again.', 'error');
    }
  };

  const handleToggleComplete = async (taskId) => {
    try {
      const taskToUpdate = tasks.find(task => task.id === taskId);
      if (!taskToUpdate) return;
      
      const updatedTask = await updateTask(taskId, { 
        completed: !taskToUpdate.completed 
      });
      
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        )
      );
      
      onNotify(
        updatedTask.completed
          ? 'Task marked as completed!'
          : 'Task marked as active!'
      );
    } catch (error) {
      onNotify('Failed to update task status. Please try again.', 'error');
    }
  };

  // Pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  return (
    <>
      <Container maxWidth="md" sx={{ my: 3, flexGrow: 1 }}>
        <TaskList 
          tasks={tasks}
          loading={loading}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onToggleComplete={handleToggleComplete}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </Container>
      
      {/* Floating action button for mobile */}
      {isMobile && (
        <Fab 
          color="secondary" 
          aria-label="add" 
          onClick={handleAddTask}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Task form for adding/editing tasks */}
      <TaskForm 
        task={currentTask}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSaveTask}
      />
    </>
  );
}

export default TaskContainer; 