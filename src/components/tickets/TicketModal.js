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
import FileUpload from "../attachments/FileUpload";
import AttachmentList from "../attachments/AttachmentList";
import { useApp } from "../../context/AppContext";

const TicketModal = ({
  ticket,
  onClose,
  users,
  releases,
  onUpdateTicket,
  onRefreshData,
  showToast,
}) => {
  if (!ticket) return null;

  // Get current user from context
  const { user } = useApp();

  // Find current user ID by matching email
  const currentUser = users.find((u) => u.email === user?.email);
  const currentUserId = currentUser?.id;

  // State for dynamic priority to update the dot color
  const [selectedPriority, setSelectedPriority] = useState(
    ticket.priority || "Medium"
  );

  // State for attachment management
  const [attachmentKey, setAttachmentKey] = useState(0);

  // State for all editable form fields
  const [formData, setFormData] = useState({
    title: ticket.title || "",
    requester_id: ticket.requester_id || "",
    assignee_id: ticket.assignee_id || "",
    supportArea: ticket.supportArea || "CRM",
    type: ticket.type || "Issue",
    priority: ticket.priority || "Medium",
    status: ticket.status || "Backlog",
    release_id: ticket.release_id || "",
    description: ticket.description || "",
    solutionNotes: ticket.solutionnotes || "",
    testNotes: ticket.testNotes || "",
  });

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
    const newPriority = event.target.value;
    setSelectedPriority(newPriority);
    setFormData((prev) => ({ ...prev, priority: newPriority }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      // Map form data to database field names with proper type conversion
      const updateData = {
        title: formData.title,
        requester_id: formData.requester_id
          ? parseInt(formData.requester_id)
          : null,
        assignee_id: formData.assignee_id
          ? parseInt(formData.assignee_id)
          : null,
        supportArea: formData.supportArea,
        type: formData.type,
        priority: formData.priority,
        status: formData.status,
        release_id: formData.release_id || null,
        description: formData.description,
        solutionnotes: formData.solutionNotes,
        testNotes: formData.testNotes,
      };

      // Call the update ticket API
      await onUpdateTicket(ticket.id, updateData);

      // Refresh the data
      await onRefreshData();

      // Show success toast using parent component's toast system
      if (showToast) {
        showToast("Ticket updated successfully!", "success");
      }

      // Auto-close the modal after a short delay to show the toast
      setTimeout(() => {
        onClose();
      }, 1500); // Close after 1.5 seconds to give time to see the toast
    } catch (error) {
      console.error("Error updating ticket:", error);
      // Show error toast using parent component's toast system
      if (showToast) {
        showToast("Error updating ticket. Please try again.", "danger");
      }
    }
  };

  // Attachment event handlers
  const handleAttachmentUploadComplete = (attachment) => {
    if (showToast) {
      showToast(
        `File "${attachment.file_name}" uploaded successfully`,
        "success"
      );
    }
    // Refresh attachment list by updating key
    setAttachmentKey((prev) => prev + 1);
  };

  const handleAttachmentUploadError = (error) => {
    if (showToast) {
      showToast(error, "error");
    }
  };

  const handleAttachmentDeleted = (attachmentId) => {
    // Refresh attachment list by updating key
    setAttachmentKey((prev) => prev + 1);
  };

  const assignedUser = users.find((u) => u.id === ticket.assigned_to);
  const assignedRelease = releases?.find((r) => r.id === ticket.release_id);

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
          <div className="ticket-modal-title-section">
            <div className="ticket-modal-id">{ticket.id}</div>
          </div>
          <div className="d-flex align-items-start mb-3">
            <div className="flex-grow-1">
              <input
                type="text"
                className="ticket-modal-title-input"
                placeholder="Enter ticket title..."
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                style={{ minHeight: "40px", resize: "none" }}
              />
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
                  <select
                    className="ticket-modal-select-with-icon"
                    value={formData.requester_id}
                    onChange={(e) =>
                      handleInputChange("requester_id", e.target.value)
                    }
                  >
                    <option value="">Select Requester</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="ticket-modal-field">
                <label className="ticket-modal-label">Assignee:</label>
                <div className="d-flex align-items-center">
                  <User size={16} className="me-2 text-muted" />
                  <select
                    className="ticket-modal-select-with-icon"
                    value={formData.assignee_id}
                    onChange={(e) =>
                      handleInputChange("assignee_id", e.target.value)
                    }
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </select>
                </div>
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
                  value={formData.supportArea}
                  onChange={(e) =>
                    handleInputChange("supportArea", e.target.value)
                  }
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
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
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
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
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
                <select
                  className="ticket-modal-select"
                  value={formData.release_id}
                  onChange={(e) =>
                    handleInputChange("release_id", e.target.value)
                  }
                >
                  <option value="">No Release</option>
                  {releases &&
                    releases.map((release) => (
                      <option key={release.id} value={release.id}>
                        {release.name}
                      </option>
                    ))}
                </select>
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
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
          </div>

          {/* Solution Notes */}
          <div className="ticket-modal-field mb-4">
            <label className="ticket-modal-label">Solution Notes:</label>
            <textarea
              className="ticket-modal-textarea"
              rows="4"
              placeholder="Add any notes related to the solution of this ticket"
              value={formData.solutionNotes}
              onChange={(e) =>
                handleInputChange("solutionNotes", e.target.value)
              }
            />
          </div>

          {/* Test Notes */}
          <div className="ticket-modal-field mb-4">
            <label className="ticket-modal-label">Test Notes:</label>
            <textarea
              className="ticket-modal-textarea"
              rows="4"
              placeholder="Add any notes related to testing requirements or results"
              value={formData.testNotes}
              onChange={(e) => handleInputChange("testNotes", e.target.value)}
            />
          </div>

          {/* Attachments Section */}
          <div className="ticket-modal-field mb-4">
            <label className="ticket-modal-label">Attachments:</label>

            {/* File Upload Component */}
            {currentUserId && (
              <FileUpload
                ticketId={ticket.id}
                uploadedBy={currentUserId}
                onUploadComplete={handleAttachmentUploadComplete}
                onUploadError={handleAttachmentUploadError}
              />
            )}

            {/* Attachment List Component */}
            <AttachmentList
              key={attachmentKey}
              ticketId={ticket.id}
              onAttachmentDeleted={handleAttachmentDeleted}
              showToast={showToast}
              currentUserId={currentUserId}
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
          <button className="btn btn-primary" onClick={handleSubmit}>
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
