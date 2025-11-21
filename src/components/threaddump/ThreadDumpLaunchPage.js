import React, { useState } from 'react';
import { Box, Container, Grid, Typography, Paper, TextField, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from "../Header";
import Footer from "../Footer";

const apiBaseUrl = process.env.REACT_APP_TD_API_URL;

const ThreadDumpLaunch = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files).slice(0, 3);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one file before uploading.");
      return;
    }
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append(`files`, file);
    });
    setUploading(true);
    try {
      const response = await axios.post(`${apiBaseUrl}/api/threaddump/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 200) {
        navigate("/threaddump/analytics", {
          state: {
            uploadDate: response.data.uploadDate,
            threadDumpFiles: response.data.files,
            fileDetails: response.data.fileDetails,
          }
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert(error.response.data.message);
      } else {
        console.error("Upload failed", error);
        alert(`File upload failed: ${error.response?.data?.error || error.message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{height: '100vh',display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#f0f2f5',}}>
    <Header />
        <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <Grid container spacing={4}>
            <Grid item xs={6}>
            <Typography variant="h2" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                Visualize ThreadDumps
            </Typography>
            <Typography variant="h7" color="textSecondary">
                Troubleshoot performance problems by identifying performance bottlenecks, 
                diagnosing deadlocks and monitoring thread behavior
            </Typography>
            <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                Supported JVM Implementation: OpenJDK
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                Supported Java versions: 8, 11, 17
            </Typography>
            </Grid>
            <Grid item xs={6}>
            <Paper elevation={3} sx={{ padding: '30px', textAlign: 'center', backgroundColor: '#f0f2f5' }}>
                <Typography variant="h6" sx={{ marginBottom: 0.2 }}>
                <b>Upload Thread Dump Files</b>
                </Typography>
                <Typography variant="body2" align='center' sx={{ marginBottom: 1 }}>
                supports up to 3 thread dump files at once
                </Typography>
                <TextField
                type="file"
                onChange={handleFileChange}
                fullWidth
                sx={{ marginBottom: 2 }}
                inputProps={{ multiple: true }}
                />
                <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                fullWidth
                disabled={uploading || selectedFiles.length === 0}
                sx={{ mb: 2 }}
                >
                {uploading ? <CircularProgress size={24} color="inherit" /> : "Upload"}
                </Button>
            </Paper>
            </Grid>
        </Grid>
        </Container>
    <Footer />
    </Box>
  );
};

export default ThreadDumpLaunch;