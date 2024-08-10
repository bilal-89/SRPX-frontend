import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryProvider } from './context/QueryContext';

import OverviewDashboard from './pages/OverviewDashboard';
import GeoPage from './pages/GeoPage';
import NetPage from './pages/NetPage';
import StructuralViewPage from './pages/StructuralViewPage';
import ClassicalViewPage from './pages/ClassicalViewPage';

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

function App() {
    return (
        <QueryProvider>
            <Router>
                <ScrollToTop />
                <Routes>
                    <Route path="/" element={<OverviewDashboard />} />
                    <Route path="/geo" element={<GeoPage />} />
                    <Route path="/net" element={<NetPage />} />
                    <Route path="/structural" element={<StructuralViewPage />} />
                    <Route path="/classical" element={<ClassicalViewPage />} />
                </Routes>
            </Router>
        </QueryProvider>
    );
}

export default App;