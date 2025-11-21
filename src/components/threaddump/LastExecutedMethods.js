import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Button
} from "@mui/material";
import axios from "axios";

const apiBaseUrl = process.env.REACT_APP_TD_API_URL;

const LastExecutedMethods = ({ uploadDate, threadDumpFiles }) => {
  const [methodStats, setMethodStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [stackTraces, setStackTraces] = useState([]);
  const [loadingTraces, setLoadingTraces] = useState(false);

  useEffect(() => {
    if (uploadDate && threadDumpFiles) {
      const queryString = `uploadDate=${uploadDate}&threadDumpFile=${threadDumpFiles}`;
      const url = `${apiBaseUrl}/api/threaddump/last-executed-methods?${queryString}`;
      
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
  }, [uploadDate, threadDumpFiles]);

  const fetchStackTraces = (method) => {
    setSelectedMethod(method);
    setLoadingTraces(true);
    
    const queryString = `uploadDate=${uploadDate}&threadDumpFile=${threadDumpFiles}&method=${encodeURIComponent(method)}`;
    const url = `${apiBaseUrl}/api/threaddump/get-method-traces?${queryString}`;
    
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
      <Typography variant="h6" sx={{ mb: 0.1, fontWeight: "bold" }}>
        Last Executed Methods
      </Typography>
      <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
        Below are methods that threads were executing when thread dump was captured
      </Typography>

      {/* Method Table */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          mb: 1,
          maxHeight: '300px', // Add fixed height
          overflow: 'auto'    // Enable scrolling
        }}
      >
        <Table size='small' stickyHeader> {/* Make header sticky */}
          <TableHead>
            <TableRow>
              <TableCell sx={{ 
                fontWeight: 'bold', 
                backgroundColor: 'black', 
                color: 'white',
                textAlign: 'center',
                position: 'sticky',  // Ensure header stays fixed
                top: 0,             // Stick to top
                zIndex: 1,           // Keep header above content
                fontSize:'0.825rem'
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
                zIndex: 1,           // Keep header above content
                fontSize:'0.825rem'
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
                zIndex: 1,           // Keep header above content
                fontSize:'0.825rem'
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
        <Box sx={{ marginTop: 3, backgroundColor: '#fff', padding: 2, borderRadius: 2, maxHeight: '400px', overflowY: 'auto' }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            Stack traces for method: {selectedMethod}
          </Typography>
          
          {loadingTraces ? (
            <Typography variant="body2">Loading...</Typography>
          ) : stackTraces.length > 0 ? (
            <Box>
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
                   <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.75rem'}}>
                    {trace}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ textAlign: 'center', py: 1 }}>
              No stack traces found for this method.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default LastExecutedMethods;