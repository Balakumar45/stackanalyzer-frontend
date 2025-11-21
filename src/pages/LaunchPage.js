import React from 'react';
import { Box, Container, Grid, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AnalyticsCard = ({ title, description, route }) => {
  const navigate = useNavigate();
  return (
    <Paper
      elevation={3}
      onClick={() => navigate(route)}
      sx={{
        padding: '15px', height: '100%', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 },
        borderLeft: '4px solid #1976d2', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
      }}
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
        sx={{ mt: 1, alignSelf: 'flex-start', backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}>
        Get Started
      </Button>
    </Paper>
  );
};

const LaunchPage = () => (
  <Box sx={{
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#f0f2f5',
  }}>
    <Header />
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Our Analytics Services
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Powerful tools to help you identify and resolve performance issues in your applications
        </Typography>
      </Box>
      <Grid container spacing={4} mb={5}>
        <Grid item xs={12} md={4}>
          <AnalyticsCard
            title="StackTrace Analytics"
            description="Analyze stack traces to identify performance bottlenecks and thread behavior"
            route="/stacktrace"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <AnalyticsCard
            title="ThreadDump Analytics"
            description="Analyze thread dumps to diagnose deadlocks and monitor thread behavior"
            route="/threaddump"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <AnalyticsCard
            title="GC Log Analytics"
            description="Analyze GC logs to optimize memory management and reduce computing costs"
            route="/gclog"
          />
        </Grid>
      </Grid>
    </Container>
    <Footer />
  </Box>
);

export default LaunchPage;