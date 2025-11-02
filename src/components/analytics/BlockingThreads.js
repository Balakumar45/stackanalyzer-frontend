import { Box, Typography, Alert} from "@mui/material";
const BlockingThreads = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <Typography variant="h6" sx={{ mb: 0.1, fontWeight: "bold" }}>
        Blocking Threads
      </Typography>
      <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
        Threads which block other threads execution are displayed here. Blocking threads makes application unresponsive.
      </Typography>
      <Alert severity={"warning"} sx={{ mb: 3, width: '100%' }}>
        Not able to compute transitive graph for uploaded stacktrace format.
      </Alert>
    </Box>
  );
};
export default BlockingThreads;