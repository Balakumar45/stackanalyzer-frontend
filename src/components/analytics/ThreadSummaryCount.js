import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Typography, Grid, Paper, Button } from "@mui/material";
import { Pie } from "react-chartjs-2";

const apiBaseUrl = process.env.REACT_APP_API_URL;

const ThreadSummaryCount = ({ fileName, selectedMinutes, threadSummary, selectedState, setSelectedState }) => {
  // Local state for stack traces
  const [stackTraces, setStackTraces] = useState([]);
  const [traceLoading, setTraceLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  // Define a loading flag without early-returning
  const isLoadingSummary = !threadSummary || !selectedMinutes || !threadSummary[selectedMinutes];

  // Define currentSummary and threadStates only if available
  const currentSummary = !isLoadingSummary ? threadSummary[selectedMinutes] : {};
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
        data: [
          (!isLoadingSummary && threadSummary[selectedMinutes].daemonThreadCount) || 0, 
          (!isLoadingSummary && threadSummary[selectedMinutes].nonDaemonThreadCount) || 0
        ],
        backgroundColor: ["#008080", "#FFA500"],
      },
    ],
  };

  // Fetch stack traces for the selected state and page.
  const fetchStackTraces = useCallback(async (state, pageNumber) => {
    setTraceLoading(true);
    const queryString = `fileName=${fileName}&` +
      selectedMinutes.map(min => `minutes=${min}`).join('&') +
      `&state=${state}&page=${pageNumber}`;
    const url = `${apiBaseUrl}/api/get-state-traces?${queryString}`;
    try {
      const response = await fetch(url);
      const data = await response.text();
      const traces = data.split("\n\n").filter(trace => trace.trim() !== "");
      if (traces.length === 0) {
        setHasMore(false);
      } else {
        setStackTraces(prevTraces => [...prevTraces, ...traces]);
      }
    } catch (err) {
      console.error("Error fetching stack traces:", err);
    } finally {
      setTraceLoading(false);
    }
  }, [fileName, selectedMinutes]);

  // When selectedState changes, reset stackTraces and page then fetch new traces
  useEffect(() => {
    if (selectedState) {
      setStackTraces([]);
      setPage(1);
      setHasMore(true);
      fetchStackTraces(selectedState, 1);
    }
  }, [selectedState, fetchStackTraces]);

  // Fetch next page of stack traces when page changes (except for the initial fetch)
  useEffect(() => {
    if (page > 1 && hasMore) {
      fetchStackTraces(selectedState, page);
    }
  }, [page, selectedState, fetchStackTraces, hasMore]);

  // Intersection observer to detect when user scrolls to the bottom of the trace display area.
  const lastTraceElementRef = useCallback((node) => {
    if (traceLoading || !hasMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [traceLoading, hasMore]);

  return (
    <>
      {isLoadingSummary ? (
        <Typography>Loading thread summary...</Typography>
      ) : (
        <>
          {/* Total Threads */}
          <Paper sx={{ padding: 0.2, textAlign: "center", backgroundColor: "#f4f4f4", marginBottom: 1 }}>
            <Typography variant="h6">Total Threads: {threadSummary[selectedMinutes].totalThreads}</Typography>
          </Paper>

          <Grid container spacing={2}>
            {/* State Distribution */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6">State Distribution Summary</Typography>
              <Grid container spacing={0.5}>
                {threadStates.map((state, index) => (
                  <Grid item xs={6} key={index}>
                    <Paper sx={{ padding: 1, textAlign: "center", backgroundColor: "#f4f4f4" }}>
                      <Typography variant="subtitle2">{state.state}</Typography>
                      <Typography variant="h6">{state.count}</Typography>
                      <Typography variant="body2">{state.percentage.toFixed(2)}%</Typography>
                      <Button type="button" onClick={() => setSelectedState(state.state)}>View Traces</Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Daemon vs Non-Daemon Threads Section */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Daemon vs Non-Daemon Threads</Typography>
              <Grid container spacing={0.5}>
                {[
                  { label: 'Daemon Threads', count: threadSummary[selectedMinutes].daemonThreadCount, percentage: threadSummary[selectedMinutes].daemonThreadPercentage },
                  { label: 'Non-Daemon Threads', count: threadSummary[selectedMinutes].nonDaemonThreadCount, percentage: threadSummary[selectedMinutes].nonDaemonThreadPercentage }
                ].map((item, index) => (
                  <Grid item xs={6} key={index}>
                    <Paper sx={{ padding: 0.5, textAlign: "center", backgroundColor: "#f4f4f4" }}>
                      <Typography variant="subtitle2">{item.label}</Typography>
                      <Typography variant="h6">{item.count}</Typography>
                      <Typography variant="body2">{item.percentage.toFixed(2)}%</Typography>
                    </Paper>
                  </Grid>
                ))}
                <Grid container spacing={0.5}>
                  <Grid item xs={6} textAlign="center">
                    <Pie data={statePieData} options={{ responsive: true, plugins: { legend: { labels: { font: {size:10, }}} } }}/>
                    <Typography variant="h7">State Distribution %</Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="center">
                    <Pie data={daemonPieData} options={{ responsive: true, plugins: { legend: { labels: { font: {size:10, }}} } }}/>
                    <Typography variant="h7">Daemon Vs Non Daemon %</Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Stacktrace Display Area */}
          {selectedState && (
            <Box sx={{ marginTop: 3, backgroundColor: '#fff', padding: 2, borderRadius: 2, maxHeight: '400px', overflowY: 'auto' }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>Stacktrace for State: {selectedState}</Typography>
              {stackTraces.length > 0 ? (
                stackTraces.map((trace, index) => (
                  <Box key={index} sx={{ mb: 2, p:1, backgroundColor: '#f9f9f9', borderRadius: 1}} ref={index === stackTraces.length - 1 ? lastTraceElementRef : null}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.75rem'}}>{trace}</Typography>
                  </Box>
                ))
              ) : (
                !traceLoading && <Typography variant="body2">No stacktrace available for the selected state.</Typography>
              )}
              {traceLoading && (<Typography variant="body2" sx={{ textAlign: 'center', py: 1 }}>Loading more stack traces...</Typography>
              )}
              {!hasMore && !traceLoading && (<Typography variant="body2" sx={{ textAlign: 'center', py: 1 }}>No more stack traces to load.</Typography>
              )}
            </Box>
          )}
        </>
      )}
    </>
  );
};

export default ThreadSummaryCount;