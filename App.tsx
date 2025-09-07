
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './contexts/AppContext';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Diary from './components/Diary';
import Analytics from './components/Analytics';
import Settings from './components/Settings';

const AppRoutes: React.FC = () => {
    const { isAuthenticated, isLocked } = useAppContext();

    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={<Navigate to="/auth" />} />
            </Routes>
        );
    }
    
    if (isLocked) {
        return (
            <Routes>
                <Route path="/lock" element={<Auth />} />
                <Route path="*" element={<Navigate to="/lock" />} />
            </Routes>
        );
    }

    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/diary" element={<Diary />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Layout>
    );
}

const App: React.FC = () => {
    return (
        <AppProvider>
            <HashRouter>
                <AppRoutes />
            </HashRouter>
        </AppProvider>
    );
};

export default App;
