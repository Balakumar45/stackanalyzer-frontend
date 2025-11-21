import React from 'react';
import { Box } from '@mui/material';

const Footer = () => (
    <Box sx={{ 
        backgroundColor: '#000', 
        padding: { xs: '8px 0', sm: '10px 0' },
        textAlign: 'center', 
        color: '#FFF',
        position: 'auto',
        bottom: 0,
        zIndex: 1000
    }}>
    </Box>
);

export default Footer;