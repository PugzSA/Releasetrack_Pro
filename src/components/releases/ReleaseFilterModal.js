import React, { useState, useEffect } from "react";
import {
  X,
  Filter,
  RotateCcw,
  Save,
  Calendar,
  CheckCircle,
  FolderOpen,
  Bookmark,
  Trash2,
  Package,
  AlertCircle,
} from "lucide-react";
import { RELEASE_STATUSES } from "../../constants/releaseFields";
import "./ReleaseFilterModal.css";

const ReleaseFilterModal = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onClearFilters,
  releases = [],
  savedFilters = [],
  onSaveFilter,
  onDeleteSavedFilter,
}) => {
  // Local state for filter form
  const [localFilters, setLocalFilters] = useState({
    status: [],
    target_date_from: "",
    target_date_to: "",
  });

  // Save/Load filter states
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadDropdown, setShowLoadDropdown] = useState(false);
  const [filterName, setFilterName] = useState("");

  // Initialize local filters when modal opens or filters prop changes
  useEffect(() => {
    if (isOpen && filters) {
      setLocalFilters({
        status: filters.status || [],
        target_date_from: filters.target_date_from || "",
        target_date_to: filters.target_date_to || "",
      });
    }
  }, [isOpen, filters]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  // Define option lists
  const statuses = RELEASE_STATUSES;

  // Filter saved filters to only show release filters
  const releaseSavedFilters = savedFilters.filter(
    (filter) => filter.filter_type === "releases"
  );

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle status multi-select
  const handleStatusChange = (status) => {
    setLocalFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }));
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.status.length > 0) count++;
    if (localFilters.target_date_from) count++;
    if (localFilters.target_date_to) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Handle apply filters
  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  // Handle clear filters
  const handleClear = () => {
    const clearedFilters = {
      status: [],
      target_date_from: "",
      target_date_to: "",
    };
    setLocalFilters(clearedFilters);
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
        filter_type: "releases",
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
      setShowLoadDropdown(false);
    } catch (error) {
      console.error("Error loading saved filter:", error);
      alert("Failed to load saved filter.");
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
            <span>Filter Releases</span>
            {activeFilterCount > 0 && (
              <span className="filter-count-badge">{activeFilterCount}</span>
            )}
          </div>
          <button className="filter-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Saved Filters Section */}
        {releaseSavedFilters.length > 0 && (
          <div className="saved-filters-section">
            <div className="saved-filters-header">
              <button
                className="btn-load-filters"
                onClick={() => setShowLoadDropdown(!showLoadDropdown)}
              >
                <FolderOpen size={16} className="me-2" />
                Load Saved Filter ({releaseSavedFilters.length})
              </button>
            </div>
            {showLoadDropdown && (
              <div className="saved-filters-dropdown">
                {releaseSavedFilters.map((savedFilter) => (
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
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSavedFilter(savedFilter.id);
                      }}
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
            {/* Status Filter */}
            <div className="filter-group">
              <label className="filter-label">
                <CheckCircle size={16} className="me-2" />
                Status
              </label>
              <div className="filter-checkbox-group">
                {statuses.map((status) => (
                  <label key={status} className="filter-checkbox-item">
                    <input
                      type="checkbox"
                      checked={localFilters.status.includes(status)}
                      onChange={() => handleStatusChange(status)}
                    />
                    <span className="filter-checkbox-label">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Target Date From */}
            <div className="filter-group">
              <label className="filter-label">
                <Calendar size={16} className="me-2" />
                Target Date From
              </label>
              <input
                type="date"
                className="filter-input"
                value={localFilters.target_date_from}
                onChange={(e) =>
                  handleFilterChange("target_date_from", e.target.value)
                }
              />
            </div>

            {/* Target Date To */}
            <div className="filter-group">
              <label className="filter-label">
                <Calendar size={16} className="me-2" />
                Target Date To
              </label>
              <input
                type="date"
                className="filter-input"
                value={localFilters.target_date_to}
                onChange={(e) =>
                  handleFilterChange("target_date_to", e.target.value)
                }
              />
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
    </div>
  );
};

export default ReleaseFilterModal;
