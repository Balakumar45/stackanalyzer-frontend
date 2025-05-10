import React, { useEffect, useState } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { Pie } from "react-chartjs-2";
import axios from "axios";

const apiBaseUrl = process.env.REACT_APP_API_URL;

const ThreadPoolStatistics = ({ fileName, selectedMinutes }) => {
  const [threadPoolData, setThreadPoolData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Utility function to generate dynamic colors using HSL model
  const generateColor = (index, total) => {
    const hue = index * (360 / total);
    return `hsl(${hue}, 60%, 50%)`;
  };

  // Define state colors for known states and a fallback for dynamic ones
  const stateColors = {
    RUNNABLE: "#4CAF50",      // Green
    BLOCKED: "#FF0000",       // Red
    TIMED_WAITING: "#FFA500", // Orange
    WAITING: "#FFD700",       // Yellow
  };

  const getStateColor = (state) => {
    return stateColors[state] || `#${Math.floor(Math.random()*16777215).toString(16)}`;
  };

  useEffect(() => {
    if (fileName && selectedMinutes) {
      const queryString = `fileName=${fileName}&minutes=${selectedMinutes}`;
      const url = `${apiBaseUrl}/api/get-thread-pool-statistics?${queryString}`;
      axios.get(url)
        .then((res) => {
          setThreadPoolData(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching thread pool statistics:", err);
          setLoading(false);
        });
    }
  }, [fileName, selectedMinutes]);

  if (loading) {
    return <Typography>Loading thread pool statistics...</Typography>;
  }
  
  // Dynamically generate a color for each thread pool
  const poolColors = threadPoolData.map((_, index) =>
    generateColor(index, threadPoolData.length)
  );

  // Prepare data for the main pie chart without labels
  const pieChartData = {
    labels: threadPoolData.map((pool) => pool.threadPool),
    datasets: [
      {
        data: threadPoolData.map((pool) => pool.count),
        backgroundColor: poolColors,
      },
    ],
  };

  const mainChartOptions = {
    plugins: {
      legend: { display: false },
    },
    maintainAspectRatio: false,
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "row", gap: 2, padding: 2 }}>
      {/* Table Section */}
      <Box sx={{ flex: 1, maxWidth: "70%" }}>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Thread Pool Statistics Table
        </Typography>
        <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
          Threads with similar names are grouped in this section
        </Typography>
        <TableContainer
          component={Paper}
          sx={{
            maxHeight: 400, // Fixed height for vertical scrolling
            overflowY: "auto",
            width: "100%",
          }}
        >
          <Table
            stickyHeader
            sx={{
              borderCollapse: "collapse",
               tableLayout: "fixed",
               "& th, & td": {
                border: "1px solid #e0e0e0",
                padding: "12px",
                textAlign: "center",
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: "#1565C0", backgroundColor: 'black', color: "white", fontWeight: "bold", width: "40px" }}>
                  Label
                </TableCell>
                <TableCell sx={{ bgcolor: "#1565C0", backgroundColor: 'black', color: "white", fontWeight: "bold",minWidth: "200px" }}>
                  Thread Pool
                </TableCell>
                <TableCell sx={{ bgcolor: "#1565C0", backgroundColor: 'black', color: "white", fontWeight: "bold", width: "40px" }}>
                  Count
                </TableCell>
                <TableCell sx={{ bgcolor: "#1565C0", backgroundColor: 'black', color: "white", fontWeight: "bold",width: "200px" }}>
                  States
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {threadPoolData.map((pool, index) => (
                <TableRow key={pool.threadPool} hover>
                  <TableCell>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: poolColors[index],
                        margin: "0 auto",
                        borderRadius: "50%",
                      }}
                    />
                  </TableCell>
                  <TableCell 
                      sx={{
                        maxWidth: "200px",
                        whiteSpace: "normal", // Allow text wrapping
                        wordWrap: "break-word", // Break words if needed
                        padding: "8px",
                      }}
                    >
                      {pool.threadPool}
                    </TableCell>
                  <TableCell >{pool.count}</TableCell>
                  <TableCell>
                    <Pie
                      data={{
                        labels: Object.keys(pool.stateCounts),
                        datasets: [{
                          data: Object.values(pool.stateCounts),
                          backgroundColor: Object.keys(pool.stateCounts).map(getStateColor),
                        }],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Pie Chart Section */}
      <Box sx={{ flex: 1, maxWidth: "30%", alignItems: "right", padding: 2 }}>
        <Box sx={{ width: "100%", height: 300 }}>
          <Typography variant="h5" sx={{ mb: 2, textAlign: "center"}}>
            Thread Pool Statistics Chart
          </Typography>
          <Pie data={pieChartData} options={mainChartOptions} />
        </Box>
      </Box>
    </Box>
  );
};

export default ThreadPoolStatistics;