import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LaunchPage from './pages/LaunchPage';
import DashboardPage from './components/stacktrace/DashboardPage';
import StackTraceAnalyticsPage from "./components/stacktrace/AnalyticsPage";
import ThreadDumpAnalyticsPage from "./components/threaddump/AnalyticsPage";
import StackTraceLaunch from "./components/stacktrace/StackTraceLaunchPage";
import ThreadDumpLaunch from "./components/threaddump/ThreadDumpLaunchPage";
import GCLogLaunch from "./components/gclog/GCLogLaunchPage";

const App = () => {
    const [fileName, setFileName] = useState("");
    useEffect(() => {
        setFileName(""); 
    }, [setFileName]);

    return (
        <Router>
                <Routes>
                    <Route path="/" element={<LaunchPage />} />
                    <Route path="/stacktrace/dashboard" element={<DashboardPage fileName={fileName} />} />
                    <Route path="/stacktrace" element={<StackTraceLaunch />} />
                    <Route path="/threaddump" element={<ThreadDumpLaunch />} />
                    <Route path="/gclog" element={<GCLogLaunch />} />
                    <Route path="/stacktrace/analytics" element={<StackTraceAnalyticsPage fileName={fileName} />} />
                    <Route path="/threaddump/analytics" element={<ThreadDumpAnalyticsPage fileName={fileName} />} />
                </Routes>
        </Router>
    );
};

export default App;
