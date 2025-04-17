import React, { useState, useEffect } from 'react';
import ImportDialog from './ImportDialog';
import { importTasksFromSheet } from '../services/api';

function ImportContainer({ onNotify, onTasksImported }) {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (window._importRef) {
      window._importRef.openImportDialog = handleOpenImportDialog;
    } else {
      window._importRef = { openImportDialog: handleOpenImportDialog };
    }
    
    return () => {
      if (window._importRef) {
        window._importRef.openImportDialog = null;
      }
    };
  }, []);

  const handleOpenImportDialog = () => {
    setImportDialogOpen(true);
  };

  const handleCloseImportDialog = () => {
    setImportDialogOpen(false);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!sheetUrl.trim()) {
      onNotify('Please enter a Google Sheet URL', 'error');
      return;
    }

    try {
      setImporting(true);
      const result = await importTasksFromSheet(sheetUrl);
      onNotify(result.message || 'Tasks imported successfully');
      setImportDialogOpen(false);
      setSheetUrl('');
      if (onTasksImported) onTasksImported();
    } catch (error) {
      onNotify(error.response?.data?.message || 'Failed to import tasks', 'error');
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <ImportDialog 
        open={importDialogOpen}
        onClose={handleCloseImportDialog}
        importing={importing}
        sheetUrl={sheetUrl}
        onSheetUrlChange={setSheetUrl}
        onImport={handleImportSubmit}
      />
    </>
  );
}

export default ImportContainer; 