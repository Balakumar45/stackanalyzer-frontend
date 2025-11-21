import { Box, Typography, Alert} from "@mui/material";

const Deadlocks = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <Typography variant="h6" sx={{ mb: 0.1, fontWeight: "bold" }}>
        Deadlocks
      </Typography>
      <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
        Occurs when two or more threads are blocked indefinitely, each waiting for the other to release a resource that it needs to proceed. This can lead to a complete halt in the execution of the program, as the involved threads are unable to make any progress.
      </Typography>
      <Alert severity={"warning"} sx={{ mb: 1, width: '97%' }}>
        Not able to identify deadlock as thread id are not available in the stacktraces.
        </Alert>
    </Box>
  );
};
export default Deadlocks;