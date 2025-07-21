import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Package,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  Edit3,
  Save,
  RotateCcw,
} from "lucide-react";
import { RELEASE_STATUSES } from "../../constants/releaseFields";
import "./ReleaseModal.css";

const ReleaseModal = ({
  release,
  onClose,
  onUpdateRelease,
  onRefreshData,
  showToast,
  onTicketClick,
}) => {
  if (!release) return null;

  // State for all editable form fields
  const [formData, setFormData] = useState({
    name: release.name || "",
    version: release.version || "",
    target: release.target ? release.target.split("T")[0] : "", // Format date for input
    status: release.status || "Planning",
    description: release.description || "",
    stakeholder_summary: release.stakeholder_summary || "",
  });

  // State for saving
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Ref and state for modern scrollbar behavior
  const modalRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  // Handle scroll behavior for modern scrollbar
  useEffect(() => {
    const modalElement = modalRef.current;
    if (!modalElement) return;

    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    };

    modalElement.addEventListener("scroll", handleScroll);
    return () => {
      modalElement.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Handle form field changes
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSaveError("");
  };

  // Handle update
  const handleUpdate = async () => {
    setIsSaving(true);
    setSaveError("");

    try {
      // Prepare update data
      const updateData = {
        ...formData,
        target: formData.target
          ? new Date(formData.target).toISOString().split("T")[0]
          : null,
      };

      await onUpdateRelease(release.id, updateData);

      if (showToast) {
        showToast("Release updated successfully", "success");
      }

      if (onRefreshData) {
        await onRefreshData();
      }

      onClose();
    } catch (error) {
      console.error("Error updating release:", error);
      setSaveError(error.message || "Failed to update release");
      if (showToast) {
        showToast("Failed to update release", "error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No target date set";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusClass = (status) => {
    if (!status) return "status-unknown";
    return `status-${status.toLowerCase().replace(/\s+/g, "-")}`;
  };

  return (
    <div className="release-modal-backdrop" onClick={onClose}>
      <div
        ref={modalRef}
        className={`release-modal-modern ${isScrolling ? "scrolling" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="release-modal-close-btn">
          <X size={20} />
        </button>

        {/* Header */}
        <div className="release-modal-header">
          <div className="release-modal-title-section">
            <div className="release-modal-id">{release.id}</div>
          </div>
        </div>

        {/* Content */}
        <div className="release-modal-content">
          {saveError && (
            <div className="release-modal-error">
              <AlertCircle size={16} className="me-2" />
              {saveError}
            </div>
          )}

          {/* Basic Information */}
          <div className="release-modal-section">
            <h3 className="section-title">
              <Package size={18} className="me-2" />
              Release Information
            </h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Release Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className="form-input"
                  placeholder="Enter release name"
                />
              </div>

              <div className="form-group">
                <label>Target Date</label>
                <input
                  type="date"
                  value={formData.target}
                  onChange={(e) => handleFieldChange("target", e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleFieldChange("status", e.target.value)}
                  className="form-select"
                >
                  {RELEASE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="release-modal-section">
            <h3 className="section-title">
              <FileText size={18} className="me-2" />
              Description
            </h3>
            <textarea
              value={formData.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              className="form-textarea"
              rows={4}
              placeholder="Enter release description"
            />
          </div>

          {/* Stakeholder Summary */}
          <div className="release-modal-section">
            <h3 className="section-title">
              <Users size={18} className="me-2" />
              Stakeholder Summary
            </h3>
            <textarea
              value={formData.stakeholder_summary}
              onChange={(e) =>
                handleFieldChange("stakeholder_summary", e.target.value)
              }
              className="form-textarea"
              rows={3}
              placeholder="Enter stakeholder summary"
            />
          </div>

          {/* Related Tickets */}
          {release.tickets && release.tickets.length > 0 && (
            <div className="release-modal-section">
              <h3 className="section-title">
                <FileText size={18} className="me-2" />
                Related Tickets ({release.tickets.length})
              </h3>
              <div className="related-tickets-list">
                {release.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="related-ticket-item read-only"
                  >
                    <div className="ticket-header">
                      <span className="ticket-id">{ticket.id}</span>
                      <span
                        className={`ticket-status ${getStatusClass(
                          ticket.status
                        )}`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                    <div className="ticket-title">{ticket.title}</div>
                    <div className="ticket-meta">
                      <span className="ticket-type">{ticket.type}</span>
                      <span className="ticket-priority">{ticket.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Update Button */}
        <div className="release-modal-footer">
          {saveError && (
            <div className="release-modal-error">
              <AlertCircle size={16} className="me-2" />
              {saveError}
            </div>
          )}
          <div className="release-modal-actions">
            <button
              className="btn btn-outline-secondary me-2"
              onClick={onClose}
              disabled={isSaving}
            >
              Close
            </button>
            <button
              className="btn btn-primary"
              onClick={handleUpdate}
              disabled={isSaving}
            >
              {isSaving ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReleaseModal;
