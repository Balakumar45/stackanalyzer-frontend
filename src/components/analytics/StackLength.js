import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert, Grid, Button } from "@mui/material";
import { Pie } from "react-chartjs-2";
import axios from "axios";

const apiBaseUrl = process.env.REACT_APP_API_URL;
const StackLengthStats = ({ fileName, selectedMinutes }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [stackTraces, setStackTraces] = useState([]);
  const [loadingTraces, setLoadingTraces] = useState(false);

  useEffect(() => {
    if (fileName && selectedMinutes) {
      const queryString = `fileName=${fileName}&minutes=${selectedMinutes}`;
      const url = `${apiBaseUrl}/api/get-stack-length-stats?${queryString}`;
      
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
    const url = `${apiBaseUrl}/api/get-stacks-by-length?${queryString}`;
    
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
      <Typography variant="h6" sx={{ mb: 0.1, fontWeight: "bold" }}>
        Threads Stack Length
      </Typography>
      <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
        Lengthy stacks can cause StackOverflowError.
      </Typography>

      {hasCriticalStacks ? (
        <Alert severity="warning" sx={{ mb: 1 }}>
          Stack length greater than 100 can create StackOverflowError. Analyze its cause to avoid outages.
        </Alert>
      ) : (
        <Alert severity="success" sx={{ mb: 1 }}>
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
                    textAlign: 'center',
                    padding: 1
                  }}>
                    Stack Length
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    backgroundColor: 'black', 
                    color: 'white',
                    textAlign: 'center',
                    padding: 1
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
          <Box sx={{ height: '300px'}}>
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
        <Box sx={{ marginTop: 3, backgroundColor: '#fff', padding: 2, borderRadius: 2, maxHeight: '400px', overflowY: 'auto' }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            Stack Traces (Length: {selectedCategory})
            {loadingTraces && <Typography variant="body2">Loading...</Typography>}
          </Typography>
          
          {stackTraces.length > 0 ? (
            <Box>
              {stackTraces.map((trace, index) => (
                <Box 
                  key={index} 
                  sx={{ mb: 2, p:1, backgroundColor: '#f9f9f9', borderRadius: 1}}
                >
                   <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.75rem'}}>
                    {trace}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            !loadingTraces && (
              <Typography variant="body2">
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