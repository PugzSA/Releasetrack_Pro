import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Tag,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

const TicketModal = ({ ticket, onClose, users }) => {
  if (!ticket) return null;

  // State for dynamic priority to update the dot color
  const [selectedPriority, setSelectedPriority] = useState(
    ticket.priority || "Medium"
  );

  // Ref and state for modern scrollbar behavior
  const modalRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  // Enhanced scrollbar visibility on scroll
  useEffect(() => {
    const modalElement = modalRef.current;
    if (!modalElement) return;

    const handleScroll = () => {
      setIsScrolling(true);
      modalElement.classList.add("scrolling");

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Hide scrollbar after scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        modalElement.classList.remove("scrolling");
      }, 1000);
    };

    modalElement.addEventListener("scroll", handleScroll);

    return () => {
      modalElement.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return <AlertCircle size={14} />;
      case "in progress":
        return <Clock size={14} />;
      case "resolved":
        return <CheckCircle size={14} />;
      case "closed":
        return <XCircle size={14} />;
      default:
        return <AlertCircle size={14} />;
    }
  };

  const handlePriorityChange = (event) => {
    setSelectedPriority(event.target.value);
  };

  const assignedUser = users.find((u) => u.id === ticket.assigned_to);

  return (
    <div className="ticket-modal-backdrop" onClick={onClose}>
      <div
        ref={modalRef}
        className={`ticket-modal-modern ${isScrolling ? "scrolling" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="ticket-modal-close-btn">
          <X size={20} />
        </button>

        {/* Header Section */}
        <div className="ticket-modal-header-modern">
          <div className="d-flex align-items-start mb-3">
            <div className="flex-grow-1">
              <div className="mb-2">
                <h1 className="ticket-modal-title">
                  {ticket.id || `TKT-${ticket.id}`}
                </h1>
              </div>
              <span className="ticket-modal-id">{ticket.title}</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="ticket-modal-body-modern">
          {/* Row 1: Requester & Assignee */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="ticket-modal-field">
                <label className="ticket-modal-label">Requester:</label>
                <div className="d-flex align-items-center">
                  <User size={16} className="me-2 text-muted" />
                  <span className="ticket-modal-value">
                    {assignedUser ? assignedUser.name : "Unassigned"}
                  </span>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="ticket-modal-field">
                <label className="ticket-modal-label">Assignee:</label>
                <span className="ticket-modal-value">
                  {assignedUser ? assignedUser.name : "Unassigned"}
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Support Area & Type */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="ticket-modal-field">
                <label className="ticket-modal-label">Support Area:</label>
                <select
                  className="ticket-modal-select"
                  defaultValue={ticket.support_area || "CRM"}
                >
                  <option value="CRM">CRM</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <div className="ticket-modal-field">
                <label className="ticket-modal-label">Type:</label>
                <select
                  className="ticket-modal-select"
                  defaultValue={ticket.type || "Issue"}
                >
                  <option value="Enhancement">Enhancement</option>
                  <option value="Issue">Issue</option>
                  <option value="New Feature">New Feature</option>
                  <option value="Request">Request</option>
                </select>
              </div>
            </div>
          </div>

          {/* Row 3: Priority & Status */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="ticket-modal-field">
                <label className="ticket-modal-label">Priority:</label>
                <div className="d-flex align-items-center">
                  <div
                    className={`priority-dot me-2 priority-${selectedPriority.toLowerCase()}`}
                  />
                  <select
                    className="ticket-modal-select-with-icon"
                    value={selectedPriority}
                    onChange={handlePriorityChange}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="ticket-modal-field">
                <label className="ticket-modal-label">Status:</label>
                <select
                  className="ticket-modal-select"
                  defaultValue={ticket.status || "Backlog"}
                >
                  <option value="Backlog">Backlog</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Requirements Gathering">
                    Requirements Gathering
                  </option>
                  <option value="In Technical Design">
                    In Technical Design
                  </option>
                  <option value="In Development">In Development</option>
                  <option value="Blocked - User">Blocked - User</option>
                  <option value="Blocked - Dev">Blocked - Dev</option>
                  <option value="In Testing - Dev">In Testing - Dev</option>
                  <option value="In Testing - UAT">In Testing - UAT</option>
                  <option value="Ready For Release">Ready For Release</option>
                  <option value="Released">Released</option>
                </select>
              </div>
            </div>
          </div>

          {/* Row 4: Release (single column) */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="ticket-modal-field">
                <label className="ticket-modal-label">Release:</label>
                <span className="ticket-modal-value">
                  {ticket.release || "Not assigned"}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="ticket-modal-field mb-4">
            <label className="ticket-modal-label">Description:</label>
            <textarea
              className="ticket-modal-textarea"
              rows="4"
              placeholder="Enter ticket description..."
              defaultValue={ticket.description || ""}
            />
          </div>

          {/* Test Notes */}
          <div className="ticket-modal-field mb-4">
            <label className="ticket-modal-label">Test Notes:</label>
            <textarea
              className="ticket-modal-textarea"
              rows="4"
              placeholder="Add any notes related to testing requirements or results"
              defaultValue={ticket.test_notes || ""}
            />
          </div>

          {/* Tags */}
          {ticket.tags && ticket.tags.length > 0 && (
            <div className="ticket-modal-field">
              <label className="ticket-modal-label">Tags:</label>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {ticket.tags.map((tag) => (
                  <span key={tag} className="ticket-modal-tag">
                    <Tag size={12} className="me-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="ticket-modal-footer-modern">
          <button className="btn btn-outline-secondary me-2" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary">Update Status</button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
