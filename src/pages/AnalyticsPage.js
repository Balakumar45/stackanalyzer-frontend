import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Typography, List, ListItem, ListItemButton, ListItemText, IconButton, Select, MenuItem,CircularProgress } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useLocation,useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ThreadSummaryCount from "../components/analytics/ThreadSummaryCount";
import ThreadPoolStatistics from "../components/analytics/ThreadPoolStatistics";
import IdenticalStackTraces from "../components/analytics/IdenticalStackTraces";
import StackLength from "../components/analytics/StackLength";
import GCThreads from "../components/analytics/GCThreads";
import LastExecutedMethods from "../components/analytics/LastExecutedMethods"
import BlockingThreads from "../components/analytics/BlockingThreads"
import Deadlock from "../components/analytics/Deadlock";
import ComparativeAnalysis from "../components/analytics/ComparativeAnalysis";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const AnalyticsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fileName, selectedMinutes } = location.state || {};

  const getNavigationItems = () => {
    const baseItems = [
    "Thread Summary Count",
    "Thread Pool Statistics",
    "Identical Stack Trace",
    "Last Executed Methods",
    "Blocking Threads",
    "GC Threads",
    "Stack Length",
    "Deadlock",
    ];
    if (selectedMinutes?.length > 1) {
      return ["Comparative Analysis", ...baseItems];
    }
    return baseItems;
  };
    // Set default selected item based on selectedMinutes length
    const [selectedItem, setSelectedItem] = useState(() => {
      return selectedMinutes?.length > 1 ? "Comparative Analysis" : "Thread Summary Count";
    });
    const [selectedTimestamp, setSelectedTimestamp] = useState(() => {
      return selectedMinutes?.length > 0 ? selectedMinutes[0] : '';
    });
  
    // Replace the static navigationItems array with the dynamic function
    const navigationItems = getNavigationItems();
    const [threadSummary, setThreadSummary] = useState(null);
    const [selectedState, setSelectedState] = useState(null);
    const [stackTraces, setStackTraces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();

    // Add handler for timestamp change
    const handleTimestampChange = (event) => {
    setSelectedTimestamp(event.target.value);
    };

    // Add this function to handle navigation
    const handleBack = () => {
      navigate('/dashboard', { state: { fileName } });
    };

    useEffect(() => {
      if (fileName && selectedMinutes?.length > 0) {
        setLoading(true); // Set loading to true before fetch
        const minutes = selectedMinutes.length > 1 ? [selectedTimestamp] : selectedMinutes;
        const queryString = `fileName=${fileName}&` + minutes.map(min => `minutes=${min}`).join('&');
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
    }, [fileName, selectedMinutes, selectedTimestamp]);

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
          <IconButton 
            onClick={handleBack}
            sx={{ mr: 2 }}
            aria-label="back to dashboard"
          >
            <ArrowBackIcon />
          </IconButton>
            {fileName && (
              <Typography variant="h6">
                <strong>File Name:</strong> {fileName}
              </Typography>
            )}
              {selectedMinutes && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ mr: 1 }}>
                    <strong>Timestamp:</strong>
                  </Typography>
                  {selectedMinutes.length > 1 ? (
                    <Select
                      value={selectedTimestamp}
                      onChange={handleTimestampChange}
                      size="small"
                      sx={{ minWidth: 120 }}
                    >
                      {selectedMinutes.map((minute) => (
                        <MenuItem key={minute} value={minute}>
                          {minute}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : (
                    <Typography variant="h6">
                      {selectedMinutes[0]}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          {/* Dynamic Content */}
          {selectedItem === "Thread Summary Count" && (
            <Box sx={{ 
              minHeight: 400, // Set a minimum height to prevent layout shifts
              position: 'relative',
              width: '100%'
            }}>
              {loading ? (
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.7)'
                }}>
                  <CircularProgress />
                </Box>
              ) : (
                <ThreadSummaryCount
                  fileName={fileName}
                  selectedMinutes={selectedMinutes.length > 1 ? [selectedTimestamp] : selectedMinutes}
                  threadSummary={threadSummary}
                  selectedState={selectedState}
                  setSelectedState={setSelectedState}
                  stackTraces={stackTraces}
                  loading={loading}
                  lastTraceElementRef={lastTraceElementRef}
                  hasMore={hasMore}
                />
              )}
            </Box>
          )}
          {selectedItem === "Comparative Analysis" && (
            <ComparativeAnalysis 
              fileName={fileName} 
              selectedMinutes={selectedMinutes.length > 1 ? [selectedTimestamp] : selectedMinutes} 
            />
          )}
          {selectedItem === "Thread Pool Statistics" && (
            <ThreadPoolStatistics 
              fileName={fileName} 
              selectedMinutes={selectedMinutes.length > 1 ? [selectedTimestamp] : selectedMinutes} 
            />
          )}
          {selectedItem === "Identical Stack Trace" && (
            <IdenticalStackTraces 
              fileName={fileName} 
              selectedMinutes={selectedMinutes.length > 1 ? [selectedTimestamp] : selectedMinutes} 
            />
          )}
            {selectedItem === "Stack Length" && (
              <StackLength 
                fileName={fileName} 
                selectedMinutes={selectedMinutes.length > 1 ? [selectedTimestamp] : selectedMinutes} 
              />
          )}
            {selectedItem === "GC Threads" && (
              <GCThreads 
                fileName={fileName} 
                selectedMinutes={selectedMinutes.length > 1 ? [selectedTimestamp] : selectedMinutes} 
              />
          )}
            {selectedItem === "Last Executed Methods" && (
              <LastExecutedMethods 
                fileName={fileName} 
                selectedMinutes={selectedMinutes.length > 1 ? [selectedTimestamp] : selectedMinutes} 
              />
          )}
            {selectedItem === "Blocking Threads" && (
            <BlockingThreads/>
          )} 
            {selectedItem === "Deadlock" && (
            <Deadlock />
          )}
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default AnalyticsPage;