import React, { useState, useEffect, useRef } from "react";
import { Search, X, User } from "lucide-react";
import "./SearchModal.css";

const SearchModal = ({ isOpen, onClose, tickets, onTicketSelect, users }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTickets, setFilteredTickets] = useState([]);
  const searchInputRef = useRef(null);

  // Helper function to get requester name
  const getRequesterName = (requesterId) => {
    if (!requesterId || !users) return "No Requester";
    const user = users.find((u) => u.id === requesterId);
    return user ? `${user.firstName} ${user.lastName}` : "No Requester";
  };

  // Filter tickets based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTickets([]);
      return;
    }

    const filtered = tickets.filter((ticket) => {
      const titleMatch = ticket.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const idMatch = ticket.id
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      return titleMatch || idMatch;
    });

    setFilteredTickets(filtered);
  }, [searchTerm, tickets]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

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
    setFilteredTickets([]);
    onClose();
  };

  const handleTicketClick = (ticket) => {
    onTicketSelect(ticket);
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
              placeholder="Search tickets by title or ID..."
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
          {searchTerm.trim() && filteredTickets.length === 0 && (
            <div className="search-no-results">
              <Search size={48} className="no-results-icon" />
              <p>No tickets found matching "{searchTerm}"</p>
              <span>Try searching by ticket ID or title keywords</span>
            </div>
          )}

          {filteredTickets.length > 0 && (
            <div className="search-results-list">
              <div className="search-results-header">
                <span>
                  {filteredTickets.length} ticket
                  {filteredTickets.length !== 1 ? "s" : ""} found
                </span>
              </div>
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="search-result-item"
                  onClick={() => handleTicketClick(ticket)}
                >
                  <div className="search-result-header">
                    <span className="search-result-id">
                      {highlightMatch(ticket.id || "", searchTerm)}
                    </span>
                    <span
                      className={`search-result-status status-${
                        ticket.status?.toLowerCase().replace(" ", "-") || "open"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  <div className="search-result-title">
                    {highlightMatch(ticket.title || "", searchTerm)}
                  </div>
                  <div className="search-result-footer">
                    <div className="search-result-meta">
                      <span className="search-result-type">{ticket.type}</span>
                      <span className="search-result-priority">
                        {ticket.priority}
                      </span>
                    </div>
                    <div className="search-result-requester">
                      <User size={14} className="requester-icon" />
                      <span className="requester-name">
                        {getRequesterName(ticket.requester_id)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!searchTerm.trim() && (
            <div className="search-placeholder">
              <Search size={48} className="placeholder-icon" />
              <p>Start typing to search tickets</p>
              <span>Search by ticket ID or title keywords</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
