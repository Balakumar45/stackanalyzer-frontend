import React, { useEffect, useState, useRef } from "react";
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper 
} from "@mui/material";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import axios from "axios";

// Register Chart.js components
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const backendHost = process.env.REACT_APP_BACKEND_HOST || '';

const IdenticalStackTraces = ({ fileName, selectedMinutes }) => {
  const [identicalTraces, setIdenticalTraces] = useState([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);

  useEffect(() => {
    if (fileName && selectedMinutes) {
      const queryString = `fileName=${fileName}&minutes=${selectedMinutes}`;
      const url = `${backendHost}/api/get-identical-stack-traces?${queryString}`;
      axios
        .get(url)
        .then((res) => {
          setIdenticalTraces(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching identical stack traces:", err);
          setLoading(false);
        });
    }
  
    // Store the current chart instance in a variable
    const chartInstance = chartRef.current;
  
    return () => {
      // Cleanup chart instance when component unmounts
      if (chartInstance && chartInstance.chartInstance) {
        chartInstance.chartInstance.destroy();
      }
    };
  }, [fileName, selectedMinutes]);

  if (loading) {
    return <Typography>Loading identical stack traces...</Typography>;
  }

  if (identicalTraces.length === 0) {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Threads with Identical Stack Trace
        </Typography>
        <Typography>No identical stack traces found.</Typography>
      </Box>
    );
  }

  // Prepare data for the bar chart
  const barChartData = {
    labels: identicalTraces.map((trace, index) => `StackTrace ${index + 1}`),
    datasets: [
      {
        label: "Thread Count",
        data: identicalTraces.map((trace) => trace.count),
        backgroundColor: "#3498DB",
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        type: 'linear',
        beginAtZero: true,
        title: {
          display: true,
          text: "Thread Count"
        }
      },
      x: {
        title: {
          display: true,
          text: "Stack Traces"
        }
      }
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Threads with Identical Stack Trace
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
        Threads with identical stack traces are grouped here. If many threads exhibit identical stack traces, it might indicate a concern (learn RSI Pattern).
      </Typography>

      {/* Bar Chart */}
      <Box sx={{ height: "400px", mb: 4 }}>
        <Bar
          ref={chartRef}
          data={barChartData}
          options={barChartOptions}
          key={`chart-${identicalTraces.length}`} // Force re-render when data changes
        />
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table sx={{
          borderCollapse: 'collapse',
          '& th, & td': {
            border: '1px solid #e0e0e0', // Light gray border for all cells
            '&:first-of-type': { borderTopLeftRadius: '8px' },
            '&:last-of-type': { borderTopRightRadius: '8px' }
          }
        }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{
                fontWeight: 'bold',
                backgroundColor: 'black',
                color: 'white',
                fontSize: '1rem', // Increased font size
                padding: '16px', // Increased padding
                borderRight: '2px solid white' // Right border for columns
              }}>
                Thread Count
              </TableCell>
              <TableCell sx={{
                fontWeight: 'bold',
                backgroundColor: 'black',
                color: 'white',
                fontSize: '1rem',
                padding: '16px',
                borderLeft: '2px solid white', // Left border for columns
                textAlign: 'center'
              }}>
                Identical Stack Trace
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {identicalTraces.map((trace, index) => (
              <TableRow key={`${trace.stackTraceHash}-${index}`} hover>
                <TableCell sx={{
                  borderRight: '1px solid #e0e0e0',
                  padding: '12px',
                  textAlign: 'center'
                }}>
                  {trace.count}
                </TableCell>
                <TableCell sx={{ 
                  whiteSpace: "pre-wrap", 
                  fontFamily: "monospace",
                  padding: '12px'
                }}>
                  {trace.stackTrace}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default IdenticalStackTraces;