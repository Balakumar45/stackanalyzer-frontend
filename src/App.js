import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LaunchPage from './pages/LaunchPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from "./pages/AnalyticsPage";

const App = () => {
    const [fileName, setFileName] = useState("");
    useEffect(() => {
        setFileName(""); 
    }, [setFileName]);

    return (
        <Router>
                <Routes>
                    <Route path="/" element={<LaunchPage setFileName={setFileName} />} />
                    <Route path="/dashboard" element={<DashboardPage fileName={fileName} />} />
                    <Route path="/analytics" element={<AnalyticsPage fileName={fileName} />} />
                </Routes>
    </Router>
    );
};

export default App;
