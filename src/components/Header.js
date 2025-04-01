import React from 'react';
import { Box, Typography } from '@mui/material';
import { Link } from "react-router-dom";

const Header = ({ onProductClick }) => {
    return (
    <Box sx={{ backgroundColor: '#000', padding: '10px 0', textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color: '#00FFFF' }}>
        <Link to="/" onClick={onProductClick} style={{ textDecoration: "none", color: "lightblue" }}>
            Stacktrace Analyzer
        </Link>
        </Typography>
    </Box>
)};

export default Header;