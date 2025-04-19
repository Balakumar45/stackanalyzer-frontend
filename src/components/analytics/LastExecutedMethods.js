import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Button
} from "@mui/material";
import axios from "axios";

const LastExecutedMethods = ({ fileName, selectedMinutes }) => {
  const [methodStats, setMethodStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [stackTraces, setStackTraces] = useState([]);
  const [loadingTraces, setLoadingTraces] = useState(false);

  useEffect(() => {
    if (fileName && selectedMinutes) {
      const queryString = `fileName=${fileName}&minutes=${selectedMinutes}`;
      const url = `/api/last-executed-methods?${queryString}`;
      
      axios.get(url)
        .then(res => {
          setMethodStats(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching last executed methods:", err);
          setLoading(false);
        });
    }
  }, [fileName, selectedMinutes]);

  const fetchStackTraces = (method) => {
    setSelectedMethod(method);
    setLoadingTraces(true);
    
    const queryString = `fileName=${fileName}&minutes=${selectedMinutes}&method=${encodeURIComponent(method)}`;
    const url = `/api/get-method-traces?${queryString}`;
    
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

  if (loading) return <Typography>Loading last executed methods...</Typography>;
  if (!methodStats) return <Typography>No data available</Typography>;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Last Executed Methods
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Below are methods that threads were executing when thread dump was captured
      </Typography>

      {/* Method Table */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          mb: 4,
          maxHeight: '400px', // Add fixed height
          overflow: 'auto'    // Enable scrolling
        }}
      >
        <Table stickyHeader> {/* Make header sticky */}
          <TableHead>
            <TableRow>
              <TableCell sx={{ 
                fontWeight: 'bold', 
                backgroundColor: 'black', 
                color: 'white',
                textAlign: 'center',
                position: 'sticky',  // Ensure header stays fixed
                top: 0,             // Stick to top
                zIndex: 1           // Keep header above content
              }}>
                Thread Count
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 'bold', 
                backgroundColor: 'black', 
                color: 'white',
                textAlign: 'center',
                position: 'sticky',  // Ensure header stays fixed
                top: 0,             // Stick to top
                zIndex: 1           // Keep header above content
              }}>
                Method
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 'bold', 
                backgroundColor: 'black', 
                color: 'white',
                textAlign: 'center',
                position: 'sticky',  // Ensure header stays fixed
                top: 0,             // Stick to top
                zIndex: 1           // Keep header above content
              }}>
                Percentage
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {methodStats.methods.map((stat) => (
              <TableRow 
                key={stat.method}
                hover
                sx={{ 
                  '&:hover': { cursor: 'pointer', backgroundColor: '#f5f5f5' },
                  backgroundColor: selectedMethod === stat.method ? '#e3f2fd' : 'inherit'
                }}
              >
                <TableCell sx={{ textAlign: 'center' }}>{stat.count}</TableCell>
                <TableCell>
                  <Button 
                    variant="text" 
                    onClick={() => fetchStackTraces(stat.method)}
                    sx={{ textTransform: 'none' }}
                  >
                    {stat.method}
                  </Button>
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  {stat.percentage.toFixed(2)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Stack Trace Display Area */}
      {selectedMethod && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Stack Traces for Method: {selectedMethod}
          </Typography>
          
          {loadingTraces ? (
            <Typography variant="body2">Loading...</Typography>
          ) : stackTraces.length > 0 ? (
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
            <Typography variant="body2" color="text.secondary">
              No stack traces found for this method.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default LastExecutedMethods;