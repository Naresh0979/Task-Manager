import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function Header({ onAddTask, onImport }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar 
      position="static" 
      color="primary" 
      elevation={1}
      sx={{ borderRadius: 0 }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Task Manager
        </Typography>
        
        <Button 
          color="inherit"
          startIcon={<CloudUploadIcon />}
          onClick={onImport}
          sx={{ mr: 1 }}
        >
          Import
        </Button>
        
        {!isMobile && (
          <Button 
            variant="contained" 
            color="secondary" 
            startIcon={<AddIcon />}
            onClick={onAddTask}
            disableElevation
          >
            Add Task
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header; 