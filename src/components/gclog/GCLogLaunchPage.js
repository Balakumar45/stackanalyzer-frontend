import React, { useState } from 'react';
import { Box ,Container, Grid, Typography, Paper, TextField, Button, CircularProgress } from '@mui/material';
import axios from 'axios';
import Header from "../Header";
import Footer from "../Footer";

const apiBaseUrl = process.env.REACT_APP_API_URL;

const GCLogLaunch = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file before uploading.");
      return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile);
    setUploading(true);
    try {
      const response = await axios.post(`${apiBaseUrl}/api/upload/gc-log`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 200) {
        console.log("GC log upload successful", response.data);
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert(`File upload failed: ${error.response?.data?.error || error.message}`);
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
            <Typography variant="h2" sx={{ fontWeight: 'bold', marginBottom: 0.2, marginBlockStart: 7 }}>
                Visualize GC Logs
            </Typography>
            <Typography variant="h7" color="textSecondary">
                Get valuable insights into a Java application's memory management to optimize GC pause times, 
                Improve application response time, Forecast production outages and reduce computing costs
            </Typography>
            </Grid>
            <Grid item xs={6}>
            <Paper elevation={3} sx={{ padding: '30px', textAlign: 'center', backgroundColor: '#f0f2f5' }}>
                <Typography variant="h6" sx={{ marginBottom: 2 }}>
                <b>Upload GC Log File</b>
                </Typography>
                <Typography variant="body2" align='center' sx={{ marginBottom: 1 }}>
                Upload a single GC log file
                </Typography>
                <TextField
                type="file"
                onChange={handleFileChange}
                fullWidth
                sx={{ marginBottom: 2 }}
                />
                <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                fullWidth
                disabled={uploading || !selectedFile}
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

export default GCLogLaunch;