import React, { useState } from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import TaskContainer from './TaskContainer';
import ImportContainer from './ImportContainer';
import Notification from './Notification';

function AppContent() {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Helper to show notifications
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Handle closing notifications
  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };

  // Reference to trigger task refresh
  const refreshTasksRef = React.useRef();
  
  // Handle import button click
  const handleImportClick = () => {
    if (window._importRef && window._importRef.openImportDialog) {
      window._importRef.openImportDialog();
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: 'background.default'
    }}>
      {/* Pass the onNotify callback to components */}
      <ImportContainer 
        onNotify={showNotification} 
        onTasksImported={() => refreshTasksRef.current && refreshTasksRef.current()}
      />

      <Header 
        onAddTask={() => refreshTasksRef.current && refreshTasksRef.current('add')} 
        onImport={handleImportClick} 
      />

      <TaskContainer 
        onNotify={showNotification}
        refreshRef={refreshTasksRef}
      />

      {/* Notifications */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Box>
  );
}

export default AppContent; 