import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Package,
  Tag,
  Activity,
  FileText,
  User,
  Calendar,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { METADATA_TYPES, METADATA_ACTIONS } from "./constants";
import "./MetadataEditModal.css";

const MetadataEditModal = ({
  metadata,
  onClose,
  onUpdateMetadata,
  showToast,
}) => {
  if (!metadata) return null;

  const { tickets, releases, updateMetadataItem } = useApp();

  // State for all editable form fields
  const [formData, setFormData] = useState({
    name: metadata.name || "",
    type: metadata.type || "",
    api_name: metadata.api_name || "",
    action: metadata.action || "",
    description: metadata.description || "",
    object: metadata.object || "",
    ticket_id: metadata.ticket_id || "",
    release_id: metadata.release_id || "",
  });

  // State for dynamic lookups
  const [ticketSearch, setTicketSearch] = useState("");
  const [releaseSearch, setReleaseSearch] = useState("");
  const [showTicketDropdown, setShowTicketDropdown] = useState(false);
  const [showReleaseDropdown, setShowReleaseDropdown] = useState(false);

  // Initialize search fields with current values
  useEffect(() => {
    if (metadata.ticket_id && tickets.length > 0) {
      const currentTicket = tickets.find((t) => t.id === metadata.ticket_id);
      if (currentTicket) {
        setTicketSearch(`${currentTicket.id} - ${currentTicket.title}`);
      }
    }

    if (metadata.release_id && releases.length > 0) {
      const currentRelease = releases.find((r) => r.id === metadata.release_id);
      if (currentRelease) {
        setReleaseSearch(`${currentRelease.id} - ${currentRelease.name}`);
      }
    }
  }, [metadata.ticket_id, metadata.release_id, tickets, releases]);

  // Ref and state for modern scrollbar behavior
  const modalRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  // Handle scroll events for modern scrollbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    };

    const modalElement = modalRef.current;
    if (modalElement) {
      modalElement.addEventListener("scroll", handleScroll);
      return () => modalElement.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Get filtered tickets based on search
  const getFilteredTickets = () => {
    if (!ticketSearch.trim()) {
      // Return 3 most recent tickets by default
      return tickets
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3);
    }

    // Filter tickets by search term
    return tickets
      .filter(
        (ticket) =>
          ticket.id.toLowerCase().includes(ticketSearch.toLowerCase()) ||
          ticket.title.toLowerCase().includes(ticketSearch.toLowerCase())
      )
      .slice(0, 10); // Limit to 10 results
  };

  // Get filtered releases based on search
  const getFilteredReleases = () => {
    if (!releaseSearch.trim()) {
      // Return 3 most recent releases by default
      return releases
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3);
    }

    // Filter releases by search term
    return releases
      .filter(
        (release) =>
          release.id.toLowerCase().includes(releaseSearch.toLowerCase()) ||
          release.name.toLowerCase().includes(releaseSearch.toLowerCase())
      )
      .slice(0, 10); // Limit to 10 results
  };

  // Handle ticket selection
  const handleTicketSelect = (ticket) => {
    setFormData((prev) => ({ ...prev, ticket_id: ticket.id }));
    setTicketSearch(`${ticket.id} - ${ticket.title}`);
    setShowTicketDropdown(false);
  };

  // Handle release selection
  const handleReleaseSelect = (release) => {
    setFormData((prev) => ({ ...prev, release_id: release.id }));
    setReleaseSearch(`${release.id} - ${release.name}`);
    setShowReleaseDropdown(false);
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        showToast("Please enter a metadata name", "error");
        return;
      }

      if (!formData.type.trim()) {
        showToast("Please select a metadata type", "error");
        return;
      }

      // Prepare update data
      const updateData = {
        name: formData.name.trim(),
        type: formData.type,
        api_name: formData.api_name || null,
        action: formData.action || null,
        description: formData.description || null,
        object: formData.object || null,
        ticket_id: formData.ticket_id || null,
        release_id: formData.release_id || null,
      };

      // Update the metadata item
      await updateMetadataItem(metadata.id, updateData);

      // Show success message
      showToast("Metadata updated successfully!", "success");

      // Call the update callback if provided
      if (onUpdateMetadata) {
        onUpdateMetadata({ ...metadata, ...updateData });
      }

      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error updating metadata:", error);
      showToast(
        error.message || "Failed to update metadata. Please try again.",
        "error"
      );
    }
  };

  // Use shared constants
  const metadataTypes = METADATA_TYPES;
  const actionOptions = METADATA_ACTIONS;

  return (
    <div className="metadata-modal-backdrop">
      <div
        className={`metadata-modal-content ${isScrolling ? "scrolling" : ""}`}
        ref={modalRef}
      >
        <button onClick={onClose} className="metadata-modal-close-btn">
          <X size={20} />
        </button>

        {/* Header Section */}
        <div className="metadata-modal-header-modern">
          <div className="metadata-modal-title-section">
            <div className="metadata-modal-id">{metadata.id}</div>
          </div>
        </div>

        {/* Content Section */}
        <div className="metadata-modal-body-modern">
          {/* Row 1: Name & API Name */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="metadata-modal-field">
                <label className="metadata-modal-label">Name:</label>
                <input
                  type="text"
                  className="metadata-modal-select"
                  placeholder="Enter metadata name..."
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="metadata-modal-field">
                <label className="metadata-modal-label">API Name:</label>
                <input
                  type="text"
                  className="metadata-modal-select"
                  placeholder="Enter API name..."
                  value={formData.api_name}
                  onChange={(e) =>
                    handleInputChange("api_name", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Row 2: Object & Type */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="metadata-modal-field">
                <label className="metadata-modal-label">Object:</label>
                <input
                  type="text"
                  className="metadata-modal-select"
                  placeholder="Enter object name..."
                  value={formData.object}
                  onChange={(e) => handleInputChange("object", e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="metadata-modal-field">
                <label className="metadata-modal-label">Type:</label>
                <select
                  className="metadata-modal-select"
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                >
                  <option value="">Select Type</option>
                  {metadataTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Row 3: Action (single field) */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="metadata-modal-field">
                <label className="metadata-modal-label">Action:</label>
                <select
                  className="metadata-modal-select"
                  value={formData.action}
                  onChange={(e) => handleInputChange("action", e.target.value)}
                >
                  <option value="">Select Action</option>
                  {actionOptions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="metadata-modal-field mb-4">
            <label className="metadata-modal-label">Description:</label>
            <textarea
              className="metadata-modal-textarea"
              placeholder="Enter metadata description..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
            />
          </div>

          {/* Row 3: Ticket & Release */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="metadata-modal-field">
                <label className="metadata-modal-label">Ticket:</label>
                <div className="metadata-lookup-container">
                  <input
                    type="text"
                    className="metadata-modal-select"
                    placeholder="Search tickets..."
                    value={ticketSearch}
                    onChange={(e) => {
                      setTicketSearch(e.target.value);
                      setShowTicketDropdown(true);
                    }}
                    onFocus={() => setShowTicketDropdown(true)}
                    onBlur={() => {
                      // Delay hiding to allow for clicks
                      setTimeout(() => setShowTicketDropdown(false), 200);
                    }}
                  />
                  {showTicketDropdown && (
                    <div className="metadata-lookup-dropdown">
                      {getFilteredTickets().length === 0 ? (
                        <div className="metadata-lookup-item metadata-lookup-no-results">
                          No tickets found
                        </div>
                      ) : (
                        getFilteredTickets().map((ticket) => (
                          <div
                            key={ticket.id}
                            className="metadata-lookup-item"
                            onClick={() => handleTicketSelect(ticket)}
                          >
                            <div className="metadata-lookup-id">
                              {ticket.id}
                            </div>
                            <div className="metadata-lookup-title">
                              {ticket.title}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="metadata-modal-field">
                <label className="metadata-modal-label">Release:</label>
                <div className="metadata-lookup-container">
                  <input
                    type="text"
                    className="metadata-modal-select"
                    placeholder="Search releases..."
                    value={releaseSearch}
                    onChange={(e) => {
                      setReleaseSearch(e.target.value);
                      setShowReleaseDropdown(true);
                    }}
                    onFocus={() => setShowReleaseDropdown(true)}
                    onBlur={() => {
                      // Delay hiding to allow for clicks
                      setTimeout(() => setShowReleaseDropdown(false), 200);
                    }}
                  />
                  {showReleaseDropdown && (
                    <div className="metadata-lookup-dropdown">
                      {getFilteredReleases().length === 0 ? (
                        <div className="metadata-lookup-item metadata-lookup-no-results">
                          No releases found
                        </div>
                      ) : (
                        getFilteredReleases().map((release) => (
                          <div
                            key={release.id}
                            className="metadata-lookup-item"
                            onClick={() => handleReleaseSelect(release)}
                          >
                            <div className="metadata-lookup-id">
                              {release.id}
                            </div>
                            <div className="metadata-lookup-title">
                              {release.name}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="metadata-modal-footer-modern">
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

export default MetadataEditModal;
