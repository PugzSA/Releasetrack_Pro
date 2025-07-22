import React, { useState, useEffect } from "react";
import {
  X,
  Filter,
  RotateCcw,
  Save,
  Search,
  Package,
  Tag,
  Activity,
  FileText,
  Calendar,
  FolderOpen,
  Trash2,
} from "lucide-react";
import { METADATA_TYPES, METADATA_ACTIONS } from "./constants";
import "./MetadataFilterModal.css";

// Use shared constants from constants.js

const MetadataFilterModal = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onClearFilters,
  releases = [],
  tickets = [],
  savedFilters = [],
  onSaveFilter,
  onDeleteSavedFilter,
  metadataItems = [], // Add metadata items prop
}) => {
  // Local state for filter form
  const [localFilters, setLocalFilters] = useState({
    name: "",
    apiName: "",
    object: "",
    action: "",
    ticket_id: "",
    release_id: "",
  });

  // Search states for dropdowns
  const [searchTerms, setSearchTerms] = useState({
    name: "",
    apiName: "",
    object: "",
    ticket: "",
    release: "",
  });

  // Dropdown open states
  const [dropdownOpen, setDropdownOpen] = useState({
    name: false,
    apiName: false,
    object: false,
    ticket: false,
    release: false,
  });

  // Save/Load filter states
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadDropdown, setShowLoadDropdown] = useState(false);
  const [filterName, setFilterName] = useState("");

  // Initialize local filters when modal opens or filters prop changes
  useEffect(() => {
    if (isOpen && filters) {
      setLocalFilters({
        name: filters.name || "",
        apiName: filters.apiName || "",
        object: filters.object || "",
        action: filters.action || "",
        ticket_id: filters.ticket_id || "",
        release_id: filters.release_id || "",
      });
    }
  }, [isOpen, filters]);

  // Count active filters
  const activeFilterCount = Object.values(localFilters).filter(
    (value) => value && value !== ""
  ).length;

  // Filter saved filters to only show metadata filters
  const metadataSavedFilters = savedFilters.filter(
    (filter) => filter.filter_type === "metadata"
  );

  // Get unique values for dynamic search fields from actual metadata
  const getUniqueNames = () => {
    if (!metadataItems || metadataItems.length === 0) return [];
    const names = metadataItems
      .map((item) => item.name)
      .filter((name) => name && name.trim() !== "")
      .filter((name, index, arr) => arr.indexOf(name) === index) // Remove duplicates
      .sort();
    return names;
  };

  const getUniqueApiNames = () => {
    if (!metadataItems || metadataItems.length === 0) return [];
    const apiNames = metadataItems
      .map((item) => item.api_name)
      .filter((apiName) => apiName && apiName.trim() !== "")
      .filter((apiName, index, arr) => arr.indexOf(apiName) === index) // Remove duplicates
      .sort();
    return apiNames;
  };

  const getUniqueObjects = () => {
    if (!metadataItems || metadataItems.length === 0) return [];
    const objects = metadataItems
      .map((item) => item.object)
      .filter((object) => object && object.trim() !== "")
      .filter((object, index, arr) => arr.indexOf(object) === index) // Remove duplicates
      .sort();
    return objects;
  };

  // Filter functions for dynamic search
  const getFilteredNames = (searchTerm) => {
    if (!searchTerm) return getUniqueNames().slice(0, 10);
    const term = searchTerm.toLowerCase();
    return getUniqueNames().filter((name) => name.toLowerCase().includes(term));
  };

  const getFilteredApiNames = (searchTerm) => {
    if (!searchTerm) return getUniqueApiNames().slice(0, 10);
    const term = searchTerm.toLowerCase();
    return getUniqueApiNames().filter((name) =>
      name.toLowerCase().includes(term)
    );
  };

  const getFilteredObjects = (searchTerm) => {
    if (!searchTerm) return getUniqueObjects().slice(0, 10);
    const term = searchTerm.toLowerCase();
    return getUniqueObjects().filter((obj) => obj.toLowerCase().includes(term));
  };

  const getFilteredTickets = (searchTerm) => {
    if (!searchTerm) return tickets.slice(0, 10);
    const term = searchTerm.toLowerCase();
    return tickets.filter(
      (ticket) =>
        ticket.id?.toLowerCase().includes(term) ||
        ticket.title?.toLowerCase().includes(term)
    );
  };

  const getFilteredReleases = (searchTerm) => {
    if (!searchTerm) return releases.slice(0, 10);
    const term = searchTerm.toLowerCase();
    return releases.filter(
      (release) =>
        release.id?.toLowerCase().includes(term) ||
        release.name?.toLowerCase().includes(term)
    );
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle search changes
  const handleSearchChange = (field, value) => {
    setSearchTerms((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle dropdown toggle
  const toggleDropdown = (field) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Handle selection for dynamic fields
  const handleNameSelect = (name) => {
    handleFilterChange("name", name);
    setSearchTerms((prev) => ({ ...prev, name: "" })); // Clear search term after selection
    setDropdownOpen((prev) => ({ ...prev, name: false }));
  };

  const handleApiNameSelect = (apiName) => {
    handleFilterChange("apiName", apiName);
    setSearchTerms((prev) => ({ ...prev, apiName: "" })); // Clear search term after selection
    setDropdownOpen((prev) => ({ ...prev, apiName: false }));
  };

  const handleObjectSelect = (object) => {
    handleFilterChange("object", object);
    setSearchTerms((prev) => ({ ...prev, object: "" })); // Clear search term after selection
    setDropdownOpen((prev) => ({ ...prev, object: false }));
  };

  // Handle clearing selected values
  const handleClearField = (field) => {
    handleFilterChange(field, "");
    setSearchTerms((prev) => ({ ...prev, [field]: "" }));
    setDropdownOpen((prev) => ({ ...prev, [field]: false }));
  };

  // Handle clearing ticket field specifically
  const handleClearTicketField = () => {
    handleFilterChange("ticket_id", "");
    setSearchTerms((prev) => ({ ...prev, ticket: "" }));
    setDropdownOpen((prev) => ({ ...prev, ticket: false }));
  };

  // Handle clearing release field specifically
  const handleClearReleaseField = () => {
    handleFilterChange("release_id", "");
    setSearchTerms((prev) => ({ ...prev, release: "" }));
    setDropdownOpen((prev) => ({ ...prev, release: false }));
  };

  const handleTicketSelect = (ticketId, ticketDisplay) => {
    handleFilterChange("ticket_id", ticketId);
    setSearchTerms((prev) => ({ ...prev, ticket: ticketDisplay }));
    setDropdownOpen((prev) => ({ ...prev, ticket: false }));
  };

  const handleReleaseSelect = (releaseId, releaseDisplay) => {
    handleFilterChange("release_id", releaseId);
    setSearchTerms((prev) => ({ ...prev, release: releaseDisplay }));
    setDropdownOpen((prev) => ({ ...prev, release: false }));
  };

  // Handle apply filters
  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  // Handle clear filters
  const handleClear = () => {
    const clearedFilters = {
      name: "",
      apiName: "",
      object: "",
      action: "",
      ticket_id: "",
      release_id: "",
    };
    setLocalFilters(clearedFilters);
    setSearchTerms({
      name: "",
      apiName: "",
      object: "",
      ticket: "",
      release: "",
    });
    onClearFilters();
  };

  // Handle save filter
  const handleSaveFilter = () => {
    if (activeFilterCount === 0) {
      alert("Please set some filters before saving.");
      return;
    }
    setShowSaveModal(true);
  };

  // Handle save filter confirm
  const handleSaveFilterConfirm = async () => {
    if (!filterName.trim()) {
      alert("Please enter a name for the filter.");
      return;
    }

    try {
      const filterToSave = {
        name: filterName.trim(),
        filter_type: "metadata",
        filter_criteria: JSON.stringify(localFilters),
      };

      await onSaveFilter(filterToSave);
      setFilterName("");
      setShowSaveModal(false);
    } catch (error) {
      console.error("Error saving filter:", error);
      alert("Failed to save filter. Please try again.");
    }
  };

  // Handle load saved filter
  const handleLoadSavedFilter = (savedFilter) => {
    try {
      const criteria = JSON.parse(savedFilter.filter_criteria);
      setLocalFilters(criteria);

      // Update search terms for display
      if (criteria.ticket_id) {
        const ticket = tickets.find((t) => t.id === criteria.ticket_id);
        if (ticket) {
          setSearchTerms((prev) => ({
            ...prev,
            ticket: `${ticket.id} - ${ticket.title}`,
          }));
        }
      }
      if (criteria.release_id) {
        const release = releases.find((r) => r.id === criteria.release_id);
        if (release) {
          setSearchTerms((prev) => ({
            ...prev,
            release: `${release.id} - ${release.name}`,
          }));
        }
      }

      // Close the dropdown after loading
      setShowLoadDropdown(false);
    } catch (error) {
      console.error("Error loading saved filter:", error);
      alert("Failed to load saved filter. The filter data may be corrupted.");
    }
  };

  // Handle delete saved filter with confirmation
  const handleDeleteSavedFilter = (filterId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this saved filter?")) {
      onDeleteSavedFilter(filterId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="filter-modal-overlay" onClick={onClose}>
      <div
        className="filter-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="filter-modal-header">
          <div className="filter-modal-title">
            <Filter size={20} className="me-2" />
            <span>Filter Metadata</span>
            {activeFilterCount > 0 && (
              <span className="filter-count-badge">{activeFilterCount}</span>
            )}
          </div>
          <button className="filter-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Saved Filters Section */}
        {metadataSavedFilters.length > 0 && (
          <div className="saved-filters-section">
            <div className="saved-filters-header">
              <button
                className="btn-load-filters"
                onClick={() => setShowLoadDropdown(!showLoadDropdown)}
              >
                <FolderOpen size={16} className="me-2" />
                Load Saved Filter ({metadataSavedFilters.length})
              </button>
            </div>
            {showLoadDropdown && (
              <div className="saved-filters-dropdown">
                {metadataSavedFilters.map((savedFilter) => (
                  <div
                    key={savedFilter.id}
                    className="saved-filter-item"
                    onClick={() => handleLoadSavedFilter(savedFilter)}
                  >
                    <div className="saved-filter-info">
                      <span className="saved-filter-name">
                        {savedFilter.name}
                      </span>
                      <span className="saved-filter-date">
                        {new Date(savedFilter.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      className="saved-filter-delete"
                      onClick={(e) =>
                        handleDeleteSavedFilter(savedFilter.id, e)
                      }
                      title="Delete saved filter"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="filter-modal-content">
          <div className="filter-grid">
            {/* Name Filter */}
            <div className="filter-group">
              <label className="filter-label">Name</label>
              <div className="filter-dropdown-container">
                <div className="filter-search-input">
                  {!localFilters.name && (
                    <Search size={16} className="search-icon" />
                  )}
                  <input
                    type="text"
                    placeholder={
                      localFilters.name ? localFilters.name : "Search names..."
                    }
                    value={localFilters.name ? "" : searchTerms.name}
                    onChange={(e) => {
                      if (localFilters.name) {
                        // If there's a selected value, clear it first
                        handleClearField("name");
                      }
                      handleSearchChange("name", e.target.value);
                    }}
                    onFocus={() => {
                      if (!localFilters.name) {
                        toggleDropdown("name");
                      }
                    }}
                    className="filter-input"
                  />
                  {localFilters.name && (
                    <button
                      className="clear-filter-btn"
                      onClick={() => handleClearField("name")}
                      title="Clear selection"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                {dropdownOpen.name && !localFilters.name && (
                  <div className="filter-dropdown">
                    {getFilteredNames(searchTerms.name).map((name) => (
                      <div
                        key={name}
                        className="filter-dropdown-item"
                        onClick={() => handleNameSelect(name)}
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* API Name Filter */}
            <div className="filter-group">
              <label className="filter-label">API Name</label>
              <div className="filter-dropdown-container">
                <div className="filter-search-input">
                  {!localFilters.apiName && (
                    <Search size={16} className="search-icon" />
                  )}
                  <input
                    type="text"
                    placeholder={
                      localFilters.apiName
                        ? localFilters.apiName
                        : "Search API names..."
                    }
                    value={localFilters.apiName ? "" : searchTerms.apiName}
                    onChange={(e) => {
                      if (localFilters.apiName) {
                        handleClearField("apiName");
                      }
                      handleSearchChange("apiName", e.target.value);
                    }}
                    onFocus={() => {
                      if (!localFilters.apiName) {
                        toggleDropdown("apiName");
                      }
                    }}
                    className="filter-input"
                  />
                  {localFilters.apiName && (
                    <button
                      className="clear-filter-btn"
                      onClick={() => handleClearField("apiName")}
                      title="Clear selection"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                {dropdownOpen.apiName && !localFilters.apiName && (
                  <div className="filter-dropdown">
                    {getFilteredApiNames(searchTerms.apiName).map((apiName) => (
                      <div
                        key={apiName}
                        className="filter-dropdown-item"
                        onClick={() => handleApiNameSelect(apiName)}
                      >
                        {apiName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Object Filter */}
            <div className="filter-group">
              <label className="filter-label">Object</label>
              <div className="filter-dropdown-container">
                <div className="filter-search-input">
                  {!localFilters.object && (
                    <Search size={16} className="search-icon" />
                  )}
                  <input
                    type="text"
                    placeholder={
                      localFilters.object
                        ? localFilters.object
                        : "Search objects..."
                    }
                    value={localFilters.object ? "" : searchTerms.object}
                    onChange={(e) => {
                      if (localFilters.object) {
                        handleClearField("object");
                      }
                      handleSearchChange("object", e.target.value);
                    }}
                    onFocus={() => {
                      if (!localFilters.object) {
                        toggleDropdown("object");
                      }
                    }}
                    className="filter-input"
                  />
                  {localFilters.object && (
                    <button
                      className="clear-filter-btn"
                      onClick={() => handleClearField("object")}
                      title="Clear selection"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                {dropdownOpen.object && !localFilters.object && (
                  <div className="filter-dropdown">
                    {getFilteredObjects(searchTerms.object).map((object) => (
                      <div
                        key={object}
                        className="filter-dropdown-item"
                        onClick={() => handleObjectSelect(object)}
                      >
                        {object}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Filter */}
            <div className="filter-group">
              <label className="filter-label">Action</label>
              <select
                className="filter-select"
                value={localFilters.action}
                onChange={(e) => handleFilterChange("action", e.target.value)}
              >
                <option value="">All Actions</option>
                {METADATA_ACTIONS.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>

            {/* Ticket Filter */}
            <div className="filter-group">
              <label className="filter-label">Ticket</label>
              <div className="filter-dropdown-container">
                <div className="filter-search-input">
                  {!localFilters.ticket_id && (
                    <Search size={16} className="search-icon" />
                  )}
                  <input
                    type="text"
                    autoComplete="off"
                    data-form-type="other"
                    placeholder={
                      localFilters.ticket_id
                        ? tickets.find((t) => t.id === localFilters.ticket_id)
                            ?.id +
                            " - " +
                            tickets.find((t) => t.id === localFilters.ticket_id)
                              ?.title || ""
                        : "Search tickets..."
                    }
                    value={
                      localFilters.ticket_id
                        ? tickets.find((t) => t.id === localFilters.ticket_id)
                            ?.id +
                            " - " +
                            tickets.find((t) => t.id === localFilters.ticket_id)
                              ?.title || ""
                        : searchTerms.ticket
                    }
                    onChange={(e) => {
                      if (localFilters.ticket_id) {
                        handleClearTicketField();
                      }
                      handleSearchChange("ticket", e.target.value);
                    }}
                    onFocus={() => {
                      if (!localFilters.ticket_id) {
                        toggleDropdown("ticket");
                      }
                    }}
                    className="filter-input"
                  />
                  {localFilters.ticket_id && (
                    <button
                      className="clear-filter-btn"
                      onClick={handleClearTicketField}
                      title="Clear selection"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                {dropdownOpen.ticket && !localFilters.ticket_id && (
                  <div className="filter-dropdown">
                    {getFilteredTickets(searchTerms.ticket).map((ticket) => (
                      <div
                        key={ticket.id}
                        className="filter-dropdown-item"
                        onClick={() =>
                          handleTicketSelect(
                            ticket.id,
                            `${ticket.id} - ${ticket.title}`
                          )
                        }
                      >
                        <div className="filter-dropdown-item-main">
                          {ticket.id} - {ticket.title}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Release Filter */}
            <div className="filter-group">
              <label className="filter-label">Release</label>
              <div className="filter-dropdown-container">
                <div className="filter-search-input">
                  {!localFilters.release_id && (
                    <Search size={16} className="search-icon" />
                  )}
                  <input
                    type="text"
                    autoComplete="off"
                    data-form-type="other"
                    placeholder={
                      localFilters.release_id
                        ? releases.find((r) => r.id === localFilters.release_id)
                            ?.id +
                            " - " +
                            releases.find(
                              (r) => r.id === localFilters.release_id
                            )?.name || ""
                        : "Search releases..."
                    }
                    value={
                      localFilters.release_id
                        ? releases.find((r) => r.id === localFilters.release_id)
                            ?.id +
                            " - " +
                            releases.find(
                              (r) => r.id === localFilters.release_id
                            )?.name || ""
                        : searchTerms.release
                    }
                    onChange={(e) => {
                      if (localFilters.release_id) {
                        handleClearReleaseField();
                      }
                      handleSearchChange("release", e.target.value);
                    }}
                    onFocus={() => {
                      if (!localFilters.release_id) {
                        toggleDropdown("release");
                      }
                    }}
                    className="filter-input"
                  />
                  {localFilters.release_id && (
                    <button
                      className="clear-filter-btn"
                      onClick={handleClearReleaseField}
                      title="Clear selection"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                {dropdownOpen.release && !localFilters.release_id && (
                  <div className="filter-dropdown">
                    {getFilteredReleases(searchTerms.release).map((release) => (
                      <div
                        key={release.id}
                        className="filter-dropdown-item"
                        onClick={() =>
                          handleReleaseSelect(
                            release.id,
                            `${release.id} - ${release.name}`
                          )
                        }
                      >
                        <div className="filter-dropdown-item-main">
                          {release.id} - {release.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="filter-modal-footer">
          <div className="filter-actions-left">
            <button className="btn-filter-clear" onClick={handleClear}>
              <RotateCcw size={16} className="me-2" />
              Clear All
            </button>
            <button
              className="btn-filter-save"
              onClick={handleSaveFilter}
              disabled={activeFilterCount === 0}
            >
              <Save size={16} className="me-2" />
              Save Filter
            </button>
          </div>
          <div className="filter-actions-right">
            <button className="btn-filter-cancel" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-filter-apply" onClick={handleApply}>
              <Filter size={16} className="me-2" />
              Apply Filters
              {activeFilterCount > 0 && (
                <span className="filter-apply-count">
                  ({activeFilterCount})
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Save Filter Name Modal */}
      {showSaveModal && (
        <div
          className="save-filter-modal-overlay"
          onClick={() => setShowSaveModal(false)}
        >
          <div
            className="save-filter-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="save-filter-modal-header">
              <h3>Save Filter</h3>
              <button onClick={() => setShowSaveModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="save-filter-modal-content">
              <label>Filter Name:</label>
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Enter a name for this filter..."
                autoFocus
                onKeyPress={(e) =>
                  e.key === "Enter" && handleSaveFilterConfirm()
                }
              />
            </div>
            <div className="save-filter-modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowSaveModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleSaveFilterConfirm}
                disabled={!filterName.trim()}
              >
                Save Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetadataFilterModal;
