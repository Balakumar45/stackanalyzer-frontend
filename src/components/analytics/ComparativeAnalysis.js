import React, { useState, useEffect } from 'react';
import { Paper, Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, TableContainer } from '@mui/material';
import { Line, Bar, Pie } from 'react-chartjs-2';
import axios from "axios";
import {Chart as ChartJS,CategoryScale,LinearScale,PointElement,LineElement,Title,Tooltip,Legend,BarElement,ArcElement} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
);

const backendHost = process.env.REACT_APP_BACKEND_HOST || '';

const ComparativeAnalysis = ({ fileName, selectedMinutes }) => {
  const [threadSummary, setThreadSummary] = useState(null);
  const [threadStatesData, setThreadStatesData] = useState(null);
  const [threadPoolData, setThreadPoolData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingPools, setLoadingPools] = useState(false);
  const [error, setError] = useState(null);

  // Fetch thread summary data
  useEffect(() => {
    if (fileName && selectedMinutes?.length > 0) {
      setLoadingSummary(true);
      const queryString = `fileName=${fileName}&` + selectedMinutes.map(min => `minutes=${min}`).join('&');
      const url = `${backendHost}/api/get-thread-summary?${queryString}`;
      axios
        .get(url)
        .then((res) => {
          setThreadSummary(res.data);
        })
        .catch((err) => {
          console.error("Error fetching thread summary:", err);
          setThreadSummary(null);
          setError("Failed to load thread summary data");
        })
        .finally(() => {
          setLoadingSummary(false);
        });
    }
  }, [fileName, selectedMinutes]);

  // Fetch thread states data
  useEffect(() => {
    if (fileName && selectedMinutes?.length > 0) {
      setLoadingStates(true);
      const queryString = `filename=${fileName}&` + selectedMinutes.map(min => `minutes=${min}`).join('&');
      const url = `${backendHost}/api/get-comparative-thread-state?${queryString}`;
      axios
        .get(url)
        .then((res) => {
          setThreadStatesData(res.data);
        })
        .catch((err) => {
          console.error("Error fetching thread states:", err);
          setThreadStatesData(null);
          setError("Failed to load thread states data");
        })
        .finally(() => {
          setLoadingStates(false);
        });
    }
  }, [fileName, selectedMinutes]);

    // Fetch thread pool data
    useEffect(() => {
      if (fileName && selectedMinutes?.length > 0) {
        setLoadingPools(true);
        const queryString = `filename=${fileName}&` + selectedMinutes.map(min => `minutes=${min}`).join('&');
        const url = `${backendHost}/api/get-comparative-thread-pool?${queryString}`;
        axios
          .get(url)
          .then((res) => {
            setThreadPoolData(res.data);
          })
          .catch((err) => {
            console.error("Error fetching thread pools:", err);
            setThreadPoolData(null);
            setError("Failed to load thread pool data");
          })
          .finally(() => {
            setLoadingPools(false);
          });
      }
    }, [fileName, selectedMinutes]);
  
    if (loadingSummary || loadingStates || loadingPools) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      );
    }
  
    if (error) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center">
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

  // Thread Count Statistics Section
  const renderThreadCountStatistics = () => {
    if (!threadSummary || Object.keys(threadSummary).length === 0) {
      return null;
    }

    const timestamps = Object.keys(threadSummary);
    if (!timestamps.length) return null;

    const states = [...new Set(
      Object.values(threadSummary)
        .flatMap(data => data.threadStates.map(state => state.state))
    )];

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
            case 'TIMED_WAITING': return '#2196F3';
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
          <Box sx={{ width: '50%' }}>
            <Paper sx={{ padding: 1, textAlign: "center", backgroundColor: "#f4f4f4", marginBottom: 2 }}>
              <Typography variant="h6" textAlign={'center'}>Thread Count Table</Typography>
              <Table size="medium">
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
          
          <Box sx={{ width: '50%' }}>
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

  // Thread States Section
  const renderThreadStates = () => {
    if (!threadStatesData || !threadStatesData.timestamps || !threadStatesData.threadInfos) {
      return null;
    }

    const getStateColor = (state) => {
      switch (state) {
        case 'RUNNABLE': return '#4CAF50'; // Green
        case 'BLOCKED': return '#F44336'; // Red
        case 'WAITING': return '#FFEB3B'; // Yellow
        case 'TIMED_WAITING': return '#2196F3'; // Blue
        default: return '#9E9E9E'; // Gray
      }
    };

    return (
      <Box mt={4}>
        <Paper sx={{ padding: 1, textAlign: "center", backgroundColor: "#f4f4f4", marginBottom: 2 }}>
          <Typography variant="h5">Comparative Analysis - Thread States</Typography>
        </Paper>
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="medium">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold',backgroundColor:'black', color:'white' }}>Thread</TableCell>
                {threadStatesData.timestamps.map((timestamp) => (
                  <TableCell sx={{ fontWeight: 'bold',backgroundColor:'black', color:'white' }} key={timestamp}>
                    Stacktrace @{timestamp}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {threadStatesData.threadInfos.map((threadInfo) => (
                <TableRow key={threadInfo.threadName}>
                  <TableCell>{threadInfo.threadName}</TableCell>
                  {threadStatesData.timestamps.map((timestamp) => {
                    const state = threadInfo.states[timestamp] || 'UNKNOWN';
                    return (
                      <TableCell key={`${threadInfo.threadName}-${timestamp}`}>
                        <Box display="flex" alignItems="center">
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '4px',
                              marginRight: 1,
                              backgroundColor: getStateColor(state)
                            }}
                            title={state}
                          />
                          {state}
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

    // Thread Pool Statistics Section
    const renderThreadPoolStatistics = () => {
      if (!threadPoolData || !threadPoolData.threadPools || !threadPoolData.timestamps) {
        return null;
      }
  
      const getStateColor = (state) => {
        switch (state) {
          case 'RUNNABLE': return '#4CAF50'; // Green
          case 'BLOCKED': return '#F44336'; // Red
          case 'WAITING': return '#FFEB3B'; // Yellow
          case 'TIMED_WAITING': return '#2196F3'; // Blue
          default: return '#9E9E9E'; // Gray
        }
      };
  
      // Prepare data for bar chart (top 5 thread pools)
      const topPools = [...threadPoolData.threadPools]
        .sort((a, b) => {
          const maxA = Math.max(...threadPoolData.timestamps.map(t => 
            a.poolDataByMinute[t]?.threadCount || 0
          ));
          const maxB = Math.max(...threadPoolData.timestamps.map(t => 
            b.poolDataByMinute[t]?.threadCount || 0
          ));
          return maxB - maxA;
        })
        .slice(0, 5);
  
      const barChartData = {
        labels: threadPoolData.timestamps,
        datasets: topPools.map(pool => ({
          label: pool.name,
          data: threadPoolData.timestamps.map(timestamp => 
            pool.poolDataByMinute[timestamp]?.threadCount || 0
          ),
          backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
        }))
      };
  
      return (
        <Box mt={4}>
          <Paper sx={{ padding: 1, textAlign: "center", backgroundColor: "#f4f4f4", marginBottom: 2 }}>
            <Typography variant="h5">Comparative Analysis - Thread Pool Statistics</Typography>
          </Paper>
  
          {/* Bar Chart for Top 5 Thread Pools */}
          <Paper sx={{ padding: 2, marginBottom: 2 }}>
            <Typography variant="h6" textAlign="center" gutterBottom>
              Top 5 Thread Pools Count
            </Typography>
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  x: {
                    stacked: false,
                    title: {
                      display: true,
                      text: 'Timestamp',
                    }
                  },
                  y: {
                    stacked: false,
                    title: {
                      display: true,
                      text: 'Thread Count',
                    },
                    beginAtZero: true
                  }
                }
              }}
            />
          </Paper>
  
          {/* Thread Pool State Distribution Table */}
          <Paper sx={{ padding: 1, textAlign: "center", backgroundColor: "#f4f4f4", marginBottom: 2 }}>
            <Typography variant="h6" textAlign="center">
              Thread Pool State Distribution
            </Typography>
          </Paper>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'black', color: 'white' }}>
                    Thread Pool
                  </TableCell>
                  {threadPoolData.timestamps.map(timestamp => (
                    <TableCell 
                      key={timestamp} 
                      sx={{ fontWeight: 'bold', backgroundColor: 'black', color: 'white' }}
                    >
                      Stacktrace @{timestamp}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {threadPoolData.threadPools.map(pool => (
                  <TableRow key={pool.name}>
                    <TableCell>{pool.name}</TableCell>
                    {threadPoolData.timestamps.map(timestamp => {
                      const poolData = pool.poolDataByMinute[timestamp];
                      if (!poolData) {
                        return <TableCell key={`${pool.name}-${timestamp}`}>N/A</TableCell>;
                      }
  
                      const stateCounts = poolData.stateCounts || {};
                      const states = Object.keys(stateCounts);
                      const totalThreads = poolData.threadCount;
  
                      const pieData = {
                        labels: states,
                        datasets: [{
                          data: states.map(state => stateCounts[state]),
                          backgroundColor: states.map(state => getStateColor(state)),
                          borderWidth: 1,
                        }]
                      };
  
                      return (
                        <TableCell key={`${pool.name}-${timestamp}`}>
                          <Box display="flex" flexDirection="column" alignItems="center">
                            <Typography variant="caption" gutterBottom>
                              Thread Count: {totalThreads}
                            </Typography>
                            <Box width="120px" height="120px">
                              <Pie
                                data={pieData}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: {
                                      display: false,
                                    },
                                  },
                                  cutout: '50%', // Makes it a donut chart
                                }}
                              />
                            </Box>
                            <Box display="flex" flexWrap="wrap" justifyContent="center" mt={1}>
                              {states.map(state => (
                                <Box key={state} display="flex" alignItems="center" mr={2} mb={1}>
                                  <Box
                                    width={12}
                                    height={12}
                                    bgcolor={getStateColor(state)}
                                    mr={0.5}
                                  />
                                  <Typography variant="caption">
                                    {state}: {stateCounts[state]}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      );
    };

  return (
    <Box>
      {renderThreadCountStatistics()}
      {renderThreadStates()}
      {renderThreadPoolStatistics()}
    </Box>
  );
};

export default ComparativeAnalysis;