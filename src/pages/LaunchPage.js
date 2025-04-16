import React, { useState } from 'react';
import {Box, Button, Container, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, Grid, Paper, TextField, 
  Typography, CircularProgress} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LaunchPage = ({ setFileName }) => {
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
            const response = await axios.post("http://localhost:8080/api/upload", formData, {
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
        <Box sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#f0f2f5',
        }}>
            {/* Header */}
            <Header />

            {/* Main Content */}
            <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                <Grid container spacing={4}>
                    {/* Left Section */}
                    <Grid item xs={6}>
                        <Typography variant="h2" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
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
                            >
                                {uploading ? <CircularProgress size={24} color="inherit" /> : "Upload"}
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
            <Footer />

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
        </Box>
    );
};

export default LaunchPage;