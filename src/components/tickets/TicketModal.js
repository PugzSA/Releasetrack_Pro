import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Tag,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageCircle,
} from "lucide-react";
import FileUpload from "../attachments/FileUpload";
import AttachmentList from "../attachments/AttachmentList";
import MetadataCard from "../metadata/MetadataCard";
import CommentSection from "../comments/CommentSection";
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
  const { user, supabase } = useApp();

  // Find current user ID by matching email
  const currentUser = users.find((u) => u.email === user?.email);
  const currentUserId = currentUser?.id;

  // State for dynamic priority to update the dot color
  const [selectedPriority, setSelectedPriority] = useState(
    ticket.priority || "Medium"
  );

  // State for attachment management
  const [attachmentKey, setAttachmentKey] = useState(0);

  // State for tab management
  const [activeTab, setActiveTab] = useState("details");
  const [relatedMetadata, setRelatedMetadata] = useState([]);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);

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

  // Fetch related metadata when ticket changes
  useEffect(() => {
    const fetchRelatedMetadata = async () => {
      if (!ticket?.id || !supabase) return;

      setLoadingMetadata(true);
      try {
        const { data, error } = await supabase
          .from("metadata")
          .select("*")
          .eq("ticket_id", ticket.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setRelatedMetadata(data || []);
      } catch (error) {
        console.error("Error fetching related metadata:", error);
        setRelatedMetadata([]);
      } finally {
        setLoadingMetadata(false);
      }
    };

    fetchRelatedMetadata();
  }, [ticket?.id, supabase]);

  // Fetch comments count when ticket changes
  useEffect(() => {
    const fetchCommentsCount = async () => {
      if (!ticket?.id || !supabase) return;

      try {
        const { count, error } = await supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("ticket_id", ticket.id);

        if (error) throw error;
        setCommentsCount(count || 0);
      } catch (error) {
        console.error("Error fetching comments count:", error);
        setCommentsCount(0);
      }
    };

    fetchCommentsCount();
  }, [ticket?.id, supabase]);

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

        {/* Tab Navigation */}
        <div className="ticket-modal-tabs">
          <button
            className={`ticket-modal-tab ${
              activeTab === "details" ? "active" : ""
            }`}
            onClick={() => setActiveTab("details")}
          >
            Details
          </button>
          <button
            className={`ticket-modal-tab ${
              activeTab === "comments" ? "active" : ""
            }`}
            onClick={() => setActiveTab("comments")}
          >
            <MessageCircle size={14} className="me-1" />
            Comments
            {commentsCount > 0 && (
              <span className="metadata-count">({commentsCount})</span>
            )}
          </button>
          <button
            className={`ticket-modal-tab ${
              activeTab === "metadata" ? "active" : ""
            } ${relatedMetadata.length === 0 ? "disabled" : ""}`}
            onClick={() =>
              relatedMetadata.length > 0 && setActiveTab("metadata")
            }
            disabled={relatedMetadata.length === 0}
          >
            Metadata
            {relatedMetadata.length > 0 && (
              <span className="metadata-count">({relatedMetadata.length})</span>
            )}
          </button>
        </div>

        {/* Content Section */}
        <div className="ticket-modal-body-modern">
          {activeTab === "details" && (
            <>
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
                      onChange={(e) =>
                        handleInputChange("type", e.target.value)
                      }
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
                      <option value="Ready For Release">
                        Ready For Release
                      </option>
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
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleInputChange("testNotes", e.target.value)
                  }
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
            </>
          )}

          {activeTab === "comments" && (
            <div className="comments-content">
              <CommentSection
                ticketId={ticket.id}
                ticket={ticket}
                users={users}
                showToast={showToast}
              />
            </div>
          )}

          {activeTab === "metadata" && (
            <div className="related-metadata-content">
              <div className="metadata-header mb-3">
                <h5 className="mb-0">Related Metadata Items</h5>
                <p className="text-muted small mb-0">
                  Metadata items associated with this ticket
                </p>
              </div>

              {loadingMetadata ? (
                <div className="text-center py-4">
                  <div
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Loading metadata...
                </div>
              ) : relatedMetadata.length === 0 ? (
                <div className="empty-metadata-state text-center py-4">
                  <p className="text-muted mb-0">
                    No metadata items found for this ticket.
                  </p>
                </div>
              ) : (
                <div className="metadata-list">
                  {relatedMetadata.map((metadataItem) => (
                    <div
                      key={metadataItem.id}
                      className="metadata-item-row mb-3"
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="metadata-item-info flex-grow-1">
                          <div className="d-flex align-items-center mb-1">
                            <span className="metadata-id me-2">
                              {metadataItem.id}
                            </span>
                            <span
                              className={`status-badge ${
                                metadataItem.status?.toLowerCase() ||
                                metadataItem.action?.toLowerCase()
                              }`}
                            >
                              {metadataItem.status || metadataItem.action}
                            </span>
                          </div>
                          <h6 className="metadata-name mb-1">
                            {metadataItem.name}
                          </h6>
                          {metadataItem.api_name && (
                            <div className="metadata-api-name mb-2">
                              <span className="api-name-label">API Name:</span>
                              <code className="api-name-value">
                                {metadataItem.api_name}
                              </code>
                            </div>
                          )}
                          <div className="metadata-details text-muted small">
                            <span className="me-3">
                              Type: {metadataItem.type}
                            </span>
                            {metadataItem.component && (
                              <span className="me-3">
                                Component: {metadataItem.component}
                              </span>
                            )}
                            {metadataItem.object && (
                              <span>Object: {metadataItem.object}</span>
                            )}
                          </div>
                          {metadataItem.description && (
                            <p className="metadata-description text-muted small mt-1 mb-0">
                              {metadataItem.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
