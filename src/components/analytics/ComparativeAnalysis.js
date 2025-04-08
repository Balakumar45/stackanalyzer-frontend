import React, { useState, useEffect } from 'react';
import { Paper, Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress } from '@mui/material';
import { Line } from 'react-chartjs-2';
import axios from "axios";
import {Chart as ChartJS,CategoryScale,LinearScale,PointElement,LineElement,Title,Tooltip,Legend} from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale,LinearScale,PointElement,LineElement,Title,Tooltip,Legend);

const ComparativeAnalysis = ({ fileName, selectedMinutes}) => {

  const [threadSummary, setThreadSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (fileName && selectedMinutes?.length > 0) {
      setLoading(true); // Set loading to true before fetch
      const queryString = `fileName=${fileName}&` + selectedMinutes.map(min => `minutes=${min}`).join('&');
      const url = `http://localhost:8080/api/get-thread-summary?${queryString}`;
      axios
        .get(url)
        .then((res) => {
          setThreadSummary(res.data);
        })
        .catch((err) => {
          console.error("Error fetching thread summary:", err);
          setThreadSummary(null);
        })
        .finally(() => {
          setLoading(false); // Set loading to false after fetch completes
        });
      }
    }, [fileName, selectedMinutes]);

    if (loading || !threadSummary || Object.keys(threadSummary).length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
            </Box>
        );
    }

    // Get timestamps (will be used as column headers)
    const timestamps = Object.keys(threadSummary);

    if (!timestamps.length) {
      return (
          <Box display="flex" justifyContent="center" alignItems="center">
              <Typography>No data available</Typography>
          </Box>
      );
  }

    // Get all unique states across all timestamps
    const states = [...new Set(
      Object.values(threadSummary)
          .flatMap(data => data.threadStates.map(state => state.state))
    )];

    // Prepare table data
    const tableData = [
      ...states.map(state => ({
          state,
          counts: timestamps.map(timestamp => {
              const stateData = threadSummary[timestamp].threadStates.find(s => s.state === state);
              return stateData ? stateData.count : 0;
          })
      })),
      {
          state: 'Total Threads',
          counts: timestamps.map(timestamp => threadSummary[timestamp].totalThreads)
      }
  ];

  // Replace the chartData definition with this:
  const chartData = {
    labels: timestamps,
    datasets: states.map((state) => ({
      label: state,
      data: timestamps.map(timestamp => {
          const stateData = threadSummary[timestamp].threadStates.find(s => s.state === state);
          return stateData ? stateData.count : 0;
      }),
      borderColor: (() => {
        switch (state) {
          case 'RUNNABLE': return '#2ecc71'; 
          case 'BLOCKED': return '#e74c3c';
          case 'WAITING': return '#f1c40f';
          case 'TIMED_WAITING': return '#e67e22';
          default: return `hsl(${Math.random() * 360}, 70%, 50%)`; 
        }
      })(),
      fill: true,
      tension: 0.4,
    })),
};

    return (
        <Box>
          <Paper sx={{ padding: 1, textAlign: "center", backgroundColor: "#f4f4f4", marginBottom: 2 }}>
            <Typography variant="h5">Comparative Analysis - Thread Count Statistics</Typography>
          </Paper>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ width: '45%' }}>
                  <Paper sx={{ padding: 1, textAlign: "center", backgroundColor: "#f4f4f4", marginBottom: 2 }}>
                    <Typography variant="h6" textAlign={'center'}>Thread Count Table</Typography>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{fontWeight:'bold', backgroundColor:'black', color:'white'}}>
                                  State
                                </TableCell>
                                {timestamps.map((timestamp, index) => (
                                    <TableCell sx={{fontWeight:'bold', backgroundColor:'black', color:'white'}} key={index}>
                                      {timestamp}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tableData.map((row, index) => (
                                <TableRow 
                                    key={index}
                                    sx={{
                                        '&:last-child td': {
                                            fontWeight: 'bold',
                                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                        }
                                    }}
                                >
                                    <TableCell>{row.state}</TableCell>
                                    {row.counts.map((count, countIndex) => (
                                        <TableCell key={countIndex}>{count}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
                </Box>
                
                <Box sx={{ width: '55%' }}>
                  <Paper sx={{ padding: 1, textAlign: "center", backgroundColor: "#f4f4f4", marginBottom: 2 }}>
                    <Typography variant="h6" textAlign={'center'}>Thread Count Line Graph</Typography>
                    <Line
                        data={chartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: true,
                            height: 300,
                            plugins: {
                                legend: {
                                    position: 'top',
                                }
                            },
                            scales: {
                                x: {
                                    title: {
                                        display: true,
                                        text: 'Timestamp',
                                    }
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: 'Thread Count',
                                    }
                                }
                            }
                        }}
                    />
                  </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default ComparativeAnalysis;