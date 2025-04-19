import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Alert, Grid, Button 
} from "@mui/material";
import { Pie } from "react-chartjs-2";
import axios from "axios";

const backendHost = process.env.REACT_APP_BACKEND_HOST || '';

const StackLengthStats = ({ fileName, selectedMinutes }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [stackTraces, setStackTraces] = useState([]);
  const [loadingTraces, setLoadingTraces] = useState(false);

  useEffect(() => {
    if (fileName && selectedMinutes) {
      const queryString = `fileName=${fileName}&minutes=${selectedMinutes}`;
      const url = `${backendHost}/api/get-stack-length-stats?${queryString}`;
      
      axios.get(url)
        .then(res => {
          setStats(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching stack length stats:", err);
          setLoading(false);
        });
    }
  }, [fileName, selectedMinutes]);

  const fetchStackTraces = (category) => {
    setSelectedCategory(category);
    setLoadingTraces(true);
    
    const queryString = `fileName=${fileName}&minutes=${selectedMinutes}&category=${category}`;
    const url = `${backendHost}/api/get-stacks-by-length?${queryString}`;
    
    axios.get(url)
      .then(res => {
        setStackTraces(res.data);
        setLoadingTraces(false);
      })
      .catch(err => {
        console.error("Error fetching stack traces:", err);
        setLoadingTraces(false);
      });
  };

  if (loading) return <Typography>Loading stack length statistics...</Typography>;
  if (!stats) return <Typography>No data available</Typography>;

  const { lengthGroups, hasCriticalStacks } = stats;

  // Prepare data for pie chart
  const pieData = {
    labels: Object.keys(lengthGroups),
    datasets: [{
      data: Object.values(lengthGroups),
      backgroundColor: [
        '#4CAF50', // Green for <10
        '#FFC107', // Amber for 10-100
        '#F44336'  // Red for >100
      ]
    }]
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Threads Stack Length
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Lengthy stacks can cause StackOverflowError.
      </Typography>

      {hasCriticalStacks ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Stack length greater than 100 can create StackOverflowError. Analyze its cause to avoid outages.
        </Alert>
      ) : (
        <Alert severity="success" sx={{ mb: 2 }}>
          No problem in Stack trace length.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column - Table */}
        <Grid item xs={12} md={6}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    backgroundColor: 'black', 
                    color: 'white',
                    textAlign: 'center'
                  }}>
                    Stack Length
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    backgroundColor: 'black', 
                    color: 'white',
                    textAlign: 'center'
                  }}>
                    Thread Count
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(lengthGroups).map(([category, count]) => (
                  <TableRow 
                    key={category}
                    hover
                    sx={{ 
                      '&:hover': { cursor: 'pointer', backgroundColor: '#f5f5f5' },
                      backgroundColor: selectedCategory === category ? '#e3f2fd' : 'inherit'
                    }}
                  >
                    <TableCell 
                      sx={{ textAlign: 'center' }}
                      onClick={() => fetchStackTraces(category)}
                    >
                      <Button 
                        variant="text"
                        sx={{ 
                          fontWeight: 'bold',
                          color: category === '<10' ? '#4CAF50' : 
                                category === '10-100' ? '#FFC107' : '#F44336'
                        }}
                      >
                        {category}
                      </Button>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      {count}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Right Column - Pie Chart */}
        <Grid item xs={12} md={6}>
          <Box sx={{ height: '300px', p: 2 }}>
            <Pie 
              data={pieData} 
              options={{ 
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right'
                  }
                }
              }} 
            />
          </Box>
        </Grid>
      </Grid>

      {/* Stack Trace Display Area */}
      {selectedCategory && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Stack Traces (Length: {selectedCategory})
            {loadingTraces && <Typography variant="body2">Loading...</Typography>}
          </Typography>
          
          {stackTraces.length > 0 ? (
            <Box sx={{ 
              maxHeight: '400px', 
              overflowY: 'auto',
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              p: 2
            }}>
              {stackTraces.map((trace, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    mb: 2, 
                    p: 2, 
                    bgcolor: index % 2 === 0 ? '#fafafa' : 'white',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="body2" sx={{ 
                    whiteSpace: 'pre-wrap', 
                    fontFamily: 'monospace',
                    fontSize: '0.85rem'
                  }}>
                    {trace}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            !loadingTraces && (
              <Typography variant="body2" color="text.secondary">
                No stack traces found in this category.
              </Typography>
            )
          )}
        </Box>
      )}
    </Box>
  );
};

export default StackLengthStats;