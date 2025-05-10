import React, { useState, useEffect, useCallback } from "react";
import { Box, Button, Grid, Container, Typography, Paper, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from '../components/Header';
import Footer from '../components/Footer';

const apiBaseUrl = process.env.REACT_APP_API_URL;

const Dashboard = ({ fileName }) => {
    const [hours, setHours] = useState([]); // List of available hours
    const [selectedHour, setSelectedHour] = useState(null);
    const [selectedMinutes, setSelectedMinutes] = useState([]);
    const [minutes, setMinutes] = useState([]); // List of available minutes for selected hour
    const [loading, setLoading] = useState(false); // State for loader
    const navigate = useNavigate();

    useEffect(() => {
      if (fileName) {
          setLoading(true);
          axios.get(`${apiBaseUrl}/api/get-hours?fileName=${fileName}`)
              .then(response => {
                  setHours(response.data);
                  setLoading(false);
              })
              .catch(error => {
                  console.error("Error fetching hours:", error);
                  setLoading(false);
              });
      }
  }, [fileName]);

  const handleHourClick = useCallback((hour) => {
    setSelectedHour(hour);
    sessionStorage.setItem("previousSelectedHour", hour);
    setLoading(true);
    axios.get(`${apiBaseUrl}/api/get-minutes?fileName=${fileName}&selectedHour=${hour}`)
        .then(response => {
            setMinutes(response.data);
            setLoading(false);
        })
        .catch(error => {
            console.error("Error fetching minutes:", error);
            setLoading(false);
        });
  }, [fileName]);

  useEffect(() => {
    const storedHour = sessionStorage.getItem("previousSelectedHour");
    if (storedHour !== null) {
        const hour = parseInt(storedHour, 10);
        setSelectedHour(hour);
        handleHourClick(hour);
    }
  }, [fileName, handleHourClick]);

    const handleMinuteClick = (minute) => {
        let updatedMinutes = [...selectedMinutes];
        // Allow only up to 3 selections
        if (updatedMinutes.includes(minute)) {
            updatedMinutes = updatedMinutes.filter(m => m !== minute);
        } else if (updatedMinutes.length < 3) {
            updatedMinutes.push(minute);
        }
        setSelectedMinutes(updatedMinutes);
    };

    // Handle visualization
    const handleVisualize = () => {
        if (selectedMinutes.length > 0) {
            navigate("/analytics", { state: { fileName,selectedHour, selectedMinutes } });
        }
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#f0f2f5', position: 'relative' }}>
            <Header />
            <Container maxWidth="lg" sx={{ padding: '50px', flexGrow: 1, position: 'relative' }}>
                <Paper elevation={3} sx={{ padding: '30px', textAlign: 'center', position: 'relative' }}>
                    <Typography variant="h5" textAlign="center">
                        Choose a particular hour available in the file
                    </Typography>
                    <Grid container spacing={2} justifyContent="center" sx={{ padding: '20px' }}>
                        {Array.from({ length: 24 }, (_, i) => (
                            <Grid item key={i}>
                                <Button
                                    variant="contained"
                                    color={hours.includes(i) ? "primary" : "secondary"}
                                    disabled={!hours.includes(i)}
                                    onClick={() => handleHourClick(i)}
                                >
                                    {i}
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                    {selectedHour !== null && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h6" textAlign="center"> 
                            Below individual stack traces are available under the selected hour. Choose one for individual analysis or select up to three timestamps for comparative analysis
                            </Typography>
                            <Grid container spacing={2} justifyContent="center" sx={{ padding: '20px' }}>
                                {minutes.map((minute, index) => (
                                    <Grid item key={index}>
                                        <Button
                                            variant={selectedMinutes.includes(minute) ? "contained" : "outlined"}
                                            onClick={() => handleMinuteClick(minute)}
                                        >
                                            {minute}
                                        </Button>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}
                    {/* Visualize Button */}
                    {selectedHour !== null && (
                        <Button
                            variant="contained"
                            sx={{ marginTop: "20px" }}
                            onClick={handleVisualize}
                            disabled={selectedMinutes.length === 0 || loading} // disable button if loading
                        >
                            Visualize
                        </Button>
                    )}
                </Paper>
                {/* Loader Overlay */}
                {loading && (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            backgroundColor: "rgba(255, 255, 255, 0.7)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 10,
                        }}
                    >
                        <CircularProgress />
                    </Box>
                )}
            </Container>
            <Footer />
        </Box>
    );
};

export default Dashboard;