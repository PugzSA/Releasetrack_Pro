import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Package,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  Save,
} from "lucide-react";
import { RELEASE_STATUSES } from "../../constants/releaseFields";
import "./ReleaseModal.css";

const NewReleaseModal = ({
  isOpen,
  onClose,
  onCreateRelease,
  onRefreshData,
  showToast,
}) => {
  if (!isOpen) return null;

  // State for all form fields
  const [formData, setFormData] = useState({
    name: "",
    version: "",
    target: "",
    status: "Planning",
    description: "",
    stakeholder_summary: "",
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

  // Handle field changes
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle create
  const handleCreate = async () => {
    setIsSaving(true);
    setSaveError("");

    try {
      // Prepare create data
      const createData = {
        ...formData,
        target: formData.target
          ? new Date(formData.target).toISOString().split("T")[0]
          : null,
      };

      await onCreateRelease(createData);

      if (showToast) {
        showToast("Release created successfully", "success");
      }

      if (onRefreshData) {
        await onRefreshData();
      }

      onClose();
    } catch (error) {
      console.error("Error creating release:", error);
      setSaveError(error.message || "Failed to create release");
      if (showToast) {
        showToast("Failed to create release", "error");
      }
    } finally {
      setIsSaving(false);
    }
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
            <div className="release-modal-id">New Release</div>
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
        </div>

        {/* Create Button */}
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
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleCreate}
              disabled={isSaving}
            >
              <Save size={16} className="me-2" />
              {isSaving ? "Creating..." : "Create Release"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewReleaseModal;
