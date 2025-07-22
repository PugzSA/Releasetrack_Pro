import React, { useState, useEffect, useMemo } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { Search, X } from "lucide-react";
import "./MetadataSearchModal.css";

const MetadataSearchModal = ({
  isOpen,
  onClose,
  metadataItems = [],
  onMetadataSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter metadata items based on search term
  const filteredMetadata = useMemo(() => {
    if (!searchTerm.trim()) return metadataItems.slice(0, 10); // Show first 10 when no search

    const term = searchTerm.toLowerCase();
    return metadataItems.filter(
      (item) =>
        item.name?.toLowerCase().includes(term) ||
        item.id?.toLowerCase().includes(term) ||
        item.type?.toLowerCase().includes(term) ||
        item.component?.toLowerCase().includes(term)
    );
  }, [searchTerm, metadataItems]);

  // Reset search when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredMetadata.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredMetadata.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredMetadata[selectedIndex]) {
            handleMetadataSelect(filteredMetadata[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredMetadata, selectedIndex, onClose]);

  // Reset selected index when search results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredMetadata]);

  const handleMetadataSelect = (metadata) => {
    onMetadataSelect(metadata);
    onClose();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (!isOpen) return null;

  return (
    <div className="metadata-search-modal-overlay" onClick={onClose}>
      <div
        className="metadata-search-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="metadata-search-modal-header">
          <div className="metadata-search-modal-title">
            <Search size={20} className="me-2" />
            <span>Search Metadata</span>
          </div>
          <button className="metadata-search-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Search Input */}
        <div className="metadata-search-input-container">
          <div className="metadata-search-input-wrapper">
            <Search size={20} className="metadata-search-input-icon" />
            <Form.Control
              type="text"
              placeholder="Search by metadata name, ID, type, or component..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="metadata-search-input"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="metadata-search-results">
          {filteredMetadata.length === 0 ? (
            <div className="metadata-search-no-results">
              <Search size={48} className="text-muted mb-3" />
              <h5>No metadata found</h5>
              <p className="text-muted">
                {searchTerm
                  ? `No metadata items match "${searchTerm}"`
                  : "No metadata items available"}
              </p>
            </div>
          ) : (
            <div className="metadata-search-results-list">
              {filteredMetadata.map((item, index) => (
                <div
                  key={item.id}
                  className={`metadata-search-result-item ${
                    index === selectedIndex ? "selected" : ""
                  }`}
                  onClick={() => handleMetadataSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="metadata-search-result-header">
                    <span className="metadata-search-result-id">{item.id}</span>
                    <span className="metadata-search-result-type">
                      {item.type}
                    </span>
                  </div>
                  <div className="metadata-search-result-name">{item.name}</div>
                  <div className="metadata-search-result-meta">
                    {item.component && (
                      <span className="me-3">Component: {item.component}</span>
                    )}
                    {item.action && <span>Action: {item.action}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="metadata-search-modal-footer">
          <div className="metadata-search-shortcuts">
            <span className="metadata-search-shortcut">
              <kbd>↑</kbd> <kbd>↓</kbd> Navigate
            </span>
            <span className="metadata-search-shortcut">
              <kbd>Enter</kbd> Select
            </span>
            <span className="metadata-search-shortcut">
              <kbd>Esc</kbd> Close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetadataSearchModal;
