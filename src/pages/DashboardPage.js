import React, { useState, useEffect } from "react";
import { Box, Button, Grid, Container, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from '../components/Header'
import Footer from '../components/Footer'

const Dashboard = ({ fileName }) => {
    const [hours, setHours] = useState([]); // List of available hours
    const [selectedHour, setSelectedHour] = useState(null);
    const [selectedMinutes, setSelectedMinutes] = useState([]);
    const [minutes, setMinutes] = useState([]); // List of available minutes for selected hour
    const navigate = useNavigate();

  useEffect(() => {
    if (fileName) {
      axios.get(`http://localhost:8080/api/get-hours?fileName=${fileName}`)
        .then(response => setHours(response.data))
        .catch(error => console.error("Error fetching hours:", error));
    }
  }, [fileName]);

  const handleHourClick = (hour) => {
    setSelectedHour(hour);
    axios.get(`http://localhost:8080/api/get-minutes?fileName=${fileName}&selectedHour=${hour}`)
      .then(response => setMinutes(response.data))
      .catch(error => console.error("Error fetching minutes:", error));
  };

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
          navigate("/analytics", { state: { fileName, selectedMinutes } });
      }
  };

  return (
  <Box sx={{ height: '100vh', display: 'flex',flexDirection: 'column',justifyContent: 'space-between',backgroundColor: '#f0f2f5'}}>
    <Header />
    <Container maxWidth="lg" sx={{ padding: '50px',flexGrow: 1}}>
      <Paper elevation={3} sx={{ padding: '30px', textAlign: 'center'}}>
        <Typography variant="h5" textAlign="center">Choose a particular hour available in the file</Typography>
        <Grid container spacing={2} justifyContent="center" sx={{ padding: '20px'}}>
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
            <Typography variant="h5" textAlign="center">Individual stacktrace available for selected hour, Choose any one and click on Visualize</Typography>
            <Grid container spacing={2} justifyContent="center" sx={{ padding: '20px'}}>
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
                disabled={selectedMinutes.length === 0} // Disable if no minutes are selected
            >
                Visualize
            </Button> 
        )}
          </Paper>
        </Container>
        <Footer />
    </Box>
    );
};

export default Dashboard;
