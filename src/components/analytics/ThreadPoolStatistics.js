import React, { useEffect, useState } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { Pie } from "react-chartjs-2";
import axios from "axios";

const ThreadPoolStatistics = ({ fileName, selectedMinutes }) => {
  const [threadPoolData, setThreadPoolData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (fileName && selectedMinutes) {
      const queryString = `fileName=${fileName}&minutes=${selectedMinutes}`;
      const url = `http://localhost:8080/api/get-thread-pool-statistics?${queryString}`;
      axios
        .get(url)
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

  // Generate colors for thread pools
  const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#A133FF"];

  // Prepare data for the pie chart
  const pieChartData = {
    labels: threadPoolData.map((pool) => pool.threadPool),
    datasets: [
      {
        data: threadPoolData.map((pool) => pool.count),
        backgroundColor: colors.slice(0, threadPoolData.length),
      },
    ],
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Thread Pool Statistics
      </Typography>

      {/* Pie Chart */}
      <Box sx={{ width: "50%", margin: "auto", mb: 4 }}>
        <Pie data={pieChartData} options={{ responsive: true }} />
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Colour Code</TableCell>
              <TableCell>Thread Pool</TableCell>
              <TableCell>Count</TableCell>
              <TableCell>States</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {threadPoolData.map((pool, index) => (
              <TableRow key={pool.threadPool}>
                <TableCell>
                  <Box sx={{ width: 20, height: 20, backgroundColor: colors[index] }} />
                </TableCell>
                <TableCell>{pool.threadPool}</TableCell>
                <TableCell>{pool.count}</TableCell>
                <TableCell>
                  <Pie
                    data={{
                      labels: Object.keys(pool.stateCounts),
                      datasets: [
                        {
                          data: Object.values(pool.stateCounts),
                          backgroundColor: ["#4CAF50", "#FF5733", "#FFC300", "#3498DB"],
                        },
                      ],
                    }}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ThreadPoolStatistics;