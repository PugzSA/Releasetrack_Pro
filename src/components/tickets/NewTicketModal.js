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

const NewTicketModal = ({
  onClose,
  users,
  releases,
  onCreateTicket,
  showToast,
}) => {
  // State for all form fields
  const [formData, setFormData] = useState({
    title: "",
    requester: "", // This will store the requester_id (user ID)
    assignee: "", // This will store the assignee_id (user ID)
    supportArea: "CRM",
    type: "Issue",
    priority: "Medium",
    status: "Backlog",
    release_id: "", // This will store the release ID
    description: "",
    solutionNotes: "",
    testNotes: "",
    tags: [],
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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.title.trim()) {
      alert("Please enter a ticket title");
      return;
    }

    try {
      // Map form data to database field names with proper type conversion
      const ticketData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        priority: formData.priority,
        status: formData.status,
        supportArea: formData.supportArea,
        solutionnotes: formData.solutionNotes,
        testNotes: formData.testNotes,
        release_id: formData.release_id ? parseInt(formData.release_id) : null,
        requester_id: formData.requester ? parseInt(formData.requester) : null,
        assignee_id: formData.assignee ? parseInt(formData.assignee) : null,
      };

      await onCreateTicket(ticketData);

      // Show success toast using parent component's toast system
      if (showToast) {
        showToast("Ticket created successfully!", "success");
      }

      // Auto-close modal after a short delay to show the toast
      setTimeout(() => {
        onClose();
      }, 1500); // Close after 1.5 seconds to give time to see the toast
    } catch (error) {
      console.error("Error creating ticket:", error);
      // Show error toast using parent component's toast system
      if (showToast) {
        showToast("Error creating ticket. Please try again.", "danger");
      }
    }
  };

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
                <h1 className="ticket-modal-title">New Ticket</h1>
              </div>
              <input
                type="text"
                className="ticket-modal-textarea"
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
                    value={formData.requester}
                    onChange={(e) =>
                      handleInputChange("requester", e.target.value)
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
                    value={formData.assignee}
                    onChange={(e) =>
                      handleInputChange("assignee", e.target.value)
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
                    className={`priority-dot me-2 priority-${formData.priority.toLowerCase()}`}
                  />
                  <select
                    className="ticket-modal-select-with-icon"
                    value={formData.priority}
                    onChange={(e) =>
                      handleInputChange("priority", e.target.value)
                    }
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
                <div className="d-flex align-items-center">
                  {getStatusIcon(formData.status)}
                  <select
                    className="ticket-modal-select-with-icon ms-2"
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
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
        </div>

        {/* Footer */}
        <div className="ticket-modal-footer-modern">
          <button className="btn btn-outline-secondary me-2" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewTicketModal;
