import React from 'react';
import { Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import './MetadataCard.css';

const MetadataCard = ({ metadataItem, onDeleteClick }) => {
  const navigate = useNavigate();
  const { tickets, releases } = useAppContext();

  const getTicketInfo = (ticketId) => {
    if (!ticketId) return { id: 'None', title: '' };
    const ticket = tickets.find(t => t.id === ticketId);
    return ticket ? { id: ticket.id, title: ticket.title || 'No Title' } : { id: ticketId, title: 'Unknown Ticket' };
  };

  const getReleaseName = (releaseId) => {
    if (!releaseId) return 'None';
    const releaseObj = releases.find(r => r.id === parseInt(releaseId));
    return releaseObj ? releaseObj.name : 'Unknown';
  };

  return (
    <div className="metadata-card">
      <div className="metadata-card-header">
        <h5 className="metadata-card-title">{metadataItem.name}</h5>
        <div className="metadata-card-badges">
          <span className={`status-badge ${metadataItem.type?.replace(/\s+/g, '-').toLowerCase()}`}>{metadataItem.type}</span>
          <span className={`status-badge ${metadataItem.action?.toLowerCase()}`}>{metadataItem.action}</span>
        </div>
      </div>

      <div className="metadata-card-details-row">
        <div className="metadata-card-detail-item">
          <i className="bi bi-ticket-perforated"></i> Ticket: {
            metadataItem.ticket_id ? 
              `${getTicketInfo(metadataItem.ticket_id).id} - ${getTicketInfo(metadataItem.ticket_id).title}` : 
              'None'
          }
        </div>
        <span className="metadata-card-divider">|</span>
        <div className="metadata-card-detail-item">
          <i className="bi bi-box"></i> Release: {getReleaseName(metadataItem.release_id)}
        </div>
        <span className="metadata-card-divider">|</span>
        <div className="metadata-card-detail-item">
          <i className="bi bi-calendar3"></i> Created Date: {metadataItem.created_at ? new Date(metadataItem.created_at).toLocaleDateString() : 'Unknown'}
        </div>
      </div>

      <div className="metadata-card-section">
        <h6><i className="bi bi-card-text me-2"></i>Description:</h6>
        <p>{metadataItem.description || 'No details provided'}</p>
      </div>

      <div className="metadata-card-footer">
        <span className={`status-badge ${metadataItem.object?.toLowerCase()}`}>{metadataItem.object || 'No Object'}</span>
        <div className="action-buttons">
          <Button 
            variant="link" 
            className="btn-icon"
            onClick={() => navigate(`/metadata/edit/${metadataItem.id}`)}
          >
            <i className="bi bi-pencil"></i>
          </Button>
          <Button 
            variant="link" 
            className="btn-icon text-danger"
            onClick={() => onDeleteClick(metadataItem)}
          >
            <i className="bi bi-trash"></i>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MetadataCard;
