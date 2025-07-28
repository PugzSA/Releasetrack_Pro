import React, { useState, useEffect, useMemo } from "react";
import { ChevronUp, ChevronDown, ExternalLink } from "lucide-react";
import { useApp } from "../../context/AppContext";
import "../reports/ReportTable.css"; // Import badge styles for consistent status colors
import "./RecentTicketsTable.css";

const RecentTicketsTable = ({ onTicketClick, onRefreshNeeded }) => {
  const { supabase } = useApp();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "last_activity",
    direction: "desc",
  });

  const fetchRecentTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, fetch tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from("tickets")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(10);

      if (ticketsError) {
        throw ticketsError;
      }

      // Fetch all users to map IDs to names
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, firstName, lastName");

      if (usersError) {
        console.warn("Error fetching users:", usersError);
      }

      // Fetch all releases to map IDs to names
      const { data: releasesData, error: releasesError } = await supabase
        .from("releases")
        .select("id, name");

      if (releasesError) {
        console.warn("Error fetching releases:", releasesError);
      }

      // Create lookup maps
      const usersMap = (usersData || []).reduce((acc, user) => {
        acc[user.id] = `${user.firstName} ${user.lastName}`;
        return acc;
      }, {});

      const releasesMap = (releasesData || []).reduce((acc, release) => {
        acc[release.id] = release.name;
        return acc;
      }, {});

      // Process the data to match the expected format
      const processedTickets = (ticketsData || []).map((ticket) => {
        // Determine the most recent activity (created or updated)
        const createdDate = new Date(ticket.created_at);
        const updatedDate = new Date(ticket.updated_at);
        const lastActivity =
          updatedDate > createdDate ? updatedDate : createdDate;

        return {
          ...ticket,
          requester_name: ticket.requester_id
            ? usersMap[ticket.requester_id] || "Unknown User"
            : ticket.requester || "Unknown",
          assignee_name: ticket.assignee_id
            ? usersMap[ticket.assignee_id] || "Unknown User"
            : ticket.assignee || "Unassigned",
          release_name: ticket.release_id
            ? releasesMap[ticket.release_id] || "Unknown Release"
            : "No Release",
          last_activity: lastActivity.toISOString(),
        };
      });

      setTickets(processedTickets);
    } catch (err) {
      console.error("Error fetching recent tickets:", err);
      setError("Failed to load recent tickets");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchRecentTickets();
  }, [supabase]);

  // Expose the refresh function to parent component
  useEffect(() => {
    if (onRefreshNeeded) {
      onRefreshNeeded(fetchRecentTickets);
    }
  }, [onRefreshNeeded, fetchRecentTickets]);

  // Sort tickets
  const sortedTickets = useMemo(() => {
    if (!sortConfig.key) return tickets;

    return [...tickets].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [tickets, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "desc"
          ? "asc"
          : "desc",
    }));
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUp size={14} className="sort-icon inactive" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp size={14} className="sort-icon active" />
    ) : (
      <ChevronDown size={14} className="sort-icon active" />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Badge styling functions (copied from ReportTable)
  const getTypeBadgeClass = (type) => {
    switch (type?.toLowerCase()) {
      case "enhancement":
        return "badge-enhancement";
      case "issue":
        return "badge-issue";
      case "new feature":
        return "badge-new-feature";
      case "request":
        return "badge-request";
      default:
        return "badge-default";
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "badge-high";
      case "medium":
        return "badge-medium";
      case "low":
        return "badge-low";
      default:
        return "badge-default";
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "backlog":
        return "badge-backlog";
      case "cancelled":
        return "badge-cancelled";
      case "requirements gathering":
        return "badge-requirements";
      case "in technical design":
        return "badge-design";
      case "in development":
        return "badge-development";
      case "blocked - user":
        return "badge-blocked-user";
      case "blocked - dev":
        return "badge-blocked-dev";
      case "in testing - dev":
        return "badge-testing-dev";
      case "in testing - uat":
        return "badge-testing-uat";
      case "ready for release":
        return "badge-ready";
      case "released":
        return "badge-released";
      case "in progress":
        return "badge-progress";
      case "in review":
        return "badge-review";
      case "done":
        return "badge-done";
      case "testing":
        return "badge-testing";
      case "closed":
        return "badge-closed";
      default:
        return "badge-default";
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5>Recent Ticket Activity</h5>
          <span className="ticket-count">Loading...</span>
        </div>
        <div className="card-body">
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 mb-0 text-muted">Loading recent tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5>Recent Ticket Activity</h5>
          <span className="ticket-count">Error</span>
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
        <h5>Recent Ticket Activity</h5>
        <span className="ticket-count">{tickets.length} tickets</span>
      </div>

      <div className="card-body p-0">
        <div className="table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("id")} className="sortable">
                  Ticket ID {getSortIcon("id")}
                </th>
                <th onClick={() => handleSort("title")} className="sortable">
                  Title {getSortIcon("title")}
                </th>
                <th onClick={() => handleSort("type")} className="sortable">
                  Type {getSortIcon("type")}
                </th>
                <th onClick={() => handleSort("priority")} className="sortable">
                  Priority {getSortIcon("priority")}
                </th>
                <th onClick={() => handleSort("status")} className="sortable">
                  Status {getSortIcon("status")}
                </th>
                <th
                  onClick={() => handleSort("requester_name")}
                  className="sortable"
                >
                  Requester {getSortIcon("requester_name")}
                </th>
                <th
                  onClick={() => handleSort("assignee_name")}
                  className="sortable"
                >
                  Assignee {getSortIcon("assignee_name")}
                </th>
                <th
                  onClick={() => handleSort("release_name")}
                  className="sortable"
                >
                  Release {getSortIcon("release_name")}
                </th>
                <th
                  onClick={() => handleSort("created_at")}
                  className="sortable"
                >
                  Created {getSortIcon("created_at")}
                </th>
                <th
                  onClick={() => handleSort("updated_at")}
                  className="sortable"
                >
                  Updated {getSortIcon("updated_at")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTickets.length === 0 ? (
                <tr>
                  <td colSpan="10" className="no-data">
                    No recent tickets found
                  </td>
                </tr>
              ) : (
                sortedTickets.map((ticket) => (
                  <tr key={ticket.id} className="table-row">
                    <td
                      className="ticket-id"
                      onClick={() => onTicketClick && onTicketClick(ticket)}
                    >
                      <span className="id-text">{ticket.id}</span>
                      <ExternalLink size={12} className="external-icon" />
                    </td>
                    <td className="ticket-title">
                      <span title={ticket.title}>{ticket.title}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${getTypeBadgeClass(ticket.type)}`}
                      >
                        {ticket.type || "-"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${getPriorityBadgeClass(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority || "-"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${getStatusBadgeClass(
                          ticket.status
                        )}`}
                      >
                        {ticket.status || "-"}
                      </span>
                    </td>
                    <td className="user-name">
                      {ticket.requester_name || "-"}
                    </td>
                    <td className="user-name">
                      {ticket.assignee_name || "Unassigned"}
                    </td>
                    <td className="release-name">
                      {ticket.release_name !== "No Release"
                        ? ticket.release_name
                        : "-"}
                    </td>
                    <td className="date-cell">
                      {formatDate(ticket.created_at)}
                    </td>
                    <td className="date-cell">
                      {formatDate(ticket.updated_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecentTicketsTable;
