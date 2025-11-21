import { 
  Box, 
  Typography, 
  Alert, 
  List, 
  ListItem, 
  ListItemText, 
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Stack
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";

const apiBaseUrl = process.env.REACT_APP_TD_API_URL

const BlockingThreads = ({ uploadDate, selectedFile }) => {
  const [blockingData, setBlockingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const analyzeBlockingThreads = async () => {
      if (!uploadDate || !selectedFile) {
        setError("Missing required parameters: uploadDate or selectedFile");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${apiBaseUrl}/api/threaddump/get-blocking-threads-details`, {
          params: {
            uploadDate: uploadDate,
            threadDumpFile: selectedFile
          }
        });

        setBlockingData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to analyze blocking threads");
        console.error("Error analyzing blocking threads:", err);
      } finally {
        setLoading(false);
      }
    };

    analyzeBlockingThreads();
  }, [uploadDate, selectedFile]);

  const renderTransitiveGraph = (transitiveBlock, level = 0) => {
    const indent = level * 20;
    
    return (
      <Box key={transitiveBlock.rootThread} sx={{ ml: indent, mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Chip 
            label={transitiveBlock.rootThread} 
            color="primary" 
            size="small" 
            variant="outlined"
          />
          <Typography variant="body2" color="text.secondary">
            → blocks {transitiveBlock.blockedCount} threads
          </Typography>
        </Box>
        
        {transitiveBlock.blockedThreads.map((blockedThread, index) => (
          <Box key={index} sx={{ ml: 2, mb: 0.5 }}>
            <Chip 
              label={blockedThread} 
              color="secondary" 
              size="small" 
              variant="filled"
            />
          </Box>
        ))}
        
        {transitiveBlock.nestedBlocks.map((nestedBlock, index) => 
          renderTransitiveGraph(nestedBlock, level + 1)
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <Typography variant="h6" sx={{ mb: 0.1, fontWeight: "bold" }}>
          Blocking Threads
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Analyzing blocking threads...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <Typography variant="h6" sx={{ mb: 0.1, fontWeight: "bold" }}>
          Blocking Threads
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
        Blocking Threads
      </Typography>
      <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
        Threads which block other threads execution are displayed here. Blocking threads makes application unresponsive.
      </Typography>
      
      {blockingData?.hasBlockingThreads ? (
        <>
          <Alert 
            severity={blockingData.hasTransitiveBlocks ? "error" : "warning"} 
            sx={{ mb: 2, width: '97%' }}
          >
            {blockingData.message}
          </Alert>

          {/* Summary Stats */}
          <Card sx={{ mb: 2, width: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Blocking Threads
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {blockingData.totalBlockingThreads}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Blocked Threads
                  </Typography>
                  <Typography variant="h6" color="secondary">
                    {blockingData.totalBlockedThreads}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Transitive Chains
                  </Typography>
                  <Typography variant="h6" color="error">
                    {blockingData.transitiveBlocks?.length || 0}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Transitive Blocks */}
          {blockingData.hasTransitiveBlocks ? (
            <Box sx={{ width: '100%', mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                Transitive Blocking Chains:
              </Typography>
              {blockingData.transitiveBlocks.map((block, index) => (
                <Card key={index} sx={{ mb: 2, p: 1, border: '1px solid', borderColor: 'error.main' }}>
                  <CardContent>
                    {renderTransitiveGraph(block)}
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Alert severity="info" sx={{ mb: 2, width: '97%' }}>
              No transitive blocks found
            </Alert>
          )}

          {/* All Blocking Relations */}
          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
              All Blocking Relations:
            </Typography>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {Object.entries(blockingData.blockingRelations).map(([blocker, relations]) => 
                relations.map((relation, index) => (
                  <ListItem key={`${blocker}-${index}`} divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={relation.blockingThread} size="small" color="primary" />
                          <Typography variant="body2">→ blocks →</Typography>
                          <Chip label={relation.blockedThread} size="small" color="secondary" />
                        </Box>
                      }
                      secondary={`Lock ID: ${relation.lockId}`}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Box>
        </>
      ) : (
        <Alert severity="success" sx={{ mb: 1, width: '97%' }}>
          {blockingData?.message || "No blocking threads found"}
        </Alert>
      )}
    </Box>
  );
};

export default BlockingThreads;