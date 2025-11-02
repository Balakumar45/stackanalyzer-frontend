import React from 'react';
import { Box, Typography } from '@mui/material';

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
        <Typography variant="body2" sx={{
            fontSize: { xs: '0.75rem', sm: '0.75rem' },
            '& a': {
                color: '#87CEFA',
                textDecoration: 'none',
                '&:hover': {
                    textDecoration: 'underline'
                }
            }
        }}>
            &copy; Property of Montran Corporation (India) – All rights reserved | Developed by Performance Engineering Team | <a href="mailto:bnadar@montran.com">FeedBack & Support</a>
        </Typography>
    </Box>
);

export default Footer;