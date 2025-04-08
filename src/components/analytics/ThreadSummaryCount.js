import React from "react";
import { Box, Typography, Grid, Paper, Button } from "@mui/material";
import { Pie } from "react-chartjs-2";

const ThreadSummaryCount = ({ fileName, selectedMinutes, threadSummary, selectedState, setSelectedState, stackTraces, loading, lastTraceElementRef, hasMore }) => {
  // Null check for threadSummary
  if (!threadSummary || !selectedMinutes || !threadSummary[selectedMinutes]) {
    return <Typography>Loading thread summary...</Typography>;
  }

  const currentSummary = threadSummary[selectedMinutes];
  const threadStates = currentSummary.threadStates || [];

  const statePieData = {
    labels: threadStates.map((state) => state.state),
    datasets: [
      {
        data: threadStates.map((state) => state.count),
        backgroundColor: ["#4CAF50", "#FF5733", "#FFC300", "#3498DB"],
      },
    ],
  };

  const daemonPieData = {
    labels: ["Daemon Threads", "Non-Daemon Threads"],
    datasets: [
      {
        data: [threadSummary[selectedMinutes].daemonThreadCount || 0, threadSummary[selectedMinutes].nonDaemonThreadCount || 0],
        backgroundColor: ["#008080", "#FFA500"],
      },
    ],
  };

  return (
    <>
      {/* Total Threads */}
      <Paper sx={{ padding: 1, textAlign: "center", backgroundColor: "#f4f4f4", marginBottom: 2 }}>
        <Typography variant="h5">Total Threads: {threadSummary[selectedMinutes].totalThreads}</Typography>
      </Paper>

      <Grid container spacing={2}>
        {/* State Distribution */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6">State Distribution Summary</Typography>
          <Grid container spacing={2}>
            {threadStates.map((state, index) => (
              <Grid item xs={6} key={index}>
                <Paper sx={{ padding: 1, textAlign: "center", backgroundColor: "#f4f4f4" }}>
                  <Typography variant="subtitle1">{state.state}</Typography>
                  <Typography variant="h5">{state.count}</Typography>
                  <Typography variant="body2">{state.percentage.toFixed(2)}%</Typography>
                  <Button onClick={() => setSelectedState(state.state)}>View Traces</Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Daemon vs Non-Daemon Threads Section */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6">Daemon vs Non-Daemon Threads</Typography>
          <Grid container spacing={2}>
            {[{ label: 'Daemon Threads', count: threadSummary[selectedMinutes].daemonThreadCount, percentage: threadSummary[selectedMinutes].daemonThreadPercentage },
              { label: 'Non-Daemon Threads', count: threadSummary[selectedMinutes].nonDaemonThreadCount, percentage: threadSummary[selectedMinutes].nonDaemonThreadPercentage }]
              .map((item, index) => (
                <Grid item xs={6} key={index}>
                  <Paper sx={{ padding: 1, textAlign: "center", backgroundColor: "#f4f4f4" }}>
                    <Typography variant="subtitle1">{item.label}</Typography>
                    <Typography variant="h5">{item.count}</Typography>
                    <Typography variant="body2">{item.percentage.toFixed(2)}%</Typography>
                  </Paper>
                </Grid>
            ))}
            <Grid container spacing={2}>
              <Grid item xs={6} textAlign="center">
                <Pie data={statePieData} options={{ responsive: true }} />
                <Typography variant="h7">State Distribution %</Typography>
              </Grid>
              <Grid item xs={6} textAlign="center">
                <Pie data={daemonPieData} options={{ responsive: true }} />
                <Typography variant="h7">Daemon Vs Non Daemon %</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Stacktrace Display Area */}
      {selectedState && (
        <Box sx={{ marginTop: 3, backgroundColor: '#fff', padding: 2, borderRadius: 2, maxHeight: '400px', overflowY: 'auto' }}>
          <Typography variant="h6">Stacktrace for State: {selectedState}</Typography>
          {stackTraces.length > 0 ? (
            stackTraces.map((trace, index) => (
              <Box key={index} sx={{ marginBottom: 2 }} ref={index === stackTraces.length - 1 ? lastTraceElementRef : null}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{trace}</Typography>
              </Box>
            ))
          ) : (
            <Typography>No stacktrace available for the selected state.</Typography>
          )}
          {loading && <Typography>Loading more stack traces...</Typography>}
          {!hasMore && <Typography>No more stack traces to load.</Typography>}
        </Box>
      )}
    </>
  );
};

export default ThreadSummaryCount;