import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import logo from "../../assets/ReleaseTrack_Pro logo.png";
import UserAvatar from "../common/UserAvatar";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="ReleaseTrack Pro" className="sidebar-logo" />
      </div>

      <div className="sidebar-content">
        <div className="navigation-wrapper">
          <div className="navigation-title">NAVIGATION</div>
          <nav className="sidebar-nav">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <i className="bi bi-grid"></i>
              Dashboard
            </NavLink>
            <NavLink
              to="/releases"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <i className="bi bi-box"></i>
              Releases
            </NavLink>
            <NavLink
              to="/tickets"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <i className="bi bi-ticket"></i>
              Tickets
            </NavLink>
            <NavLink
              to="/metadata"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <i className="bi bi-database"></i>
              Metadata
            </NavLink>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <i className="bi bi-bar-chart"></i>
              Reports
            </NavLink>
            <NavLink
              to="/release-strategy"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <i className="bi bi-diagram-3"></i>
              Release Strategy
            </NavLink>
            <NavLink
              to="/release-dates"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <i className="bi bi-calendar-date"></i>
              Release Dates
            </NavLink>
            <NavLink
              to="/release-guidelines"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <i className="bi bi-file-text"></i>
              Release Guidelines
            </NavLink>
            <NavLink
              to="/wiki"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <i className="bi bi-journal-text"></i>
              Wiki
            </NavLink>
          </nav>
        </div>

        <div className="sidebar-footer">
          {/* User Avatar */}
          <div className="sidebar-user-avatar">
            <UserAvatar size={32} />
          </div>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <i className="bi bi-gear"></i>
            Settings
          </NavLink>
          <NavLink
            to="/email-test"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <i className="bi bi-envelope"></i>
            Email Test
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
