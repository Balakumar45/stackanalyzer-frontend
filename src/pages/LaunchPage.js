import React, { useState } from 'react';
import { Box, Button, Container, Grid, Paper, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LaunchPage = ({ setFileName }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const navigate = useNavigate();
    
    const handleUpload = async () => {
        if (!selectedFile) {
            alert("Please select a file before uploading.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        
        try {
            const response = await axios.post("http://localhost:8080/api/upload", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.status === 200) {
                setFileName(response.data.fileName); 
                navigate("/dashboard"); // Redirect to Dashboard
            }} catch (error) {
              console.error("Upload failed", error);
              alert("File upload failed.");
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
                        <Paper elevation={3} sx={{ padding: '30px', textAlign: 'center',backgroundColor: '#f0f2f5' }}>
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
                                onClick={handleUpload}
                                fullWidth
                            >
                                Upload
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
            <Footer />
        </Box>
    );
};

export default LaunchPage;