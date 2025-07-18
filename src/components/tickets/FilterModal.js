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
}) => {
  // Local state for filter form
  const [localFilters, setLocalFilters] = useState({
    requester_id: "",
    assignee_id: "",
    supportArea: "",
    type: "",
    priority: "",
    status: "",
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

  // Initialize local filters when modal opens or filters prop changes
  useEffect(() => {
    if (isOpen && filters) {
      setLocalFilters({
        requester_id: filters.requester_id || "",
        assignee_id: filters.assignee_id || "",
        supportArea: filters.supportArea || "",
        type: filters.type || "",
        priority: filters.priority || "",
        status: filters.status || "",
        release_id: filters.release_id || "",
      });
    }
  }, [isOpen, filters]);

  // Define comprehensive option lists to match NewTicketModal/TicketModal
  const supportAreas = TICKET_SUPPORT_AREAS;
  const types = TICKET_TYPES;
  const priorities = TICKET_PRIORITIES;
  const statuses = TICKET_STATUSES;

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
      status: "",
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
  const activeFilterCount = Object.values(localFilters).filter(Boolean).length;

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

        {/* Content */}
        <div className="filter-modal-content">
          <div className="filter-grid">
            {/* Requester Filter */}
            <div className="filter-group">
              <label className="filter-label">
                <User size={16} className="me-2" />
                Requester
              </label>
              <div className="filter-dropdown-container">
                <div className="filter-search-input">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search requesters..."
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
              <label className="filter-label">
                <User size={16} className="me-2" />
                Assignee
              </label>
              <div className="filter-dropdown-container">
                <div className="filter-search-input">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search assignees..."
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
              <label className="filter-label">
                <Tag size={16} className="me-2" />
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
              <label className="filter-label">
                <AlertCircle size={16} className="me-2" />
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
              <label className="filter-label">
                <AlertCircle size={16} className="me-2" />
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

            {/* Status Filter */}
            <div className="filter-group">
              <label className="filter-label">
                <CheckCircle size={16} className="me-2" />
                Status
              </label>
              <select
                className="filter-select"
                value={localFilters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">All Statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Release Filter */}
            <div className="filter-group">
              <label className="filter-label">
                <Calendar size={16} className="me-2" />
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
    </div>
  );
};

export default FilterModal;
