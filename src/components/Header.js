import React from 'react';
import { Box, Typography } from '@mui/material';
import { Link } from "react-router-dom";

const Header = ({ onProductClick }) => {
    return (
    <Box sx={{ backgroundColor: '#000', padding: { xs: '8px 0', sm: '10px 0' }, textAlign: 'center', 
        position: 'sticky', top: 0, zIndex: 1000
    }}>
        <Typography variant="h4" sx={{ 
            color: '#00FFFF',
            fontSize: { xs: '1.5rem', sm: '1.5rem', md: '1.5rem' },
            fontWeight: 'bold'
        }}>
        <Link to="/" onClick={onProductClick} style={{ 
            textDecoration: "none", 
            color: "lightblue",
            '&:hover': {
                color: "#00FFFF"
            }
        }}>
            PERFANALYTICS
        </Link>
        </Typography>
    </Box>
)};

export default Header;