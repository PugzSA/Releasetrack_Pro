import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";

const UpcomingDeployments = ({ onReleaseClick }) => {
  const { supabase } = useApp();
  const [upcomingReleases, setUpcomingReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    // Set current date for display
    const today = new Date();
    setCurrentDate(
      today.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );

    fetchUpcomingReleases();
  }, [supabase]);

  const fetchUpcomingReleases = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];

      // Fetch releases with target date >= today, ordered by target date ascending
      const { data: releases, error: releasesError } = await supabase
        .from("releases")
        .select("*")
        .gte("target", today)
        .order("target", { ascending: true })
        .limit(3);

      if (releasesError) {
        throw releasesError;
      }

      setUpcomingReleases(releases || []);
    } catch (err) {
      console.error("Error fetching upcoming releases:", err);
      setError("Failed to load upcoming deployments");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No target date";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "planning":
        return "planning";
      case "in progress":
        return "development";
      case "testing":
        return "testing";
      case "released":
        return "released";
      default:
        return "planning";
    }
  };

  const isOverdue = (targetDate) => {
    if (!targetDate) return false;
    const today = new Date();
    const target = new Date(targetDate);
    return target < today;
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5>Upcoming Deployments</h5>
        </div>
        <div className="card-body">
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 mb-0 text-muted">Loading deployments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5>Upcoming Deployments</h5>
        </div>
        <div className="card-body">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5>Upcoming Deployments</h5>
        <Link to="/releases" className="view-all">
          View All
        </Link>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <small className="text-muted">
            <i className="bi bi-calendar-today me-1"></i>
            Today: {currentDate}
          </small>
        </div>

        {upcomingReleases.length === 0 ? (
          <div className="text-center py-3">
            <i
              className="bi bi-calendar-x text-muted"
              style={{ fontSize: "2rem" }}
            ></i>
            <p className="mt-2 mb-0 text-muted">
              No upcoming deployments scheduled
            </p>
          </div>
        ) : (
          upcomingReleases.map((release) => (
            <div
              key={release.id}
              className="deployment-item"
              onClick={() => onReleaseClick && onReleaseClick(release)}
              style={{ cursor: onReleaseClick ? "pointer" : "default" }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <h6>{release.name}</h6>
                <span
                  className={`status-badge ${
                    isOverdue(release.target)
                      ? "high"
                      : getStatusBadgeClass(release.status)
                  }`}
                >
                  {isOverdue(release.target) ? "Overdue" : release.status}
                </span>
              </div>
              <div className="deployment-details">
                <i className="bi bi-calendar"></i> {formatDate(release.target)}
              </div>
              {!onReleaseClick && (
                <Link
                  to={`/releases/${release.id}`}
                  className="stretched-link"
                ></Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingDeployments;
