import React, { useState, useEffect } from "react";
import { Box, Typography, List, ListItem, ListItemButton, ListItemText, IconButton, Select, MenuItem, CircularProgress } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../Header";
import Footer from "../Footer";
import ThreadSummaryCount from "./ThreadSummaryCount";
import ThreadPoolStatistics from "./ThreadPoolStatistics";
import IdenticalStackTraces from "./IdenticalStackTraces";
import StackLength from "./StackLength";
import GCThreads from "./GCThreads";
import LastExecutedMethods from "./LastExecutedMethods";
import BlockingThreads from "./BlockingThreads";
import Deadlock from "./Deadlock";
import ComparativeAnalysis from "./ComparativeAnalysis";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);
const apiBaseUrl = process.env.REACT_APP_TD_API_URL;

const AnalyticsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { uploadDate, threadDumpFiles, fileDetails } = location.state || {};

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
    if (threadDumpFiles?.length > 1) {
      return ["Comparative Analysis", ...baseItems];
    }
    return baseItems;
  };

  // Set default selected item based on threadDumpFiles length
  const [selectedItem, setSelectedItem] = useState(() => {
    return threadDumpFiles?.length > 1 ? "Comparative Analysis" : "Thread Summary Count";
  });
  const [selectedDumpFile, setSelectedDumpFile] = useState(() => {
    return threadDumpFiles?.length > 0 ? threadDumpFiles[0] : "";
  });

  // Dynamic navigation items
  const navigationItems = getNavigationItems();
  const [threadSummary, setThreadSummary] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle timestamp change
  const handleDumpFileChange = (event) => {
    setSelectedDumpFile(event.target.value);
  };

  // Handle navigation (back to dashboard)
  const handleBack = () => {
    navigate("/threaddump");
  };

  // Fetch thread summary
  useEffect(() => {
    if (uploadDate && threadDumpFiles?.length > 0) {
      setLoading(true);
      const threadDumpFilesParam = threadDumpFiles.length > 1 ? [selectedDumpFile] : threadDumpFiles;
      const queryString = `uploadDate=${uploadDate}&` + threadDumpFilesParam.map((file) => `threadDumpFiles=${file}`).join("&");
      const url = `${apiBaseUrl}/api/threaddump/get-thread-summary?${queryString}`;
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
          setLoading(false);
        });
    }
  }, [uploadDate, threadDumpFiles, selectedDumpFile]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Navigation Panel */}
        <Box sx={{ width: { xs: 180, md: 210 }, backgroundColor: "lightblue", padding: { xs: 1, sm: 2 },overflowY: 'auto'}}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, textAlign: "center",fontSize: { xs: '1rem', sm: '1rem', md: '1rem' } }}>
            ThreadDump Analytics
          </Typography>
          <List dense>
            {navigationItems.map((item) => (
              <ListItem key={item} disablePadding>
                <ListItemButton selected={selectedItem === item} onClick={() => setSelectedItem(item)}    
                sx={{py: { xs: 0.5, sm: 1 },'&.Mui-selected': { backgroundColor: '#1976d2', color: 'white'}}}>
                  <ListItemText primary={item}  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Right Panel */}
        <Box sx={{ flex: 1, padding: { xs: 1, sm: 2 }, backgroundColor: "#f0f2f5",overflowY: 'auto' }}>
        {/* File Info Header */}
        <Box sx={{
          display: "flex",
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: "flex-start",
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1,
          marginBottom: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={handleBack}
              sx={{ mr: 1 }}
              aria-label="back to dashboard"
              size="small"
            >
              <ArrowBackIcon fontSize="inherit" />
            </IconButton>
            {uploadDate && (
              selectedItem !== "Comparative Analysis" ? (
                <>
                  <Typography variant="subtitle1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, mr: 1 }}>
                    <strong>File:</strong>
                  </Typography>
                  <Select
                    value={selectedDumpFile}
                    onChange={handleDumpFileChange}
                    size="small"
                    sx={{ minWidth: 160, maxHeight: 30, fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  >
                    {threadDumpFiles.map((fileKey) => (
                      <MenuItem key={fileKey} value={fileKey} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {fileDetails[fileKey]?.fileName || fileKey}
                      </MenuItem>
                    ))}
                  </Select>
                  <Typography variant="subtitle1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, ml: 48 }}>
                    <strong>Timestamp:</strong> {fileDetails[selectedDumpFile]}
                  </Typography>
                </>
              ) : (
                <Typography variant="subtitle1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  <strong>Files:</strong> {threadDumpFiles.map((fileKey) => fileDetails[fileKey]?.fileName || fileKey).join(", ")}
                </Typography>
              )
            )}
          </Box>
        </Box>
          {/* Dynamic Content */}
          {selectedItem === "Thread Summary Count" && (
            <Box sx={{ minHeight: 400, position: "relative", width: "100%" }}>
              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "#f0f2f5",
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : (
                <ThreadSummaryCount
                  uploadDate={uploadDate}
                  selectedFile={threadDumpFiles.length > 1 ? [selectedDumpFile] : threadDumpFiles}
                  fileDetails={fileDetails}
                  threadSummary={threadSummary}
                  selectedState={selectedState}
                  setSelectedState={setSelectedState}
                />
              )}
            </Box>
          )}
          {selectedItem === "Comparative Analysis" && <ComparativeAnalysis uploadDate={uploadDate} threadDumpFiles={threadDumpFiles} />}
          {selectedItem === "Thread Pool Statistics" && (
            <ThreadPoolStatistics uploadDate={uploadDate} threadDumpFiles={threadDumpFiles.length > 1 ? [selectedDumpFile] : threadDumpFiles} />
          )}
          {selectedItem === "Identical Stack Trace" && (
            <IdenticalStackTraces uploadDate={uploadDate} threadDumpFiles={threadDumpFiles.length > 1 ? [selectedDumpFile] : threadDumpFiles} />
          )}
          {selectedItem === "Stack Length" && (
            <StackLength uploadDate={uploadDate} threadDumpFiles={threadDumpFiles.length > 1 ? [selectedDumpFile] : threadDumpFiles} />
          )}
          {selectedItem === "GC Threads" && (
            <GCThreads uploadDate={uploadDate} threadDumpFiles={threadDumpFiles.length > 1 ? [selectedDumpFile] : threadDumpFiles} />
          )}
          {selectedItem === "Last Executed Methods" && (
            <LastExecutedMethods uploadDate={uploadDate} threadDumpFiles={threadDumpFiles.length > 1 ? [selectedDumpFile] : threadDumpFiles} />
          )}
          {selectedItem === "Blocking Threads" && <BlockingThreads uploadDate={uploadDate} selectedFile={selectedDumpFile} />}
          {selectedItem === "Deadlock" && <Deadlock uploadDate={uploadDate} selectedFile={selectedDumpFile} />}
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default AnalyticsPage;