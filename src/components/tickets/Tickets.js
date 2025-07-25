import React, { useState, useEffect, useMemo } from "react";
import TicketModal from "./TicketModal";
import NewTicketModal from "./NewTicketModal";
import SearchModal from "./SearchModal";
import FilterModal from "./FilterModal";
import NotificationToast from "../common/NotificationToast";
import { useApp } from "../../context/AppContext";
import { getStatusClass } from "../../utils/statusUtils";
import {
  Search,
  Filter,
  User,
  Clock,
  List,
  Grid,
  Plus,
  TrendingUp,
  Bug,
  Lightbulb,
  MessageSquare,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import "./Tickets.css";

// Function to get the appropriate icon for ticket type
const getTicketTypeIcon = (ticketType, size = 16) => {
  const iconProps = { size, className: "me-2" };

  switch (ticketType?.toLowerCase()) {
    case "enhancement":
      return <TrendingUp {...iconProps} className="me-2 text-primary" />;
    case "issue":
      return <Bug {...iconProps} className="me-2 text-danger" />;
    case "new feature":
      return <Lightbulb {...iconProps} className="me-2 text-success" />;
    case "request":
      return <MessageSquare {...iconProps} className="me-2 text-info" />;
    default:
      return <MessageSquare {...iconProps} className="me-2 text-secondary" />;
  }
};

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
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' for newest first, 'asc' for oldest first

  // Global toast state
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    variant: "success",
  });

  // Function to show toast notifications
  const showToast = (message, variant = "success") => {
    setNotification({
      show: true,
      message,
      variant,
    });
  };

  // Helper functions matching the example
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-400";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const ticketFilters = filters?.tickets;

  useEffect(() => {
    // Effect logic can remain here
  }, []);

  const filteredTickets = useMemo(() => {
    if (!ticketFilters || !tickets) return [];

    // First filter the tickets
    const filtered = tickets.filter((ticket) => {
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
        !ticketFilters.status ||
        (Array.isArray(ticketFilters.status)
          ? ticketFilters.status.length === 0 ||
            ticketFilters.status.includes(ticket.status)
          : ticket.status === ticketFilters.status);
      const supportAreaMatch =
        !ticketFilters.supportArea ||
        ticket.supportArea === ticketFilters.supportArea;
      const releaseMatch =
        !ticketFilters.release_id ||
        ticket.release_id === parseInt(ticketFilters.release_id);

      const assignedToMatch =
        !ticketFilters.assignedTo ||
        ticket.assignee_id === ticketFilters.assignedTo;

      // New filter fields
      const requesterMatch =
        !ticketFilters.requester_id ||
        ticket.requester_id === parseInt(ticketFilters.requester_id);

      const assigneeMatch =
        !ticketFilters.assignee_id ||
        ticket.assignee_id === parseInt(ticketFilters.assignee_id);

      const tagsMatch =
        !ticketFilters.tag ||
        (ticket.tags && ticket.tags.includes(ticketFilters.tag));

      return (
        searchTermMatch &&
        typeMatch &&
        priorityMatch &&
        statusMatch &&
        supportAreaMatch &&
        releaseMatch &&
        assignedToMatch &&
        requesterMatch &&
        assigneeMatch &&
        tagsMatch
      );
    });

    // Then sort by created_at date
    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);

      if (sortOrder === "desc") {
        return dateB - dateA; // Newest first
      } else {
        return dateA - dateB; // Oldest first
      }
    });
  }, [tickets, ticketFilters, sortOrder]);

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
  };

  // Filter modal handlers
  const handleApplyFilters = (newFilters) => {
    setFilters({
      ...filters,
      tickets: {
        ...ticketFilters,
        ...newFilters,
      },
    });
    showToast("Filters applied successfully", "success");
  };

  const handleClearFilters = () => {
    setFilters({
      ...filters,
      tickets: {
        searchTerm: "",
        supportArea: "",
        type: "",
        priority: "",
        status: [], // Clear to empty array
        requester_id: "",
        assignee_id: "",
        release_id: "",
      },
    });
    showToast("Filters cleared", "info");
  };

  // Count active filters for the main component
  const activeFilterCount = useMemo(() => {
    if (!ticketFilters) return 0;
    return Object.values(ticketFilters).filter((value) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value && value !== "";
    }).length;
  }, [ticketFilters]);

  // Handle sort toggle
  const handleSortToggle = () => {
    setSortOrder((prevOrder) => (prevOrder === "desc" ? "asc" : "desc"));
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
          <div className={`status-badge ${getStatusClass(ticket.status)}`}>
            <span>{ticket.status}</span>
          </div>
        </div>

        <div className="d-flex align-items-center ticket-meta mb-3">
          <User size={14} className="me-1" />
          <span className="me-4">
            {requesterUser
              ? `${requesterUser.firstName} ${requesterUser.lastName}`
              : "No Requester"}
          </span>
          <Clock size={14} className="me-1" />
          <span>{new Date(ticket.updated_at).toLocaleDateString()}</span>
        </div>

        <div className="d-flex justify-content-between align-items-center ticket-footer">
          <div className="d-flex align-items-center gap-3">
            {/* Type */}
            <div className="d-flex align-items-center ticket-category">
              {getTicketTypeIcon(ticket.type, 14)}
              <span>{ticket.type || "General"}</span>
            </div>

            {/* Support Area */}
            {ticket.supportArea && (
              <div className="d-flex align-items-center ticket-support-area">
                <span>{ticket.supportArea}</span>
              </div>
            )}

            {/* Priority Circle */}
            <div
              className={`priority-dot priority-${(
                ticket.priority || "medium"
              ).toLowerCase()}`}
              title={`Priority: ${ticket.priority || "Medium"}`}
            />
          </div>

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
        <div className="d-flex justify-content-between align-items-start mb-3">
          <h3 className="ticket-card-id mb-0">
            {ticket.id || `TKT-${ticket.id}`}
          </h3>
          <div className={`status-badge ${getStatusClass(ticket.status)}`}>
            <span>{ticket.status}</span>
          </div>
        </div>

        <div className="mb-3">
          <p className="ticket-card-title">{ticket.title}</p>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
            <User size={12} className="me-2" />
            <span className="ticket-card-meta">
              {requesterUser
                ? `${requesterUser.firstName} ${requesterUser.lastName}`
                : "No Requester"}
            </span>
          </div>
          <div className="d-flex align-items-center">
            <Clock size={12} className="me-2" />
            <span className="ticket-card-meta">
              {new Date(ticket.updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            {/* Type */}
            <div className="d-flex align-items-center ticket-card-category">
              {getTicketTypeIcon(ticket.type, 14)}
              <span>{ticket.type || "General"}</span>
            </div>

            {/* Support Area */}
            {ticket.supportArea && (
              <div className="d-flex align-items-center ticket-card-support-area">
                <span>{ticket.supportArea}</span>
              </div>
            )}

            {/* Priority Circle */}
            <div
              className={`priority-dot priority-${(
                ticket.priority || "medium"
              ).toLowerCase()}`}
              title={`Priority: ${ticket.priority || "Medium"}`}
            />
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

            {/* Sort Button */}
            <button
              className="btn btn-outline-secondary me-3"
              onClick={handleSortToggle}
              title={`Sort by created date ${
                sortOrder === "desc" ? "ascending" : "descending"
              }`}
            >
              {sortOrder === "desc" ? (
                <ArrowDown size={16} className="me-2" />
              ) : (
                <ArrowUp size={16} className="me-2" />
              )}
              {sortOrder === "desc" ? "Newest First" : "Oldest First"}
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
            <button
              className="btn btn-icon me-2"
              onClick={() => setShowSearchModal(true)}
              title="Search tickets"
            >
              <Search size={20} />
            </button>
            <button
              className="btn btn-icon position-relative"
              onClick={() => setShowFilterModal(true)}
              title="Filter tickets"
            >
              <Filter size={20} />
              {activeFilterCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
                  {activeFilterCount}
                  <span className="visually-hidden">active filters</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="active-filters-summary mb-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <Filter size={16} className="me-2 text-primary" />
              <span className="text-muted">
                {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}{" "}
                applied
              </span>
            </div>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={handleClearFilters}
            >
              Clear All
            </button>
          </div>
        </div>
      )}

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
          showToast={showToast}
        />
      )}

      {showNewTicketModal && (
        <NewTicketModal
          onClose={() => setShowNewTicketModal(false)}
          users={users}
          releases={releases}
          onCreateTicket={handleCreateTicket}
          showToast={showToast}
        />
      )}

      {showSearchModal && (
        <SearchModal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          tickets={tickets}
          users={users}
          onTicketSelect={(ticket) => setSelectedTicket(ticket)}
        />
      )}

      {showFilterModal && (
        <FilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          filters={ticketFilters}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          users={users}
          releases={releases}
          tickets={tickets}
          savedFilters={savedFilters}
          onSaveFilter={saveFilter}
          onDeleteSavedFilter={deleteSavedFilter}
        />
      )}

      {/* Global Toast Notification */}
      <NotificationToast
        show={notification.show}
        message={notification.message}
        variant={notification.variant}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </div>
  );
};

export default Tickets;
