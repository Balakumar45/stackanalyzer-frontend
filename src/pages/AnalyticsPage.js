import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Typography, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
//import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ThreadSummaryCount from "../components/analytics/ThreadSummaryCount";
import ThreadPoolStatistics from "../components/analytics/ThreadPoolStatistics";
import IdenticalStackTraces from "../components/analytics/IdenticalStackTraces";
import StackLength from "../components/analytics/StackLength";
import GCThreads from "../components/analytics/GCThreads";
import LastExecutedMethods from "../components/analytics/LastExecutedMethods"

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const navigationItems = [
  "Thread Summary Count",
  "Thread Pool Statistics",
  "Identical Stack Trace",
  "Last Executed Methods",
  "Blocking Threads",
  "GC Threads",
  "Stack Length",
  "Deadlock",
];

const AnalyticsPage = () => {
  const location = useLocation();
  const { fileName, selectedMinutes } = location.state || {};

  const [selectedItem, setSelectedItem] = useState("Thread Summary Count"); // Default to the first item
  const [threadSummary, setThreadSummary] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [stackTraces, setStackTraces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  useEffect(() => {
    if (fileName && selectedMinutes?.length > 0) {
      const queryString = `fileName=${fileName}&` + selectedMinutes.map(min => `minutes=${min}`).join('&');
      const url = `http://localhost:8080/api/get-thread-summary?${queryString}`;
      axios
        .get(url)
        .then((res) => setThreadSummary(res.data))
        .catch((err) => {
          console.error("Error fetching thread summary:", err);
          setThreadSummary(null); // Reset threadSummary in case of error
        });
    }
  }, [fileName, selectedMinutes]);

  const fetchStackTraces = useCallback(async (state, pageNumber) => {
    setLoading(true);
    const queryString = `fileName=${fileName}&minutes=${selectedMinutes}&state=${state}&page=${pageNumber}`;
    const url = `http://localhost:8080/api/get-state-traces?${queryString}`;
    try {
      const response = await axios.get(url, { responseType: 'text' });
      const traces = response.data.split("\n\n").filter(trace => trace.trim() !== "");

      if (traces.length === 0) {
        setHasMore(false);
      } else {
        setStackTraces((prevTraces) => [...prevTraces, ...traces]);
      }
    } catch (err) {
      console.error("Error fetching stack traces:", err);
    } finally {
      setLoading(false);
    }
  }, [fileName, selectedMinutes]);

  useEffect(() => {
    if (selectedState) {
      setStackTraces([]);
      setPage(1);
      setHasMore(true);
      fetchStackTraces(selectedState, 1);
    }
  }, [selectedState, fetchStackTraces]);

  useEffect(() => {
    if (page > 1 && hasMore) {
      fetchStackTraces(selectedState, page);
    }
  }, [page, selectedState, fetchStackTraces, hasMore]);

  const lastTraceElementRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Navigation Panel */}
        <Box sx={{ width: 250, backgroundColor: "lightblue", padding: 2 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, textAlign: "center" }}>
            Thread Analytics
          </Typography>
          <List>
            {navigationItems.map((item) => (
              <ListItem key={item} disablePadding>
                <ListItemButton selected={selectedItem === item} onClick={() => setSelectedItem(item)}>
                  <ListItemText primary={item} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Right Panel */}
        <Box sx={{ flex: 1, padding: 3, backgroundColor: "#f0f2f5" }}>
          {/* Static File Info - Single Line Layout */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            {fileName && (
              <Typography variant="h6">
                <strong>File Name:</strong> {fileName}
              </Typography>
            )}
            {selectedMinutes && (
              <Typography variant="h6">
                <strong>Timestamp:</strong> {selectedMinutes.join(", ")}
              </Typography>
            )}
          </Box>

          {/* Dynamic Content */}
          {selectedItem === "Thread Summary Count" && (
            <ThreadSummaryCount
              fileName={fileName}
              selectedMinutes={selectedMinutes}
              threadSummary={threadSummary}
              selectedState={selectedState}
              setSelectedState={setSelectedState}
              stackTraces={stackTraces}
              loading={loading}
              lastTraceElementRef={lastTraceElementRef}
              hasMore={hasMore}
            />
          )}
          {selectedItem === "Thread Pool Statistics" && (
            <ThreadPoolStatistics fileName={fileName} selectedMinutes={selectedMinutes} />
          )}
          {selectedItem === "Identical Stack Trace" && (
            <IdenticalStackTraces fileName={fileName} selectedMinutes={selectedMinutes} />
          )}
            {selectedItem === "Stack Length" && (
            <StackLength fileName={fileName} selectedMinutes={selectedMinutes} />
          )}
            {selectedItem === "GC Threads" && (
            <GCThreads fileName={fileName} selectedMinutes={selectedMinutes} />
          )}
            {selectedItem === "Last Executed Methods" && (
            <LastExecutedMethods fileName={fileName} selectedMinutes={selectedMinutes} />
          )}
          {/* Add other navigation items here */}
        </Box>
      </Box>

      <Footer />
    </Box>
  );
};

export default AnalyticsPage;