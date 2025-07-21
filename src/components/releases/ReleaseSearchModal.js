import React, { useState, useEffect, useRef } from "react";
import { Search, X, Package, Calendar } from "lucide-react";
import "./ReleaseSearchModal.css";

const ReleaseSearchModal = ({ isOpen, onClose, releases, onReleaseSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredReleases, setFilteredReleases] = useState([]);
  const searchInputRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Filter releases based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredReleases([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = releases.filter((release) => {
      const name = (release.name || "").toLowerCase();
      const version = (release.version || "").toLowerCase();
      const description = (release.description || "").toLowerCase();
      const id = (release.id || "").toString().toLowerCase();

      return (
        name.includes(term) ||
        version.includes(term) ||
        description.includes(term) ||
        id.includes(term)
      );
    });

    // Sort by relevance (exact matches first, then partial matches)
    filtered.sort((a, b) => {
      const aName = (a.name || "").toLowerCase();
      const bName = (b.name || "").toLowerCase();
      const aVersion = (a.version || "").toLowerCase();
      const bVersion = (b.version || "").toLowerCase();

      // Exact name matches first
      if (aName === term && bName !== term) return -1;
      if (bName === term && aName !== term) return 1;

      // Exact version matches next
      if (aVersion === term && bVersion !== term) return -1;
      if (bVersion === term && aVersion !== term) return 1;

      // Name starts with term
      if (aName.startsWith(term) && !bName.startsWith(term)) return -1;
      if (bName.startsWith(term) && !aName.startsWith(term)) return 1;

      // Alphabetical by name
      return aName.localeCompare(bName);
    });

    setFilteredReleases(filtered.slice(0, 20)); // Limit to 20 results
  }, [searchTerm, releases]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const handleClose = () => {
    setSearchTerm("");
    setFilteredReleases([]);
    onClose();
  };

  const handleReleaseClick = (release) => {
    onReleaseSelect(release);
    handleClose();
  };

  const highlightMatch = (text, searchTerm) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="search-highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

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

  const getStatusClass = (status) => {
    if (!status) return "status-unknown";
    return `status-${status.toLowerCase().replace(/\s+/g, "-")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal-backdrop" onClick={handleClose}>
      <div
        className="search-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="search-modal-header">
          <div className="search-input-container">
            <Search size={20} className="search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search releases by name, version, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button onClick={handleClose} className="search-close-btn">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="search-results">
          {searchTerm.trim() && filteredReleases.length === 0 && (
            <div className="search-no-results">
              <Search size={48} className="no-results-icon" />
              <p>No releases found</p>
              <span>Try adjusting your search terms</span>
            </div>
          )}

          {filteredReleases.length > 0 && (
            <div className="search-results-list">
              {filteredReleases.map((release) => (
                <div
                  key={release.id}
                  className="search-result-item"
                  onClick={() => handleReleaseClick(release)}
                >
                  <div className="search-result-header">
                    <div className="search-result-id">{release.id}</div>
                    <div
                      className={`search-result-status ${getStatusClass(
                        release.status
                      )}`}
                    >
                      {release.status || "Unknown"}
                    </div>
                  </div>

                  <div className="search-result-title">
                    {highlightMatch(
                      release.name || "Untitled Release",
                      searchTerm
                    )}
                  </div>

                  {release.version && (
                    <div className="search-result-version">
                      <Package size={14} className="version-icon" />
                      <span className="version-text">
                        {highlightMatch(release.version, searchTerm)}
                      </span>
                    </div>
                  )}

                  {release.description && (
                    <div className="search-result-description">
                      {highlightMatch(
                        release.description.length > 100
                          ? release.description.substring(0, 100) + "..."
                          : release.description,
                        searchTerm
                      )}
                    </div>
                  )}

                  <div className="search-result-footer">
                    <div className="search-result-meta">
                      <div className="search-result-target">
                        <Calendar size={14} className="target-icon" />
                        <span className="target-text">
                          {formatDate(release.target)}
                        </span>
                      </div>
                      {release.tickets && (
                        <div className="search-result-tickets">
                          {release.tickets.length} ticket
                          {release.tickets.length !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!searchTerm.trim() && (
            <div className="search-placeholder">
              <Search size={48} className="placeholder-icon" />
              <p>Start typing to search releases</p>
              <span>Search by release name, version, or description</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReleaseSearchModal;
