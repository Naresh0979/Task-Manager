import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  Checkbox, 
  Chip, 
  TextField, 
  InputAdornment, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  Skeleton,
  Grid,
  Tooltip,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Stack,
  TableFooter
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { format, isPast, isToday, parseISO, isBefore } from 'date-fns';

function TaskList({ tasks, loading, onEditTask, onDeleteTask, onToggleComplete, pagination, onPageChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [filterStatus, setFilterStatus] = useState('all');

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    // Filter by search term
    let result = tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Filter by status
    if (filterStatus === 'completed') {
      result = result.filter(task => task.completed);
    } else if (filterStatus === 'active') {
      result = result.filter(task => !task.completed);
    } else if (filterStatus === 'overdue') {
      result = result.filter(task => 
        !task.completed && 
        task.dueDate && 
        isPast(parseISO(task.dueDate)) && 
        !isToday(parseISO(task.dueDate))
      );
    } else if (filterStatus === 'today') {
      result = result.filter(task => 
        task.dueDate && isToday(parseISO(task.dueDate))
      );
    }

    // Sort tasks
    return result.sort((a, b) => {
      if (sortBy === 'dueDate') {
        // Handle null dates
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        
        return isBefore(parseISO(a.dueDate), parseISO(b.dueDate)) ? -1 : 1;
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'status') {
        return a.completed === b.completed ? 0 : a.completed ? 1 : -1;
      }
      return 0;
    });
  }, [tasks, searchTerm, sortBy, filterStatus]);

  // Helper to get status chip color
  const getStatusColor = (task) => {
    if (task.completed) return 'success';
    if (task.dueDate) {
      const dueDate = parseISO(task.dueDate);
      if (isPast(dueDate) && !isToday(dueDate)) return 'error';
      if (isToday(dueDate)) return 'warning';
    }
    return 'info';
  };

  // Helper to get status label
  const getStatusLabel = (task) => {
    if (task.completed) return 'Completed';
    if (task.dueDate) {
      const dueDate = parseISO(task.dueDate);
      if (isPast(dueDate) && !isToday(dueDate)) return 'Overdue';
      if (isToday(dueDate)) return 'Due Today';
    }
    return 'In Progress';
  };

  // Format due date for display
  const formatDueDate = (dueDate) => {
    if (!dueDate) return 'No due date';
    return format(parseISO(dueDate), 'MMM d, yyyy');
  };

  // Handle page change
  const handlePageChange = (event, newPage) => {
    onPageChange(newPage);
  };

  // Render skeleton loaders while loading
  if (loading) {
    return (
      <Card elevation={1} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Box mb={3}>
            <Skeleton variant="rectangular" height={40} width="100%" />
          </Box>
          {[1, 2, 3].map((item) => (
            <Box key={item} mb={2}>
              <Skeleton variant="rectangular" height={70} width="100%" />
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={1} sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 2 }}>
        {/* Search and Filter Controls */}
        <Box mb={2}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="filter-status-label">Status</InputLabel>
                <Select
                  labelId="filter-status-label"
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Tasks</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                  <MenuItem value="today">Due Today</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="sort-by-label">Sort By</InputLabel>
                <Select
                  labelId="sort-by-label"
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="dueDate">Due Date</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Task Count */}
        <Typography variant="subtitle2" color="text.secondary" mb={1}>
          {filteredAndSortedTasks.length} {filteredAndSortedTasks.length === 1 ? 'task' : 'tasks'} found
          {pagination && pagination.total > 0 && ` (${pagination.total} total)`}
        </Typography>

        {/* Tasks Table */}
        {filteredAndSortedTasks.length > 0 ? (
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" width="48px"></TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedTasks.map((task) => (
                  <TableRow 
                    key={task.id}
                    sx={{ 
                      opacity: task.completed ? 0.7 : 1,
                      textDecoration: task.completed ? 'line-through' : 'none',
                      backgroundColor: task.completed ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox 
                        checked={task.completed}
                        onChange={() => onToggleComplete(task.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body1" 
                        sx={{ fontWeight: task.completed ? 'normal' : 500 }}
                      >
                        {task.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          display: '-webkit-box',
                          overflow: 'hidden',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 2,
                          maxWidth: '200px'
                        }}
                      >
                        {task.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {task.dueDate ? (
                        <Typography 
                          variant="body2" 
                          color={
                            task.completed ? "text.secondary" :
                            isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate)) ? "error.main" : 
                            isToday(parseISO(task.dueDate)) ? "warning.main" : 
                            "text.secondary"
                          }
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {formatDueDate(task.dueDate)}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(task)}
                        color={getStatusColor(task)}
                        size="small"
                        sx={{ minWidth: '90px' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => onEditTask(task)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => onDeleteTask(task.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {pagination && pagination.pages > 1 && (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ pt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Page {pagination.page} of {pagination.pages}
                        </Typography>
                        <Pagination
                          count={pagination.pages}
                          page={pagination.page}
                          onChange={handlePageChange}
                          color="primary"
                          size="small"
                        />
                      </Stack>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </TableContainer>
        ) : (
          <Box py={4} textAlign="center">
            <Typography variant="body1" color="text.secondary">
              No tasks found. {searchTerm ? 'Try a different search term.' : 'Add a task to get started!'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default TaskList; 