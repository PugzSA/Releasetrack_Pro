import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import SupabaseTest from './SupabaseTest';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div>
          <h1>Change Management Dashboard</h1>
          <p className="page-subtitle">Track deployments, tickets, and metadata changes</p>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(25, 118, 210, 0.1)', color: '#1976d2' }}>
            <i className="bi bi-box"></i>
          </div>
          <h2>2</h2>
          <p>Active Releases</p>
          <span className="stat-subtitle">Currently in progress</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(255, 152, 0, 0.1)', color: '#ff9800' }}>
            <i className="bi bi-ticket"></i>
          </div>
          <h2>1</h2>
          <p>Open Tickets</p>
          <span className="stat-subtitle">Awaiting completion</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50' }}>
            <i className="bi bi-database"></i>
          </div>
          <h2>4</h2>
          <p>Metadata Items</p>
          <span className="stat-subtitle">This month</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(156, 39, 176, 0.1)', color: '#9c27b0' }}>
            <i className="bi bi-calendar"></i>
          </div>
          <h2>TBD</h2>
          <p>Next Deployment</p>
          <span className="stat-subtitle">Upcoming release</span>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5>Active Releases</h5>
                <Link to="/releases" className="view-all">View All</Link>
              </div>
              <div className="card-body">
                <div className="release-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6>February 2024 Release</h6>
                    <span className="status-badge testing">testing</span>
                  </div>
                  <div className="release-details">
                    <i className="bi bi-calendar"></i> Target: Feb 28, 2024
                  </div>
                  <Link to="/releases/1" className="stretched-link"></Link>
                </div>
                <div className="release-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6>January 2024 Release</h6>
                    <span className="status-badge development">development</span>
                  </div>
                  <div className="release-details">
                    <i className="bi bi-calendar"></i> Target: Jan 31, 2024
                  </div>
                  <Link to="/releases/2" className="stretched-link"></Link>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5>Upcoming Deployments</h5>
              </div>
              <div className="card-body">
                <div className="deployment-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6>February 2024 Release</h6>
                    <span className="status-badge high">Overdue</span>
                  </div>
                  <div className="deployment-details">
                    <i className="bi bi-calendar"></i> Feb 28, 2024
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card recent-activity">
        <div className="card-header">
          <h5>Recent Activity</h5>
        </div>
        <div className="card-body">
          <div className="activity-item">
            <div className="activity-icon">
              <i className="bi bi-envelope"></i>
            </div>
            <div className="activity-content">
              <div>Email not sending</div>
              <div className="activity-time">Jul 8, 7:22 AM</div>
            </div>
            <div className="activity-tag">
              <span className="status-badge bug">bug</span>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon">
              <i className="bi bi-database"></i>
            </div>
            <div className="activity-content">
              <div>create Customer_Portal_Access_c</div>
              <div className="activity-time">Jul 8, 7:14 AM</div>
            </div>
            <div className="activity-tag">
              <span className="status-badge open">apex class</span>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon">
              <i className="bi bi-database"></i>
            </div>
            <div className="activity-content">
              <div>delete Customer_Portal_Access_c</div>
              <div className="activity-time">Jul 8, 12:30 AM</div>
            </div>
            <div className="activity-tag">
              <span className="status-badge development">custom field</span>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon">
              <i className="bi bi-database"></i>
            </div>
            <div className="activity-content">
              <div>update OrderValidationRule</div>
              <div className="activity-time">Jul 7, 12:47 PM</div>
            </div>
            <div className="activity-tag">
              <span className="status-badge testing">validation rule</span>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon">
              <i className="bi bi-database"></i>
            </div>
            <div className="activity-content">
              <div>create LeadQualificationFlow</div>
              <div className="activity-time">Jul 7, 12:19 PM</div>
            </div>
            <div className="activity-tag">
              <span className="status-badge development">flow</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Supabase Connection Test */}
      <div className="row mt-4">
        <div className="col-12">
          <SupabaseTest />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
