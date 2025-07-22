import React from "react";
import { Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import "./MetadataCard.css";

const MetadataCard = ({
  metadataItem,
  onDeleteClick,
  onClick,
  viewMode = "card",
}) => {
  const navigate = useNavigate();
  const { tickets, releases } = useApp();

  const getTicketInfo = (ticketId) => {
    if (!ticketId) return { id: "None", title: "" };
    const ticket = tickets.find((t) => t.id === ticketId);
    return ticket
      ? { id: ticket.id, title: ticket.title || "No Title" }
      : { id: ticketId, title: "Unknown Ticket" };
  };

  const getReleaseName = (releaseId) => {
    if (!releaseId) return "None";
    const releaseObj = releases.find((r) => r.id === releaseId);
    return releaseObj ? releaseObj.name : "Unknown";
  };

  const handleCardClick = (e) => {
    // Don't trigger card click if clicking on action buttons
    if (e.target.closest(".metadata-action-buttons")) {
      return;
    }
    if (onClick) {
      onClick(metadataItem);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(metadataItem);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDeleteClick(metadataItem);
  };

  return (
    <div
      className={`metadata-card-modern ${
        viewMode === "list" ? "metadata-list-item-modern" : ""
      }`}
      onClick={handleCardClick}
    >
      <div className="d-flex justify-content-between align-items-start mb-2">
        <h3 className="metadata-card-id mb-0">
          {metadataItem.id || `META-${metadataItem.id}`}
        </h3>
        <div className={`status-badge ${metadataItem.status?.toLowerCase()}`}>
          <span>{metadataItem.status || metadataItem.action}</span>
        </div>
      </div>

      <div className="mb-2">
        <p className="metadata-card-title">{metadataItem.name}</p>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-1">
        <div className="metadata-card-meta">
          <span className="metadata-card-api-name">
            {metadataItem.api_name || "No API Name"}
          </span>
        </div>
        <div className="metadata-card-meta">
          {metadataItem.created_at
            ? new Date(metadataItem.created_at).toLocaleDateString()
            : "Unknown"}
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="metadata-card-meta">
          <span className="metadata-card-object">
            {metadataItem.object || "No Object"}
          </span>
        </div>
        <div className="metadata-card-meta">
          <span className="metadata-card-type">{metadataItem.type}</span>
        </div>
      </div>

      <div className="metadata-card-footer">
        <div className="metadata-card-footer-left">
          <div className="metadata-card-ticket">
            Ticket:{" "}
            {metadataItem.ticket_id
              ? getTicketInfo(metadataItem.ticket_id).id
              : "None"}
          </div>
          <div className="metadata-card-release">
            Release: {getReleaseName(metadataItem.release_id)}
          </div>
        </div>
        <div className="metadata-action-buttons">
          <Button
            variant="link"
            className="btn-icon p-1"
            onClick={handleEditClick}
            title="Edit metadata"
          >
            <i className="bi bi-pencil"></i>
          </Button>
          <Button
            variant="link"
            className="btn-icon p-1 text-danger"
            onClick={handleDeleteClick}
            title="Delete metadata"
          >
            <i className="bi bi-trash"></i>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MetadataCard;
