import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Alert, CircularProgress } from "@mui/material";
import axios from "axios";

const apiBaseUrl = process.env.REACT_APP_TD_API_URL;
const GCThreads = ({ uploadDate, threadDumpFiles }) => {
  const [gcThreadCount, setGcThreadCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (uploadDate && threadDumpFiles) {
      const queryString = `uploadDate=${uploadDate}&threadDumpFile=${threadDumpFiles}`;
      const url = `${apiBaseUrl}/api/threaddump/get-gc-thread-count?${queryString}`;
      
      axios.get(url)
        .then(res => {
          setGcThreadCount(res.data.gcThreadCount);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching GC thread count:", err);
          setError("Failed to load GC thread data");
          setLoading(false);
        });
    }
  }, [uploadDate, threadDumpFiles]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <Typography variant="h6" sx={{ mb: 0.1, fontWeight: "bold" }}>
        GC Threads
      </Typography>
      <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
        Garbage collection threads count reported.
      </Typography>

      <Alert 
        severity={gcThreadCount > 10 ? "warning" : "success"} 
        sx={{ mb: 1.5, width: '100%' }}
      >
        {gcThreadCount > 10 
            ? `High GC thread count (${gcThreadCount}), consider investigating` 
            : "GC thread count is normal"}
      </Alert>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 2,
          textAlign: 'center',
          maxWidth: 200,
          backgroundColor: '#f5f5f5'
        }}
      >
        <Typography variant="h6" color="text.secondary">
          GC Threads Count
        </Typography>
        <Typography variant="h2" sx={{ mt: 1 }}>
          {gcThreadCount}
        </Typography>
      </Paper>
    </Box>
  );
};

export default GCThreads;