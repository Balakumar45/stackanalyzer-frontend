import { Box, Typography, Alert, List, ListItem, ListItemText, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";

const apiBaseUrl = process.env.REACT_APP_TD_API_URL

const Deadlocks = ({ uploadDate, selectedFile }) => {
  const [deadlockData, setDeadlockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkDeadlocks = async () => {
      if (!uploadDate || !selectedFile) {
        setError("Missing required parameters: uploadDate or selectedFile");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const queryString = `uploadDate=${uploadDate}&threadDumpFile=${selectedFile}`;
        const url = `${apiBaseUrl}/api/threaddump/identify-deadlock?${queryString}`;
        const response = await axios.get(url);
        setDeadlockData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to analyze deadlocks");
        console.error("Error analyzing deadlocks:", err);
      } finally {
        setLoading(false);
      }
    };

    checkDeadlocks();
  }, [uploadDate, selectedFile]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <Typography variant="h6" sx={{ mb: 0.1, fontWeight: "bold" }}>
          Deadlocks
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Analyzing deadlocks...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <Typography variant="h6" sx={{ mb: 0.1, fontWeight: "bold" }}>
          Deadlocks
        </Typography>
        <Alert severity="error" sx={{ mb: 1, width: '97%' }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <Typography variant="h6" sx={{ mb: 0.1, fontWeight: "bold" }}>
        Deadlocks
      </Typography>
      <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
        Occurs when two or more threads are blocked indefinitely, each waiting for the other to release a resource that it needs to proceed. This can lead to a complete halt in the execution of the program, as the involved threads are unable to make any progress.
      </Typography>
      
      {deadlockData?.hasDeadlocks ? (
        <>
          <Alert severity="error" sx={{ mb: 2, width: '97%' }}>
            {deadlockData.message}
          </Alert>
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {deadlockData.deadlocks.map((deadlock, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={`Thread "${deadlock.blockedThread}" is in deadlock with thread "${deadlock.blockingThread}"`}
                  secondary={`Lock ID: ${deadlock.lockId}`}
                />
              </ListItem>
            ))}
          </List>
        </>
      ) : (
        <Alert severity="success" sx={{ mb: 1, width: '97%' }}>
          {deadlockData?.message || "No Deadlock Found"}
        </Alert>
      )}
    </Box>
  );
};

export default Deadlocks;