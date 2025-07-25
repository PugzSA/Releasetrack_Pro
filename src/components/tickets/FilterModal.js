import React, { useState, useEffect } from "react";
import {
  X,
  Filter,
  RotateCcw,
  Save,
  Search,
  User,
  Tag,
  AlertCircle,
  Calendar,
  CheckCircle,
  FolderOpen,
  Bookmark,
  Trash2,
} from "lucide-react";
import {
  TICKET_TYPES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  TICKET_SUPPORT_AREAS,
} from "../../constants/ticketFields";
import "./FilterModal.css";

const FilterModal = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onClearFilters,
  users = [],
  releases = [],
  tickets = [],
  savedFilters = [],
  onSaveFilter,
  onDeleteSavedFilter,
}) => {
  // Local state for filter form
  const [localFilters, setLocalFilters] = useState({
    requester_id: "",
    assignee_id: "",
    supportArea: "",
    type: "",
    priority: "",
    status: [], // Changed to array for multi-select
    release_id: "",
  });

  // Search states for dropdowns
  const [searchTerms, setSearchTerms] = useState({
    requester: "",
    assignee: "",
  });

  // Dropdown open states
  const [dropdownOpen, setDropdownOpen] = useState({
    requester: false,
    assignee: false,
  });

  // Save/Load filter states
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadDropdown, setShowLoadDropdown] = useState(false);
  const [filterName, setFilterName] = useState("");

  // Initialize local filters when modal opens or filters prop changes
  useEffect(() => {
    if (isOpen && filters) {
      setLocalFilters({
        requester_id: filters.requester_id || "",
        assignee_id: filters.assignee_id || "",
        supportArea: filters.supportArea || "",
        type: filters.type || "",
        priority: filters.priority || "",
        status: Array.isArray(filters.status)
          ? filters.status
          : filters.status
          ? [filters.status]
          : [],
        release_id: filters.release_id || "",
      });
    }
  }, [isOpen, filters]);

  // Define comprehensive option lists to match NewTicketModal/TicketModal
  const supportAreas = TICKET_SUPPORT_AREAS;
  const types = TICKET_TYPES;
  const priorities = TICKET_PRIORITIES;
  const statuses = TICKET_STATUSES;

  // Filter saved filters to only show ticket filters
  const ticketSavedFilters = savedFilters.filter(
    (filter) => filter.filter_type === "tickets"
  );

  // Filter users based on search term
  const getFilteredUsers = (searchTerm) => {
    if (!searchTerm) return users.slice(0, 10); // Show first 10 users when no search
    const term = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
    );
  };

  // Handle input changes
  const handleFilterChange = (field, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle multi-select changes (for status field)
  const handleMultiSelectChange = (field, value) => {
    setLocalFilters((prev) => {
      const currentValues = prev[field] || [];
      const isSelected = currentValues.includes(value);

      if (isSelected) {
        // Remove the value
        return {
          ...prev,
          [field]: currentValues.filter((item) => item !== value),
        };
      } else {
        // Add the value
        return {
          ...prev,
          [field]: [...currentValues, value],
        };
      }
    });
  };

  // Handle search term changes
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

  // Handle user selection
  const handleUserSelect = (field, userId, userName) => {
    handleFilterChange(field, userId);
    setSearchTerms((prev) => ({
      ...prev,
      [field.replace("_id", "")]: userName,
    }));
    setDropdownOpen((prev) => ({
      ...prev,
      [field.replace("_id", "")]: false,
    }));
  };

  // Handle apply filters
  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  // Handle clear filters
  const handleClear = () => {
    const clearedFilters = {
      requester_id: "",
      assignee_id: "",
      supportArea: "",
      type: "",
      priority: "",
      status: [], // Clear to empty array
      release_id: "",
    };
    setLocalFilters(clearedFilters);
    setSearchTerms({ requester: "", assignee: "" });
    onClearFilters();
  };

  // Get selected user name
  const getSelectedUserName = (userId) => {
    if (!userId) return "";
    const user = users.find((u) => u.id === parseInt(userId));
    return user ? `${user.firstName} ${user.lastName}` : "";
  };

  // Count active filters
  const activeFilterCount = Object.values(localFilters).filter((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return Boolean(value);
  }).length;

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
        filter_type: "tickets",
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
      const parsedFilters = JSON.parse(savedFilter.filter_criteria);
      setLocalFilters(parsedFilters);
      setShowLoadDropdown(false);
    } catch (error) {
      console.error("Error loading saved filter:", error);
      alert("Failed to load saved filter. The filter data may be corrupted.");
    }
  };

  // Handle delete saved filter
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
            <span>Filter Tickets</span>
            {activeFilterCount > 0 && (
              <span className="filter-count-badge">{activeFilterCount}</span>
            )}
          </div>
          <button className="filter-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Saved Filters Section */}
        {ticketSavedFilters.length > 0 && (
          <div className="saved-filters-section">
            <div className="saved-filters-header">
              <button
                className="btn-load-filters"
                onClick={() => setShowLoadDropdown(!showLoadDropdown)}
              >
                <FolderOpen size={16} className="me-2" />
                Load Saved Filter ({ticketSavedFilters.length})
              </button>
            </div>
            {showLoadDropdown && (
              <div className="saved-filters-dropdown">
                {ticketSavedFilters.map((savedFilter) => (
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
                      className="delete-saved-filter"
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
            {/* Requester Filter */}
            <div className="filter-group">
              <label
                className="filter-label"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "8px",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <User size={16} />
                Requester
              </label>
              <div className="filter-dropdown-container">
                <div className="filter-search-input">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search requesters..."
                    style={{ paddingLeft: "48px" }}
                    value={
                      localFilters.requester_id
                        ? getSelectedUserName(localFilters.requester_id)
                        : searchTerms.requester
                    }
                    onChange={(e) =>
                      handleSearchChange("requester", e.target.value)
                    }
                    onFocus={() => {
                      toggleDropdown("requester");
                      if (!searchTerms.requester) {
                        // Show initial users when focusing without search term
                        setSearchTerms((prev) => ({ ...prev, requester: "" }));
                      }
                    }}
                    className="filter-input"
                  />
                  {localFilters.requester_id && (
                    <button
                      className="clear-selection"
                      onClick={() => {
                        handleFilterChange("requester_id", "");
                        setSearchTerms((prev) => ({ ...prev, requester: "" }));
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                {dropdownOpen.requester && (
                  <div className="filter-dropdown">
                    {getFilteredUsers(searchTerms.requester).map((user) => (
                      <div
                        key={user.id}
                        className="filter-dropdown-item"
                        onClick={() =>
                          handleUserSelect(
                            "requester_id",
                            user.id,
                            `${user.firstName} ${user.lastName}`
                          )
                        }
                      >
                        <div className="user-info">
                          <span className="user-name">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="user-email">{user.email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Assignee Filter */}
            <div className="filter-group">
              <label
                className="filter-label"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "8px",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <User size={16} />
                Assignee
              </label>
              <div className="filter-dropdown-container">
                <div className="filter-search-input">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search assignees..."
                    style={{ paddingLeft: "48px" }}
                    value={
                      localFilters.assignee_id
                        ? getSelectedUserName(localFilters.assignee_id)
                        : searchTerms.assignee
                    }
                    onChange={(e) =>
                      handleSearchChange("assignee", e.target.value)
                    }
                    onFocus={() => {
                      toggleDropdown("assignee");
                      if (!searchTerms.assignee) {
                        // Show initial users when focusing without search term
                        setSearchTerms((prev) => ({ ...prev, assignee: "" }));
                      }
                    }}
                    className="filter-input"
                  />
                  {localFilters.assignee_id && (
                    <button
                      className="clear-selection"
                      onClick={() => {
                        handleFilterChange("assignee_id", "");
                        setSearchTerms((prev) => ({ ...prev, assignee: "" }));
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                {dropdownOpen.assignee && (
                  <div className="filter-dropdown">
                    {getFilteredUsers(searchTerms.assignee).map((user) => (
                      <div
                        key={user.id}
                        className="filter-dropdown-item"
                        onClick={() =>
                          handleUserSelect(
                            "assignee_id",
                            user.id,
                            `${user.firstName} ${user.lastName}`
                          )
                        }
                      >
                        <div className="user-info">
                          <span className="user-name">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="user-email">{user.email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Support Area Filter */}
            <div className="filter-group">
              <label
                className="filter-label"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "8px",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <Tag size={16} />
                Support Area
              </label>
              <select
                className="filter-select"
                value={localFilters.supportArea}
                onChange={(e) =>
                  handleFilterChange("supportArea", e.target.value)
                }
              >
                <option value="">All Support Areas</option>
                {supportAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="filter-group">
              <label
                className="filter-label"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "8px",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <AlertCircle size={16} />
                Type
              </label>
              <select
                className="filter-select"
                value={localFilters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              >
                <option value="">All Types</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="filter-group">
              <label
                className="filter-label"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "8px",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <AlertCircle size={16} />
                Priority
              </label>
              <select
                className="filter-select"
                value={localFilters.priority}
                onChange={(e) => handleFilterChange("priority", e.target.value)}
              >
                <option value="">All Priorities</option>
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter - Multi-Select */}
            <div className="filter-group">
              <label
                className="filter-label"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "8px",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <CheckCircle size={16} />
                Status ({localFilters.status.length} selected)
              </label>
              <div className="filter-multi-select">
                <div className="multi-select-header">
                  <span className="multi-select-placeholder">
                    {localFilters.status.length === 0
                      ? "Select statuses..."
                      : `${localFilters.status.length} status${
                          localFilters.status.length !== 1 ? "es" : ""
                        } selected`}
                  </span>
                </div>
                <div className="multi-select-options">
                  {statuses.map((status) => (
                    <label key={status} className="multi-select-option">
                      <input
                        type="checkbox"
                        checked={localFilters.status.includes(status)}
                        onChange={() =>
                          handleMultiSelectChange("status", status)
                        }
                      />
                      <span className="checkmark"></span>
                      <span className="option-text">{status}</span>
                    </label>
                  ))}
                </div>
                {localFilters.status.length > 0 && (
                  <div className="selected-items">
                    {localFilters.status.map((status) => (
                      <span key={status} className="selected-item">
                        {status}
                        <button
                          type="button"
                          onClick={() =>
                            handleMultiSelectChange("status", status)
                          }
                          className="remove-item"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Release Filter */}
            <div className="filter-group">
              <label
                className="filter-label"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "8px",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <Calendar size={16} />
                Release
              </label>
              <select
                className="filter-select"
                value={localFilters.release_id}
                onChange={(e) =>
                  handleFilterChange("release_id", e.target.value)
                }
              >
                <option value="">All Releases</option>
                {releases.map((release) => (
                  <option key={release.id} value={release.id}>
                    {release.name} {release.version && `(${release.version})`}
                  </option>
                ))}
              </select>
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
                <Save size={16} className="me-2" />
                Save Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterModal;
