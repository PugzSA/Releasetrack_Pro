import React, { useState, useEffect, useMemo } from "react";
import TicketModal from "./TicketModal";
import NewTicketModal from "./NewTicketModal";
import UserAvatar from "../common/UserAvatar";
import { useApp } from "../../context/AppContext";
import { Search, Filter, User, Clock, List, Grid, Plus } from "lucide-react";
import "./Tickets.css";

const Tickets = () => {
  const {
    tickets,
    users,
    releases,
    loading,
    filters,
    setFilters,
    savedFilters,
    saveFilter,
    deleteSavedFilter,
    selectSavedFilter,
    createTicket,
    updateTicket,
    refreshData,
  } = useApp();

  // All hooks must be called at the top level, before any conditional returns.
  const [viewMode, setViewMode] = useState("list");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);

  // Helper functions matching the example
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "text-blue-700 bg-blue-100";
      case "in progress":
        return "text-yellow-700 bg-yellow-100";
      case "resolved":
        return "text-green-700 bg-green-100";
      case "closed":
        return "text-gray-700 bg-gray-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  const ticketFilters = filters?.tickets;

  const ticketTypes = useMemo(
    () =>
      tickets
        ? [...new Set(tickets.map((t) => t.type).filter(Boolean))].sort()
        : [],
    [tickets]
  );
  const priorities = useMemo(
    () =>
      tickets
        ? [...new Set(tickets.map((t) => t.priority).filter(Boolean))].sort()
        : [],
    [tickets]
  );
  const statuses = useMemo(
    () =>
      tickets
        ? [...new Set(tickets.map((t) => t.status).filter(Boolean))].sort()
        : [],
    [tickets]
  );

  useEffect(() => {
    // Effect logic can remain here
  }, []);

  const filteredTickets = useMemo(() => {
    if (!ticketFilters || !tickets) return [];

    return tickets.filter((ticket) => {
      const searchTermMatch =
        !ticketFilters.searchTerm ||
        ticket.title
          .toLowerCase()
          .includes(ticketFilters.searchTerm.toLowerCase()) ||
        ticket.description
          .toLowerCase()
          .includes(ticketFilters.searchTerm.toLowerCase());

      const typeMatch =
        !ticketFilters.type || ticket.type === ticketFilters.type;
      const priorityMatch =
        !ticketFilters.priority || ticket.priority === ticketFilters.priority;
      const statusMatch =
        !ticketFilters.status || ticket.status === ticketFilters.status;

      const assignedToMatch =
        !ticketFilters.assignedTo ||
        ticket.assignee_id === ticketFilters.assignedTo;

      const tagsMatch =
        !ticketFilters.tag ||
        (ticket.tags && ticket.tags.includes(ticketFilters.tag));

      return (
        searchTermMatch &&
        typeMatch &&
        priorityMatch &&
        statusMatch &&
        assignedToMatch &&
        tagsMatch
      );
    });
  }, [tickets, ticketFilters]);

  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      tickets: {
        ...ticketFilters,
        searchTerm: e.target.value,
      },
    });
  };

  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      tickets: {
        ...ticketFilters,
        [filterType]: value,
      },
    });
  };

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
  };

  const handleCreateTicket = async (ticketData) => {
    try {
      console.log("Creating ticket:", ticketData);

      // Call the createTicket function from AppContext
      await createTicket(ticketData);

      // Close the modal
      setShowNewTicketModal(false);

      // Refresh the tickets list
      await refreshData();
    } catch (error) {
      console.error("Error creating ticket:", error);
      throw error;
    }
  };

  // TicketListItem component using Bootstrap classes
  const TicketListItem = ({ ticket }) => {
    const assignedUser = users.find((u) => u.id === ticket.assignee_id);
    const requesterUser = users.find((u) => u.id === ticket.requester_id);

    return (
      <div
        onClick={() => handleTicketClick(ticket)}
        className="ticket-list-item-modern"
      >
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-2">
              <span className="ticket-id-modern me-3">
                {ticket.id || `TKT-${ticket.id}`}
              </span>
            </div>
            <h3 className="ticket-title-modern">{ticket.title}</h3>
          </div>
          <div
            className={`status-badge status-${
              ticket.status?.toLowerCase().replace(" ", "-") || "open"
            }`}
          >
            <span>{ticket.status}</span>
          </div>
        </div>

        <div className="d-flex align-items-center ticket-meta mb-3">
          <User size={14} className="me-1" />
          <span className="me-4">
            {assignedUser
              ? `${assignedUser.firstName} ${assignedUser.lastName}`
              : "Unassigned"}
          </span>
          <Clock size={14} className="me-1" />
          <span>{new Date(ticket.updated_at).toLocaleDateString()}</span>
        </div>

        <div className="d-flex justify-content-between align-items-center ticket-footer">
          <span className="ticket-category">{ticket.type || "General"}</span>
          <span className="ticket-assignee">
            Assigned to{" "}
            {assignedUser
              ? `${assignedUser.firstName} ${assignedUser.lastName}`
              : "Unassigned"}
          </span>
        </div>
      </div>
    );
  };

  // TicketCard component using Bootstrap classes
  const TicketCard = ({ ticket }) => {
    const assignedUser = users.find((u) => u.id === ticket.assignee_id);
    const requesterUser = users.find((u) => u.id === ticket.requester_id);

    return (
      <div
        onClick={() => handleTicketClick(ticket)}
        className="ticket-card-modern"
      >
        <div className="d-flex justify-content-end align-items-start mb-4">
          <div
            className={`status-badge status-${
              ticket.status?.toLowerCase().replace(" ", "-") || "open"
            }`}
          >
            <span>{ticket.status}</span>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="ticket-card-id mb-2">
            {ticket.id || `TKT-${ticket.id}`}
          </h3>
          <p className="ticket-card-title">{ticket.title}</p>
        </div>

        <div className="d-flex align-items-center mb-3">
          <User size={12} className="me-2" />
          <span className="ticket-card-meta">
            {requesterUser
              ? `${requesterUser.firstName} ${requesterUser.lastName}`
              : "No Requester"}
          </span>
        </div>

        <div className="d-flex align-items-center mb-4">
          <Clock size={12} className="me-2" />
          <span className="ticket-card-meta">
            {new Date(ticket.updated_at).toLocaleDateString()}
          </span>
        </div>

        <div className="ticket-card-footer">
          <div className="ticket-card-category mb-2">
            {ticket.type || "General"}
          </div>
          <div className="ticket-card-assignee">
            Assigned to{" "}
            {assignedUser
              ? `${assignedUser.firstName} ${assignedUser.lastName}`
              : "Unassigned"}
          </div>
        </div>
      </div>
    );
  };

  const allTags = useMemo(() => {
    if (!tickets) return [];
    const tagSet = new Set();
    tickets.forEach((ticket) => {
      if (ticket.tags && Array.isArray(ticket.tags)) {
        ticket.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return [...tagSet].sort();
  }, [tickets]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="tickets-page-modern">
      {/* Header */}
      <div className="tickets-header-modern">
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="tickets-title">Tickets</h1>
          <div className="d-flex align-items-center">
            {/* New Ticket Button */}
            <button
              className="btn btn-primary me-3"
              onClick={() => setShowNewTicketModal(true)}
            >
              <Plus size={16} className="me-2" />
              New Ticket
            </button>

            {/* View Toggle */}
            <div className="view-toggle-modern me-3">
              <button
                onClick={() => setViewMode("list")}
                className={`btn-toggle ${viewMode === "list" ? "active" : ""}`}
              >
                <List size={16} className="me-2" />
                List View
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`btn-toggle ${viewMode === "card" ? "active" : ""}`}
              >
                <Grid size={16} className="me-2" />
                Card View
              </button>
            </div>

            {/* Search and Filter Icons */}
            <button className="btn btn-icon me-2">
              <Search size={20} />
            </button>
            <button className="btn btn-icon me-3">
              <Filter size={20} />
            </button>

            {/* User Avatar */}
            <UserAvatar size={32} />
          </div>
        </div>
      </div>

      {/* Tickets Display */}
      <div className="tickets-content-modern">
        {viewMode === "list" ? (
          <div className="tickets-list-container">
            {filteredTickets.map((ticket) => (
              <TicketListItem key={ticket.id} ticket={ticket} />
            ))}
          </div>
        ) : (
          <div className="tickets-grid-container">
            {filteredTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>

      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          users={users}
          releases={releases}
          onUpdateTicket={updateTicket}
          onRefreshData={refreshData}
        />
      )}

      {showNewTicketModal && (
        <NewTicketModal
          onClose={() => setShowNewTicketModal(false)}
          users={users}
          releases={releases}
          onCreateTicket={handleCreateTicket}
        />
      )}
    </div>
  );
};

export default Tickets;
