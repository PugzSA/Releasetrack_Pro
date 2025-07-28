import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import Releases from "./components/releases/Releases";
import NewRelease from "./components/NewRelease";
import EditRelease from "./components/EditRelease";
import Tickets from "./components/tickets/Tickets";
import Metadata from "./components/metadata/Metadata";
import ReleaseDetail from "./components/releases/ReleaseDetail";
import Reports from "./components/Reports";

import ReleaseDates from "./components/ReleaseDates";
import ReleaseGuidelines from "./components/ReleaseGuidelines";
import Settings from "./components/settings/Settings";
import EmailTest from "./components/EmailTest";
import Wiki from "./components/wiki/Wiki";
import { useApp } from "./context/AppContext";
import Dashboard from "./components/Dashboard";
import NewTicket from "./components/NewTicket";

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
            <Route path="/releases/new" element={<NewRelease />} />
            <Route path="/releases/edit/:id" element={<EditRelease />} />
            <Route path="/releases/:id" element={<ReleaseDetail />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/metadata" element={<Metadata />} />
            <Route path="/reports" element={<Reports />} />

            <Route path="/release-dates" element={<ReleaseDates />} />
            <Route path="/release-guidelines" element={<ReleaseGuidelines />} />
            <Route path="/wiki" element={<Wiki />} />
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
