import React, { useState } from 'react';
import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Paper, TextField, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const apiBaseUrl = process.env.REACT_APP_API_URL;
//const tdBaseUrl = process.env.REACT_TD_APP_API_URL;

const AnalyticsCard = ({ title, description, onClick }) => {
  return (
    <Paper 
      elevation={3}
      onClick={onClick}
      sx={{
        padding: '15px', height: '100%', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6
        },
        borderLeft: '4px solid #1976d2', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
    >
      <div>
        <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      </div>
      <Button 
        variant="contained" 
        sx={{ mt: 1, alignSelf: 'flex-start', backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0'}}}>
        Get Started
      </Button>
    </Paper>
  );
};

const StackTraceUpload = ({ setFileName, onBack }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showExistsDialog, setShowExistsDialog] = useState(false);
  const [existingFileName, setExistingFileName] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const navigate = useNavigate();
  
  const handleUpload = async (options = { }) => {
    if (!selectedFile) {
      alert("Please select a file before uploading.");
      return;
    }

    const uploadOptions = {
      reuse: false,
      overwrite: false,
      ...options
    };

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("reuse", uploadOptions.reuse.toString());
    formData.append("overwrite", uploadOptions.overwrite.toString());

    setUploading(true);
    try {
      const response = await axios.post(`${apiBaseUrl}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        setFileName(response.data.fileName); 
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setExistingFileName(error.response.data.fileName || 'the file');
        setShowExistsDialog(true);
      } else {
        console.error("Upload failed", error);
        alert(`File upload failed: ${error.response?.data?.error || error.message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleReuseFile = () => {
    setShowExistsDialog(false);
    handleUpload({ reuse: true });
  };
  
  const handleUploadAgain = () => {
    setShowExistsDialog(false);
    handleUpload({ overwrite: true });
  };

  return (
    <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
      <Grid container spacing={4}>
        {/* Left Section */}
        <Grid item xs={6}>
          <Typography variant="h2" sx={{ fontWeight: 'bold', marginBottom: 1, marginBlockStart:3 }}>
            Visualize StackTraces
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Easiest and efficient way of reading and identifying bottlenecks in stack traces
          </Typography>
        </Grid>

        {/* Right Section */}
        <Grid item xs={6}>
          <Paper elevation={3} sx={{ padding: '30px', textAlign: 'center', backgroundColor: '#f0f2f5' }}>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
              <b>Upload Stacktrace File</b>
            </Typography>
            <Typography 
              variant="body2" 
              align='center'
              sx={{ marginBottom: 1 }}
            >
              Supports .zip file only
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
              onClick={() => handleUpload()}
              fullWidth
              disabled={uploading}
              sx={{ mb: 2 }}
            >
              {uploading ? <CircularProgress size={24} color="inherit" /> : "Upload"}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog for existing file */}
      <Dialog
        open={showExistsDialog}
        onClose={() => setShowExistsDialog(false)}
        aria-labelledby="existing-file-dialog-title"
        aria-describedby="existing-file-dialog-description"
      >
        <DialogTitle id="existing-file-dialog-title">
          File Already Exists
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="existing-file-dialog-description">
            {`"${existingFileName}" already exists in the system.`}
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            Would you like to reuse the existing file or upload a new version?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExistsDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUploadAgain} color="primary">
            Upload Again
          </Button>
          <Button onClick={handleReuseFile} color="primary" variant="contained" autoFocus>
            Reuse Existing File
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

const ThreadDumpUpload = ({ onBack }) => {
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
    selectedFiles.forEach((file, index) => {
      formData.append(`files`, file);
    });

    setUploading(true);
    try {
      // Replace with your actual API endpoint for thread dump upload
      const response = await axios.post(`http://localhost:8082/api/threaddump/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        // Handle successful upload
          navigate("/analytics", {
            state: {
            analyticsType: "threaddump",
            uploadDate: response.data.uploadDate,
            threadDumpFiles: response.data.files // or whatever your API returns
          }
        });
      }
      
    } catch (error) {
	  if (error.response && error.response.status === 409) {
      alert(error.response.data.message);
    } else {
	  console.error("Upload failed", error);
      alert(`File upload failed: ${error.response?.data?.error || error.message}`);
    } }finally {
      setUploading(false);
    }
  };

  return (
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
  );
};

const GCLogUpload = ({ onBack }) => {
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
      // Replace with your actual API endpoint for GC log upload
      const response = await axios.post(`${apiBaseUrl}/api/upload/gc-log`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        // Handle successful upload
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
    <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
      <Grid container spacing={4}>
        <Grid item xs={6}>
          <Typography variant="h2" sx={{ fontWeight: 'bold', marginBottom: 0.2, marginBlockStart:7 }}>
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
  );
};

const LaunchPage = ({ setFileName }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const handleHeaderClick = () => {
    setSelectedOption(null); // This will return to the analytics options view
  };

  const renderContent = () => {
    switch (selectedOption) {
      case 'stacktrace':
        return <StackTraceUpload setFileName={setFileName} onBack={() => setSelectedOption(null)} />;
      case 'threaddump':
        return <ThreadDumpUpload onBack={() => setSelectedOption(null)} />;
      case 'gclog':
        return <GCLogUpload onBack={() => setSelectedOption(null)} />;
      default:
        return (
          <Container maxWidth="md" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} sm={6} md={4}>
                <AnalyticsCard 
                    title="StackTrace Analytics"
                    description="Analyze stack traces to identify performance bottlenecks and thread behavior"
                    onClick={() => setSelectedOption('stacktrace')}
                />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                <AnalyticsCard 
                    title="ThreadDump Analytics"
                    description="Analyze thread dumps to diagnose deadlocks and monitor thread behavior"
                    onClick={() => setSelectedOption('threaddump')}
                />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                <AnalyticsCard 
                    title="GC Log Analytics"
                    description="Analyze GC logs to optimize memory management and reduce computing costs"
                    onClick={() => setSelectedOption('gclog')}
                />
                </Grid>
            </Grid>
          </Container>
        );
    }
  };

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: '#f0f2f5',
    }}>
      <Header onProductClick={handleHeaderClick} />

      {selectedOption ? (
        // Render the selected analytics component
        renderContent()
      ) : (
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Our Analytics Services
            </Typography>
            <Typography variant="h6" color="text.secondary" >
              Powerful tools to help you identify and resolve performance issues in your applications
            </Typography>
          </Box>

          <Grid container spacing={4} mb={5}>
            <Grid item xs={12} md={4}>
              <AnalyticsCard 
                title="StackTrace Analytics"
                description="Analyze stack traces to identify performance bottlenecks and thread behavior"
                onClick={() => setSelectedOption('stacktrace')}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <AnalyticsCard 
                title="ThreadDump Analytics"
                description="Analyze thread dumps to diagnose deadlocks and monitor thread behavior"
                onClick={() => setSelectedOption('threaddump')}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <AnalyticsCard 
                title="GC Log Analytics"
                description="Analyze GC logs to optimize memory management and reduce computing costs"
                onClick={() => setSelectedOption('gclog')}
              />
            </Grid>
          </Grid>
        </Container>
      )}
      <Footer />
    </Box>
  );
};

export default LaunchPage;