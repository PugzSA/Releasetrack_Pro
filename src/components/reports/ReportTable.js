import React, { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Search, ExternalLink } from "lucide-react";
import "./ReportTable.css";

const ReportTable = ({ tickets, onExportCSV, onTicketClick }) => {
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Filter tickets based on search term
  const filteredTickets = useMemo(() => {
    if (!searchTerm) return tickets;

    const term = searchTerm.toLowerCase();
    return tickets.filter(
      (ticket) =>
        ticket.id?.toLowerCase().includes(term) ||
        ticket.title?.toLowerCase().includes(term) ||
        ticket.requester_name?.toLowerCase().includes(term) ||
        ticket.assignee_name?.toLowerCase().includes(term) ||
        ticket.release_name?.toLowerCase().includes(term) ||
        ticket.type?.toLowerCase().includes(term) ||
        ticket.priority?.toLowerCase().includes(term) ||
        ticket.status?.toLowerCase().includes(term)
    );
  }, [tickets, searchTerm]);

  // Sort tickets
  const sortedTickets = useMemo(() => {
    if (!sortConfig.key) return filteredTickets;

    return [...filteredTickets].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle null/undefined values
      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      // Handle dates
      if (sortConfig.key.includes("_at") || sortConfig.key.includes("date")) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle strings
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredTickets, sortConfig]);

  // Paginate tickets
  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTickets.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTickets, currentPage]);

  const totalPages = Math.ceil(sortedTickets.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUp className="sort-icon inactive" size={14} />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="sort-icon active" size={14} />
    ) : (
      <ChevronDown className="sort-icon active" size={14} />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  const getTypeBadgeClass = (type) => {
    switch (type?.toLowerCase()) {
      case "issue":
        return "badge-issue";
      case "enhancement":
        return "badge-enhancement";
      case "new feature":
        return "badge-feature";
      case "request":
        return "badge-request";
      default:
        return "badge-default";
    }
  };

  return (
    <div className="report-table-container">
      <div className="table-header">
        <div className="table-title">
          <h6>Detailed Ticket Report</h6>
          <span className="ticket-count">
            {sortedTickets.length} ticket{sortedTickets.length !== 1 ? "s" : ""}
            {searchTerm && ` (filtered from ${tickets.length})`}
          </span>
        </div>

        <div className="table-controls">
          <div className="search-container">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="search-input"
            />
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => onExportCSV(sortedTickets)}
            disabled={sortedTickets.length === 0}
          >
            Export CSV
          </button>
        </div>
      </div>

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
              <th onClick={() => handleSort("created_at")} className="sortable">
                Created {getSortIcon("created_at")}
              </th>
              <th onClick={() => handleSort("updated_at")} className="sortable">
                Updated {getSortIcon("updated_at")}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedTickets.length === 0 ? (
              <tr>
                <td colSpan="10" className="no-data">
                  {searchTerm
                    ? "No tickets match your search criteria"
                    : "No tickets found"}
                </td>
              </tr>
            ) : (
              paginatedTickets.map((ticket) => (
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
                    <span className={`badge ${getTypeBadgeClass(ticket.type)}`}>
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
                      className={`badge ${getStatusBadgeClass(ticket.status)}`}
                    >
                      {ticket.status || "-"}
                    </span>
                  </td>
                  <td className="user-name">{ticket.requester_name || "-"}</td>
                  <td className="user-name">
                    {ticket.assignee_name || "Unassigned"}
                  </td>
                  <td className="release-name">
                    {ticket.release_name !== "No Release"
                      ? ticket.release_name
                      : "-"}
                  </td>
                  <td className="date-cell">{formatDate(ticket.created_at)}</td>
                  <td className="date-cell">{formatDate(ticket.updated_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <div className="pagination-info">
            <span>
              Page {currentPage} of {totalPages}({sortedTickets.length} total
              tickets)
            </span>
          </div>

          <button
            className="pagination-btn"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportTable;
