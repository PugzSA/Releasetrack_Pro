import React, { useState, useEffect, useMemo } from "react";
import { Button, Modal, Form, Dropdown } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import CustomTypeahead from "../common/CustomTypeahead";
import MetadataCard from "./MetadataCard";
import MetadataSearchModal from "./MetadataSearchModal";
import MetadataFilterModal from "./MetadataFilterModal";
import MetadataEditModal from "./MetadataEditModal";
import NewMetadataModal from "./NewMetadataModal";
import NotificationToast from "../common/NotificationToast";
import {
  Search,
  Filter,
  User,
  Clock,
  List,
  Grid,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import "./Metadata.css";

const Metadata = () => {
  const {
    metadataItems = [],
    tickets = [],
    releases = [],
    savedFilters = [],
    saveFilter,
    deleteSavedFilter,
    deleteMetadataItem,
    loading,
    error,
  } = useApp();

  const [filters, setFilters] = useState({
    type: "All Types",
    action: "All Actions",
  });
  const [selectedRelease, setSelectedRelease] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showSaveFilterModal, setShowSaveFilterModal] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [saveFilterError, setSaveFilterError] = useState(null);
  const [selectedSavedFilter, setSelectedSavedFilter] = useState(null);
  const [typeaheadKey, setTypeaheadKey] = useState(Date.now());
  const [sortOrder, setSortOrder] = useState("desc");

  // New state for modern layout
  const [viewMode, setViewMode] = useState("list");
  const [selectedMetadata, setSelectedMetadata] = useState(null);
  const [showNewMetadataModal, setShowNewMetadataModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Global toast state
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    variant: "success",
  });

  // Function to show toast notifications
  const showToast = (message, variant = "success") => {
    setNotification({
      show: true,
      message,
      variant,
    });
  };

  const navigate = useNavigate();

  useEffect(() => {
    resetFilters();
  }, []);

  const releaseOptions = useMemo(
    () => releases.map((r) => ({ id: r.id, label: r.name, ...r })),
    [releases]
  );
  const ticketOptions = useMemo(
    () =>
      tickets.map((t) => ({ id: t.id, label: `${t.id} - ${t.title}`, ...t })),
    [tickets]
  );

  const filteredItems = useMemo(() => {
    let items = metadataItems ? [...metadataItems] : [];

    // Apply filters
    if (filters.name && filters.name !== "") {
      items = items.filter((item) => item.name === filters.name);
    }
    if (filters.apiName && filters.apiName !== "") {
      items = items.filter((item) => item.api_name === filters.apiName);
    }
    if (filters.object && filters.object !== "") {
      items = items.filter((item) => item.object === filters.object);
    }
    if (
      filters.action &&
      filters.action !== "All Actions" &&
      filters.action !== ""
    ) {
      items = items.filter((item) => item.action === filters.action);
    }
    if (filters.type && filters.type !== "All Types" && filters.type !== "") {
      items = items.filter((item) => item.type === filters.type);
    }
    if (filters.component && filters.component !== "") {
      items = items.filter((item) =>
        item.component?.toLowerCase().includes(filters.component.toLowerCase())
      );
    }
    if (filters.ticket_id && filters.ticket_id !== "") {
      items = items.filter((item) => item.ticket_id === filters.ticket_id);
    }
    if (filters.release_id && filters.release_id !== "") {
      items = items.filter((item) => item.release_id === filters.release_id);
    }

    // Legacy support for old filter structure
    if (selectedRelease.length > 0) {
      const releaseId = selectedRelease[0].id;
      items = items.filter((item) => item.release_id === releaseId);
    }
    if (selectedTicket.length > 0) {
      const ticketId = selectedTicket[0].id;
      items = items.filter((item) => item.ticket_id === ticketId);
    }

    return items.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [filters, selectedRelease, selectedTicket, metadataItems, sortOrder]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setSelectedSavedFilter(null);
  };

  const handleReleaseChange = (selected) => {
    setSelectedRelease(selected);
    setSelectedSavedFilter(null);
  };

  const handleTicketChange = (selected) => {
    setSelectedTicket(selected);
    setSelectedSavedFilter(null);
  };

  const resetFilters = () => {
    setFilters({
      type: "All Types",
      action: "All Actions",
    });
    setSelectedRelease([]);
    setSelectedTicket([]);
    setSelectedSavedFilter(null);
    setSortOrder("desc");
    setTypeaheadKey(Date.now());
  };

  const toggleSortOrder = () =>
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteMetadataItem(itemToDelete.id);
        showToast(
          `Metadata item "${itemToDelete.name}" deleted successfully!`,
          "success"
        );
        setShowDeleteModal(false);
        setItemToDelete(null);
      } catch (error) {
        console.error("Error deleting metadata item:", error);
        showToast(
          error.message || "Failed to delete metadata item. Please try again.",
          "error"
        );
      }
    }
  };

  const handleSaveFilter = async () => {
    if (!filterName.trim()) {
      setSaveFilterError("Filter name cannot be empty.");
      return;
    }
    const filterData = {
      name: filterName.trim(),
      filter_type: "metadata",
      filter_criteria: JSON.stringify({
        filters,
        selectedRelease: selectedRelease.length > 0 ? selectedRelease[0] : null,
        selectedTicket: selectedTicket.length > 0 ? selectedTicket[0] : null,
        sortOrder,
      }),
    };
    const newFilter = await saveFilter(filterData);
    setSelectedSavedFilter(newFilter);
    setShowSaveFilterModal(false);
    setFilterName("");
    setSaveFilterError(null);
  };

  const applyFilter = (filter) => {
    try {
      const criteria = JSON.parse(filter.filter_criteria);
      setFilters(criteria.filters);
      setSelectedRelease(
        criteria.selectedRelease ? [criteria.selectedRelease] : []
      );
      setSelectedTicket(
        criteria.selectedTicket ? [criteria.selectedTicket] : []
      );
      setSortOrder(criteria.sortOrder || "desc");
      setSelectedSavedFilter(filter);
      setTypeaheadKey(Date.now());
    } catch (err) {
      console.error("Error applying filter:", err);
    }
  };

  // Count active filters for the banner
  const activeFilterCount = useMemo(() => {
    let count = 0;

    // Count non-default filter values
    if (filters.type && filters.type !== "All Types") count++;
    if (filters.action && filters.action !== "All Actions") count++;
    if (filters.name && filters.name !== "") count++;
    if (filters.apiName && filters.apiName !== "") count++;
    if (filters.object && filters.object !== "") count++;
    if (filters.ticket_id && filters.ticket_id !== "") count++;
    if (filters.release_id && filters.release_id !== "") count++;
    if (selectedRelease.length > 0) count++;
    if (selectedTicket.length > 0) count++;

    return count;
  }, [filters, selectedRelease, selectedTicket]);

  // Handle clear all filters
  const handleClearAllFilters = () => {
    setFilters({
      type: "All Types",
      action: "All Actions",
      name: "",
      apiName: "",
      object: "",
      ticket_id: "",
      release_id: "",
    });
    setSelectedRelease([]);
    setSelectedTicket([]);
    showToast("Filters cleared", "info");
  };

  // Handler functions for modern layout
  const handleMetadataClick = (metadata) => {
    setSelectedMetadata(metadata);
    setShowEditModal(true);
  };

  const handleCreateMetadata = () => {
    setShowNewMetadataModal(true);
  };

  const handleToggleSort = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  const renderEmptyState = () => (
    <div className="empty-state">
      <i className="bi bi-cloud-slash fs-1 text-muted"></i>
      <h5 className="mt-3">No Metadata Found</h5>
      <p>No metadata items match the current filter criteria.</p>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="metadata-page-modern">
      {/* Header */}
      <div className="metadata-header-modern">
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="metadata-title">Metadata</h1>
          <div className="d-flex align-items-center">
            {/* New Metadata Button */}
            <button
              className="btn btn-primary me-3"
              onClick={handleCreateMetadata}
            >
              <Plus size={16} className="me-2" />
              New Metadata
            </button>

            {/* Sort Button */}
            <button
              className="btn btn-outline-secondary me-2"
              onClick={handleToggleSort}
              title={`Sort by created date ${
                sortOrder === "desc" ? "ascending" : "descending"
              }`}
            >
              {sortOrder === "desc" ? (
                <ArrowDown size={16} className="me-2" />
              ) : (
                <ArrowUp size={16} className="me-2" />
              )}
              {sortOrder === "desc" ? "Newest First" : "Oldest First"}
            </button>

            {/* View Toggle */}
            <div className="view-toggle-modern">
              <button
                onClick={() => setViewMode("list")}
                className={`btn-toggle ${viewMode === "list" ? "active" : ""}`}
              >
                <List size={16} className="me-2" />
                List View
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`btn-toggle ${viewMode === "card" ? "active" : ""}`}
              >
                <Grid size={16} className="me-2" />
                Card View
              </button>
            </div>

            {/* Search and Filter Icons */}
            <button
              className="btn btn-icon header-icon-spacing header-search-icon"
              onClick={() => setShowSearchModal(true)}
              title="Search metadata"
            >
              <Search size={20} />
            </button>
            <button
              className="btn btn-icon header-filter-icon-spacing position-relative"
              onClick={() => setShowFilterModal(true)}
              title="Filter metadata"
            >
              <Filter size={20} />
              {activeFilterCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
                  {activeFilterCount}
                  <span className="visually-hidden">active filters</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="active-filters-summary mb-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <Filter size={16} className="me-2 text-primary" />
              <span className="text-muted">
                {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}{" "}
                applied
              </span>
            </div>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={handleClearAllFilters}
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Metadata Display */}
      <div className="metadata-content-modern">
        {viewMode === "list" ? (
          <div className="metadata-list-container">
            {filteredItems.length === 0
              ? renderEmptyState()
              : filteredItems.map((item) => (
                  <MetadataCard
                    key={item.id}
                    metadataItem={item}
                    onDeleteClick={handleDeleteClick}
                    onClick={() => handleMetadataClick(item)}
                    viewMode="list"
                  />
                ))}
          </div>
        ) : (
          <div className="metadata-grid-container">
            {filteredItems.length === 0
              ? renderEmptyState()
              : filteredItems.map((item) => (
                  <MetadataCard
                    key={item.id}
                    metadataItem={item}
                    onDeleteClick={handleDeleteClick}
                    onClick={() => handleMetadataClick(item)}
                    viewMode="card"
                  />
                ))}
          </div>
        )}
      </div>

      {/* Notification Toast */}
      <NotificationToast
        show={notification.show}
        message={notification.message}
        variant={notification.variant}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the metadata item "
          <strong>{itemToDelete?.name}</strong>"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showSaveFilterModal}
        onHide={() => setShowSaveFilterModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Save Filter</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Filter Name</Form.Label>
            <Form.Control
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Enter a name for this filter"
              isInvalid={!!saveFilterError}
            />
            <Form.Control.Feedback type="invalid">
              {saveFilterError}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowSaveFilterModal(false);
              setSaveFilterError(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveFilter}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {showSearchModal && (
        <MetadataSearchModal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          metadataItems={metadataItems}
          onMetadataSelect={(metadata) => setSelectedMetadata(metadata)}
        />
      )}

      {showFilterModal && (
        <MetadataFilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          filters={filters}
          onApplyFilters={(newFilters) => {
            setFilters(newFilters);
            showToast("Filters applied successfully", "success");
          }}
          onClearFilters={() => {
            setFilters({ type: "All Types", action: "All Actions" });
            setSelectedRelease([]);
            setSelectedTicket([]);
            showToast("Filters cleared", "info");
          }}
          releases={releases}
          tickets={tickets}
          savedFilters={savedFilters}
          onSaveFilter={saveFilter}
          onDeleteSavedFilter={deleteSavedFilter}
          metadataItems={metadataItems}
        />
      )}

      {showEditModal && selectedMetadata && (
        <MetadataEditModal
          metadata={selectedMetadata}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMetadata(null);
          }}
          onUpdateMetadata={(updatedMetadata) => {
            // Refresh the metadata list or update the specific item
            setSelectedMetadata(null);
          }}
          showToast={showToast}
        />
      )}

      {showNewMetadataModal && (
        <NewMetadataModal
          onClose={() => setShowNewMetadataModal(false)}
          onCreateMetadata={(newMetadata) => {
            // Refresh the metadata list
            setShowNewMetadataModal(false);
            // Navigate to metadata list view to show the new item
            navigate("/metadata");
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
};

export default Metadata;
