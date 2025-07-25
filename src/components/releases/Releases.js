import React, { useState, useEffect, useMemo } from "react";
import ReleaseModal from "./ReleaseModal";
import NewReleaseModal from "./NewReleaseModal";
import ReleaseFilterModal from "./ReleaseFilterModal";
import ReleaseSearchModal from "./ReleaseSearchModal";
import TicketModal from "../tickets/TicketModal";
import NotificationToast from "../common/NotificationToast";
import { useApp } from "../../context/AppContext";
import { getStatusClass } from "../../utils/statusUtils";
import {
  RELEASE_SORT_OPTIONS,
  DEFAULT_RELEASE_FILTERS,
} from "../../constants/releaseFields";
import {
  Search,
  Filter,
  User,
  Clock,
  List,
  Grid,
  Plus,
  Package,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import "./Releases.css";

const Releases = () => {
  const {
    releases,
    loading,
    error,
    deleteRelease,
    updateRelease,
    createRelease,
    updateTicket,
    users,
    tickets,
    supabase,
    refreshData,
  } = useApp();

  // View and filter state
  const [viewMode, setViewMode] = useState("list");
  const [sortOption, setSortOption] = useState("target_date_desc");
  const [sortOrder, setSortOrder] = useState("desc");
  const [releaseFilters, setReleaseFilters] = useState(DEFAULT_RELEASE_FILTERS);

  // Modal states
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNewReleaseModal, setShowNewReleaseModal] = useState(false);

  // Expanded tickets state - tracks which releases have expanded ticket lists
  const [expandedTickets, setExpandedTickets] = useState(new Set());

  // Toast notification state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // Saved filters state (placeholder for future implementation)
  const [savedFilters, setSavedFilters] = useState([]);

  // Toast notification helper
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
  };

  // Toggle expanded tickets for a release
  const toggleExpandedTickets = (releaseId, event) => {
    event.stopPropagation(); // Prevent release card click
    setExpandedTickets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(releaseId)) {
        newSet.delete(releaseId);
      } else {
        newSet.add(releaseId);
      }
      return newSet;
    });
  };

  // Sort toggle handler
  const handleSortToggle = () => {
    const newOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newOrder);
    setSortOption(`target_date_${newOrder}`);
  };

  // Filter and sort releases
  const filteredAndSortedReleases = useMemo(() => {
    if (!releases || !Array.isArray(releases)) return [];

    let filtered = [...releases];

    // Apply filters
    if (releaseFilters.status.length > 0) {
      filtered = filtered.filter((release) =>
        releaseFilters.status.includes(release.status)
      );
    }

    if (releaseFilters.type) {
      filtered = filtered.filter(
        (release) => release.type === releaseFilters.type
      );
    }

    if (releaseFilters.priority) {
      filtered = filtered.filter(
        (release) => release.priority === releaseFilters.priority
      );
    }

    if (releaseFilters.version) {
      filtered = filtered.filter(
        (release) => release.version === releaseFilters.version
      );
    }

    if (releaseFilters.target_date_from) {
      filtered = filtered.filter((release) => {
        if (!release.target) return false;
        return (
          new Date(release.target) >= new Date(releaseFilters.target_date_from)
        );
      });
    }

    if (releaseFilters.target_date_to) {
      filtered = filtered.filter((release) => {
        if (!release.target) return false;
        return (
          new Date(release.target) <= new Date(releaseFilters.target_date_to)
        );
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case "target_date_asc":
          if (!a.target) return 1;
          if (!b.target) return -1;
          return new Date(a.target) - new Date(b.target);
        case "target_date_desc":
          if (!a.target) return 1;
          if (!b.target) return -1;
          return new Date(b.target) - new Date(a.target);
        case "name_asc":
          return (a.name || "").localeCompare(b.name || "");
        case "name_desc":
          return (b.name || "").localeCompare(a.name || "");
        case "status_asc":
          return (a.status || "").localeCompare(b.status || "");
        case "created_date_desc":
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case "created_date_asc":
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [releases, releaseFilters, sortOption]);

  // Handler functions
  const handleReleaseClick = (release) => {
    setSelectedRelease(release);
  };

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
  };

  const handleApplyFilters = (newFilters) => {
    setReleaseFilters(newFilters);
    showToast("Filters applied successfully", "success");
  };

  const handleClearFilters = () => {
    setReleaseFilters(DEFAULT_RELEASE_FILTERS);
    showToast("Filters cleared", "info");
  };

  // Count active filters for the main component
  const activeFilterCount = useMemo(() => {
    if (!releaseFilters) return 0;
    return Object.values(releaseFilters).filter((value) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value && value !== "";
    }).length;
  }, [releaseFilters]);

  const handleUpdateRelease = async (releaseId, updateData) => {
    try {
      await updateRelease(releaseId, updateData);
      return true;
    } catch (error) {
      console.error("Error updating release:", error);
      throw error;
    }
  };

  // Load saved filters on component mount
  useEffect(() => {
    const loadSavedFilters = async () => {
      try {
        const { data, error } = await supabase
          .from("saved_filters")
          .select("*")
          .eq("filter_type", "releases")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setSavedFilters(data || []);
      } catch (error) {
        console.error("Error loading saved filters:", error);
      }
    };

    if (supabase) {
      loadSavedFilters();
    }
  }, [supabase]);

  // Saved filter handlers
  const saveFilter = async (filterData) => {
    try {
      const { data, error } = await supabase
        .from("saved_filters")
        .insert([filterData])
        .select()
        .single();

      if (error) throw error;

      setSavedFilters((prev) => [data, ...prev]);
      showToast("Filter saved successfully", "success");
      return data;
    } catch (error) {
      console.error("Error saving filter:", error);
      showToast("Failed to save filter", "error");
      throw error;
    }
  };

  const deleteSavedFilter = async (filterId) => {
    try {
      const { error } = await supabase
        .from("saved_filters")
        .delete()
        .eq("id", filterId);

      if (error) throw error;

      setSavedFilters((prev) =>
        prev.filter((filter) => filter.id !== filterId)
      );
      showToast("Filter deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting saved filter:", error);
      showToast("Failed to delete filter", "error");
      throw error;
    }
  };

  // Handle delete confirmation (keeping existing functionality)
  const handleDeleteConfirm = async () => {
    if (!releaseToDelete) return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await deleteRelease(releaseToDelete.id);
      setShowDeleteModal(false);
      setReleaseToDelete(null);
    } catch (err) {
      console.error("Error deleting release:", err);
      setDeleteError(
        err.message || "Failed to delete release. Please try again."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle opening the ticket edit modal
  const handleOpenTicketEditModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketEditModal(true);
  };

  // Handle closing the ticket edit modal
  const handleCloseTicketEditModal = () => {
    setShowTicketEditModal(false);
    setSelectedTicket(null);
  };

  // Handle updating a ticket in the releases state
  const handleTicketUpdate = async (updatedTicket) => {
    console.log(" handleTicketUpdate called with:", updatedTicket);
    if (!updatedTicket) return;

    try {
      // Set loading state
      setRefreshingTickets(true);
      setRefreshError(null);

      // Log the current state
      console.log(" Current state:");
      console.log(
        " - Using context releases:",
        releases && releases.length > 0
      );
      console.log(
        " - Using local releases:",
        localReleases && localReleases.length > 0
      );
      console.log(" - Supabase available:", !!supabase);

      // Find which release contains this ticket
      let releaseId = null;
      let releaseSource = null;

      // Check in context releases first
      if (releases && releases.length > 0) {
        console.log(" Searching in context releases...");
        const releaseWithTicket = releases.find((release) => {
          const hasTicket =
            release.tickets &&
            Array.isArray(release.tickets) &&
            release.tickets.some((t) => t.id === updatedTicket.id);
          if (hasTicket) {
            console.log(
              ` Found ticket ${updatedTicket.id} in release ${release.id} (${release.name})`
            );
          }
          return hasTicket;
        });

        if (releaseWithTicket) {
          releaseId = releaseWithTicket.id;
          releaseSource = "context";
          console.log(` Using release ID ${releaseId} from context`);
        } else {
          console.log(" Ticket not found in context releases");
        }
      }

      // If not found in context releases, check local releases
      if (!releaseId && localReleases && localReleases.length > 0) {
        console.log(" Searching in local releases...");
        const releaseWithTicket = localReleases.find((release) => {
          const hasTicket =
            release.tickets &&
            Array.isArray(release.tickets) &&
            release.tickets.some((t) => t.id === updatedTicket.id);
          if (hasTicket) {
            console.log(
              ` Found ticket ${updatedTicket.id} in local release ${release.id} (${release.name})`
            );
          }
          return hasTicket;
        });

        if (releaseWithTicket) {
          releaseId = releaseWithTicket.id;
          releaseSource = "local";
          console.log(` Using release ID ${releaseId} from local state`);
        } else {
          console.log(" Ticket not found in local releases");
        }
      }

      // If we found which release contains this ticket, fetch fresh data directly from Supabase
      if (releaseId && supabase) {
        console.log(` Fetching fresh data for release ID: ${releaseId}`);

        // First, get the release
        const { data: freshRelease, error: releaseError } = await supabase
          .from("releases")
          .select("*")
          .eq("id", releaseId)
          .single();

        console.log(" Release query result:", { freshRelease, releaseError });

        if (releaseError) {
          console.error(" Error fetching release:", releaseError);
          throw releaseError;
        }

        if (freshRelease) {
          // Get related tickets for this release
          const { data: freshTickets, error: ticketsError } = await supabase
            .from("tickets")
            .select("*")
            .eq("release_id", releaseId);

          console.log(" Tickets query result:", {
            count: freshTickets?.length || 0,
            error: ticketsError,
            ticketIds: freshTickets?.map((t) => t.id) || [],
          });

          if (ticketsError) {
            console.error(" Error fetching tickets:", ticketsError);
            throw ticketsError;
          }

          // Create a complete release object with tickets
          const completeRelease = {
            ...freshRelease,
            tickets: freshTickets || [],
          };

          console.log(" Fresh release data fetched:", {
            id: completeRelease.id,
            name: completeRelease.name,
            ticketCount: completeRelease.tickets?.length || 0,
          });

          // Check if our updated ticket is in the fresh data
          const updatedTicketInFreshData = completeRelease.tickets?.find(
            (t) => t.id === updatedTicket.id
          );
          console.log(
            " Updated ticket in fresh data:",
            updatedTicketInFreshData || "Not found"
          );

          // Update the appropriate releases array
          if (releaseSource === "context" && releases && releases.length > 0) {
            console.log(" Updating context releases array");
            const updatedReleases = releases.map((release) =>
              release.id === releaseId ? completeRelease : release
            );

            // Force a re-render with the updated data
            console.log(" Setting local releases from context update");
            setLocalReleases([...updatedReleases]);
          } else if (
            releaseSource === "local" &&
            localReleases &&
            localReleases.length > 0
          ) {
            console.log(" Updating local releases array");
            const updatedLocalReleases = localReleases.map((release) =>
              release.id === releaseId ? completeRelease : release
            );

            // Force a re-render with the updated data
            console.log(" Setting local releases from local update");
            setLocalReleases([...updatedLocalReleases]);
          }
        }
      } else {
        // If we can't find which release contains this ticket or don't have supabase,
        // just update the local state as before
        console.log(
          " Falling back to local state update for ticket:",
          updatedTicket.id
        );
        console.log(
          " Reason:",
          !releaseId ? "Release ID not found" : "Supabase not available"
        );

        // Determine which releases array to update
        const releasesToUpdate =
          releases && releases.length > 0 ? releases : localReleases;

        if (releasesToUpdate && releasesToUpdate.length > 0) {
          console.log(" Updating releases with local data");
          const updatedReleases = JSON.parse(JSON.stringify(releasesToUpdate));

          let ticketFound = false;
          updatedReleases.forEach((release) => {
            if (release.tickets && Array.isArray(release.tickets)) {
              const ticketIndex = release.tickets.findIndex(
                (t) => t.id === updatedTicket.id
              );
              if (ticketIndex !== -1) {
                console.log(` Found ticket to update in release ${release.id}`);
                console.log(" Before update:", release.tickets[ticketIndex]);
                release.tickets[ticketIndex] = {
                  ...release.tickets[ticketIndex],
                  ...updatedTicket,
                };
                console.log(" After update:", release.tickets[ticketIndex]);
                ticketFound = true;
              }
            }
          });

          if (!ticketFound) {
            console.log(
              " Warning: Ticket not found in any release during local update"
            );
          }

          // Force a re-render with the updated data
          console.log(" Setting local releases from fallback update");
          setLocalReleases([...updatedReleases]);
        } else {
          console.log(" No releases to update");
        }
      }
    } catch (err) {
      console.error(" Error refreshing release data after ticket update:", err);
      setRefreshError(
        "Failed to refresh data after ticket update. Please reload the page."
      );
    } finally {
      setRefreshingTickets(false);
      console.log(" Ticket update process completed");
    }
  };

  // Release card component
  const ReleaseCard = ({ release }) => {
    const formatDate = (dateString) => {
      if (!dateString) return "No target date";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      } catch {
        return dateString;
      }
    };

    return (
      <div
        onClick={() => handleReleaseClick(release)}
        className="release-card-modern"
      >
        <div className="d-flex justify-content-between align-items-start mb-3">
          <h3 className="release-card-id mb-0">{release.id}</h3>
          <div className={`status-badge ${getStatusClass(release.status)}`}>
            <span>{release.status || "Unknown"}</span>
          </div>
        </div>

        <div className="mb-3">
          <p className="release-card-title">
            {release.name || "Untitled Release"}
          </p>
          {release.version && (
            <div className="release-card-version">
              <Package size={14} className="me-1" />
              {release.version}
            </div>
          )}
        </div>

        <div className="release-card-meta mb-3">
          <div className="release-card-target">
            <Calendar size={14} className="me-1" />
            <span>{formatDate(release.target)}</span>
          </div>
          {release.tickets && (
            <div className="release-card-tickets">
              {release.tickets.length} ticket
              {release.tickets.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {release.description && (
          <div className="release-card-description mb-3">
            {release.description.length > 100
              ? `${release.description.substring(0, 100)}...`
              : release.description}
          </div>
        )}

        {release.tickets && release.tickets.length > 0 && (
          <div className="release-card-related-tickets">
            <h6 className="related-tickets-title">
              Related Tickets ({release.tickets.length})
            </h6>
            <div className="related-tickets-preview">
              {(expandedTickets.has(release.id)
                ? release.tickets
                : release.tickets.slice(0, 3)
              ).map((ticket) => (
                <div
                  key={ticket.id}
                  className="related-ticket-preview"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTicketClick(ticket);
                  }}
                >
                  <span className="ticket-preview-id">{ticket.id}</span>
                  <span className="ticket-preview-title">
                    {ticket.title?.length > 30
                      ? `${ticket.title.substring(0, 30)}...`
                      : ticket.title}
                  </span>
                </div>
              ))}
              {release.tickets.length > 3 && (
                <div
                  className="related-tickets-more clickable"
                  onClick={(e) => toggleExpandedTickets(release.id, e)}
                >
                  {expandedTickets.has(release.id)
                    ? "Show less"
                    : `+${release.tickets.length - 3} more tickets`}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Release list item component
  const ReleaseListItem = ({ release }) => {
    const formatDate = (dateString) => {
      if (!dateString) return "No target date";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      } catch {
        return dateString;
      }
    };

    return (
      <div
        onClick={() => handleReleaseClick(release)}
        className="release-list-item-modern"
      >
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-2">
              <span className="release-id-modern me-3">{release.id}</span>
            </div>
            <h3 className="release-title-modern">
              {release.name || "Untitled Release"}
            </h3>
            {release.version && (
              <div className="release-version-modern">
                <Package size={14} className="me-1" />
                {release.version}
              </div>
            )}
          </div>
          <div className={`status-badge ${getStatusClass(release.status)}`}>
            <span>{release.status || "Unknown"}</span>
          </div>
        </div>

        <div className="release-meta mb-3">
          <div className="release-target">
            <Calendar size={14} className="me-1" />
            <span>{formatDate(release.target)}</span>
          </div>
          {release.tickets && (
            <div className="release-tickets-count">
              {release.tickets.length} ticket
              {release.tickets.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {release.description && (
          <div className="release-description-modern mb-3">
            {release.description.length > 150
              ? `${release.description.substring(0, 150)}...`
              : release.description}
          </div>
        )}

        {release.tickets && release.tickets.length > 0 && (
          <div className="release-related-tickets-list">
            <div className="related-tickets-header">
              Related Tickets ({release.tickets.length})
            </div>
            <div className="related-tickets-preview-list">
              {(expandedTickets.has(release.id)
                ? release.tickets
                : release.tickets.slice(0, 2)
              ).map((ticket) => (
                <div
                  key={ticket.id}
                  className="related-ticket-preview-list"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTicketClick(ticket);
                  }}
                >
                  <span className="ticket-preview-id">{ticket.id}</span>
                  <span className="ticket-preview-title">
                    {ticket.title?.length > 50
                      ? `${ticket.title.substring(0, 50)}...`
                      : ticket.title}
                  </span>
                </div>
              ))}
              {release.tickets.length > 2 && (
                <div
                  className="related-tickets-more clickable"
                  onClick={(e) => toggleExpandedTickets(release.id, e)}
                >
                  {expandedTickets.has(release.id)
                    ? "Show less"
                    : `+${release.tickets.length - 2} more tickets`}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="releases-page-modern">
      {/* Header */}
      <div className="releases-header-modern">
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="releases-title">Releases</h1>
          <div className="d-flex align-items-center">
            {/* New Release Button */}
            <button
              className="btn btn-primary me-3"
              onClick={() => setShowNewReleaseModal(true)}
            >
              <Plus size={16} className="me-2" />
              New Release
            </button>

            {/* Sort Button */}
            <button
              className="btn btn-outline-secondary me-3"
              onClick={handleSortToggle}
              title={`Sort by target date ${
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
            <div className="view-toggle-modern me-3">
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
              className="btn btn-icon me-2"
              onClick={() => setShowSearchModal(true)}
              title="Search releases"
            >
              <Search size={20} />
            </button>
            <button
              className="btn btn-icon position-relative"
              onClick={() => setShowFilterModal(true)}
              title="Filter releases"
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
              onClick={handleClearFilters}
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Releases Display */}
      <div className="releases-content-modern">
        {error ? (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        ) : filteredAndSortedReleases.length > 0 ? (
          viewMode === "card" ? (
            <div className="releases-grid-container">
              {filteredAndSortedReleases.map((release) => (
                <ReleaseCard key={release.id} release={release} />
              ))}
            </div>
          ) : (
            <div className="releases-list-container">
              {filteredAndSortedReleases.map((release) => (
                <ReleaseListItem key={release.id} release={release} />
              ))}
            </div>
          )
        ) : (
          <div className="no-releases-message">
            <Package size={48} className="no-releases-icon" />
            <h3>No releases found</h3>
            <p>
              {Object.values(releaseFilters).some(
                (value) =>
                  value && (Array.isArray(value) ? value.length > 0 : true)
              )
                ? "Try adjusting your filters to see more releases."
                : "Create your first release to get started."}
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setShowNewReleaseModal(true)}
            >
              <Plus size={16} className="me-2" />
              New Release
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedRelease && (
        <ReleaseModal
          release={selectedRelease}
          onClose={() => setSelectedRelease(null)}
          onUpdateRelease={handleUpdateRelease}
          onRefreshData={refreshData}
          showToast={showToast}
          onTicketClick={handleTicketClick}
        />
      )}

      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          users={users}
          releases={releases}
          onUpdateTicket={updateTicket}
          onRefreshData={refreshData}
          showToast={showToast}
        />
      )}

      {showFilterModal && (
        <ReleaseFilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          filters={releaseFilters}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          releases={releases}
          savedFilters={savedFilters}
          onSaveFilter={saveFilter}
          onDeleteSavedFilter={deleteSavedFilter}
        />
      )}

      {showSearchModal && (
        <ReleaseSearchModal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          releases={releases}
          onReleaseSelect={(release) => setSelectedRelease(release)}
        />
      )}

      {showNewReleaseModal && (
        <NewReleaseModal
          isOpen={showNewReleaseModal}
          onClose={() => setShowNewReleaseModal(false)}
          onCreateRelease={createRelease}
          onRefreshData={refreshData}
          showToast={showToast}
        />
      )}

      {/* Toast Notification */}
      <NotificationToast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: "", type: "info" })}
      />
    </div>
  );
};

export default Releases;
