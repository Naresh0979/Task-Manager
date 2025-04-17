import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function ImportDialog({ 
  open, 
  onClose, 
  importing, 
  sheetUrl, 
  onSheetUrlChange, 
  onImport 
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onImport(e);
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => !importing && onClose()}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        Import Tasks from Google Sheets
        <IconButton
          aria-label="close"
          onClick={() => !importing && onClose()}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter the URL of a public Google Sheet with task data. The sheet must contain at least a "Title" column.
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Google Sheet URL"
            placeholder="https://docs.google.com/spreadsheets/d/..."
            value={sheetUrl}
            onChange={(e) => onSheetUrlChange(e.target.value)}
            disabled={importing}
            variant="outlined"
            margin="normal"
            helperText="Example columns: Title, Description, Due Date, Completed"
            required
          />
        </form>
      </DialogContent>
      
      <DialogActions>
        <Button
          onClick={() => !importing && onClose()}
          disabled={importing}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={importing}
          startIcon={importing ? <CircularProgress size={20} /> : <CloudUploadIcon />}
        >
          {importing ? 'Importing...' : 'Import Tasks'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ImportDialog; 