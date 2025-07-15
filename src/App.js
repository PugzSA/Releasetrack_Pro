import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Components
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/Dashboard';
import Releases from './components/releases/Releases';
import NewRelease from './components/NewRelease';
import EditRelease from './components/EditRelease';
import Tickets from './components/tickets/Tickets';
import NewTicket from './components/NewTicket';
import Metadata from './components/metadata/Metadata';
import NewMetadata from './components/NewMetadata';
import EditMetadata from './components/EditMetadata';
import Reports from './components/Reports';
import ReleaseStrategy from './components/ReleaseStrategy';
import ReleaseDates from './components/ReleaseDates';
import ReleaseGuidelines from './components/ReleaseGuidelines';
import Settings from './components/settings/Settings';
import EmailTest from './components/EmailTest';

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/releases" element={<Releases />} />
          <Route path="/releases/new" element={<NewRelease />} />
          <Route path="/releases/edit/:id" element={<EditRelease />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/tickets/new" element={<NewTicket />} />
          <Route path="/metadata" element={<Metadata />} />
          <Route path="/metadata/create" element={<NewMetadata />} />
          <Route path="/metadata/edit/:id" element={<EditMetadata />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/release-strategy" element={<ReleaseStrategy />} />
          <Route path="/release-dates" element={<ReleaseDates />} />
          <Route path="/release-guidelines" element={<ReleaseGuidelines />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/email-test" element={<EmailTest />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
