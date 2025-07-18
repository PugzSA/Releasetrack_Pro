import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Releases from './components/releases/Releases';
import Tickets from './components/tickets/Tickets';
import Metadata from './components/metadata/Metadata';
import ReleaseDetail from './components/releases/ReleaseDetail';
import Reports from './components/Reports';
import ReleaseStrategy from './components/ReleaseStrategy';
import ReleaseDates from './components/ReleaseDates';
import ReleaseGuidelines from './components/ReleaseGuidelines';
import Settings from './components/settings/Settings';
import EmailTest from './components/EmailTest';
import { useApp } from './context/AppContext';
import Dashboard from './components/Dashboard';
import NewTicket from './components/NewTicket';

const MainApp = () => {
    

    return (
        <div className="app-container">
            <Sidebar />
            <div className="content-wrapper">
                <Header />
                <main className="page-content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/releases" element={<Releases />} />
                        <Route path="/releases/:id" element={<ReleaseDetail />} />
                        <Route path="/tickets" element={<Tickets />} />
                        <Route path="/metadata" element={<Metadata />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/release-strategy" element={<ReleaseStrategy />} />
                        <Route path="/release-dates" element={<ReleaseDates />} />
                        <Route path="/release-guidelines" element={<ReleaseGuidelines />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/tickets/new" element={<NewTicket />} />
                        <Route path="/email-test" element={<EmailTest />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default MainApp;
