import React from 'react';
import './App.css';

function SimplifiedApp() {
  return (
    <div className="app-container">
      <div className="main-content" style={{ padding: '20px' }}>
        <h1>ReleaseTrack Pro</h1>
        <div className="card" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '5px', marginBottom: '20px' }}>
          <h2>Application Status</h2>
          <p style={{ color: 'green', fontWeight: 'bold' }}>✅ React application is running successfully!</p>
          <p>This is a simplified version of the application to verify that the React setup is working correctly.</p>
        </div>
        
        <div className="card" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <h2>Features</h2>
          <ul>
            <li>Dashboard with release statistics</li>
            <li>Release management</li>
            <li>Ticket tracking</li>
            <li>Metadata management</li>
            <li>Reports and analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SimplifiedApp;
