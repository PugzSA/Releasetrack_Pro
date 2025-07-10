import React, { useState, useEffect } from 'react';
import { Button, Accordion, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import './Releases.css';

const Releases = () => {
  const navigate = useNavigate();
  const { releases, loading, error, deleteRelease } = useAppContext();
  
  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [releaseToDelete, setReleaseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  
  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!releaseToDelete) return;
    
    setDeleteLoading(true);
    setDeleteError(null);
    
    try {
      await deleteRelease(releaseToDelete.id);
      setShowDeleteModal(false);
      setReleaseToDelete(null);
    } catch (err) {
      console.error('Error deleting release:', err);
      setDeleteError(err.message || 'Failed to delete release. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };
  
  // Fallback data in case no releases are loaded from context
  const [localReleases] = useState([
    {
      id: 1,
      name: 'February 2024 Release',
      version: 'v1.0',
      target: 'Feb 28, 2024',
      status: 'testing',
      description: 'Focus on automation workflow and integration improvements',
      stakeholderSummary: 'Streamlining internal processes with automated workflows, reducing manual work by 40%',
      tickets: [
        {
          id: 'SUP-00001',
          title: 'Email not sending',
          type: 'bug',
          priority: 'high',
          status: 'open'
        }
      ]
    },
    {
      id: 2,
      name: 'January 2024 Release',
      version: 'v1.0',
      target: 'Jan 31, 2024',
      status: 'development',
      description: 'Monthly release including customer portal enhancements and bug fixes',
      stakeholderSummary: 'This release will improve customer experience with new self-service capabilities and resolve 12 critical bugs reported by users',
      tickets: []
    }
  ]);

  return (
    <div className="releases-container">
      <div className="page-header">
        <div>
          <h1>Release Management</h1>
          <p className="page-subtitle">Manage your deployment cycles and track progress</p>
        </div>
        <Link to="/releases/new" className="btn btn-primary">
          <i className="bi bi-plus"></i> New Release
        </Link>
      </div>

      <h2 className="section-title">All Releases</h2>

      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading releases...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      ) : (releases && releases.length > 0) || localReleases.length > 0 ? (
        <div className="releases-list">
          {/* Sort releases by target date in descending order */}
          {(releases && releases.length > 0 ? [...releases] : [...localReleases])
            .sort((a, b) => {
              // Handle cases where target might be undefined or null
              if (!a.target) return 1;  // Move items without target to the bottom
              if (!b.target) return -1; // Move items without target to the bottom
              
              // Convert to Date objects for comparison
              const dateA = new Date(a.target);
              const dateB = new Date(b.target);
              
              // Sort in descending order (newest first)
              return dateB - dateA;
            })
            .map((release) => (
          <div key={release.id} className="release-card">
            <div className="release-header">
              <div>
                <h3 className="release-name">{release.name || 'Untitled Release'}</h3>
                <span className="release-version">{release.version || ''}</span>
              </div>
              <span className={`status-badge ${release.status || 'unknown'}`}>{release.status || 'Unknown'}</span>
            </div>

            <div className="release-target">
              <i className="bi bi-calendar"></i> Target: {release.target || 'Not set'}
            </div>

            <div className="release-description">
              {release.description || 'No description provided'}
            </div>

            <div className="stakeholder-summary">
              <h5>Stakeholder Summary:</h5>
              <p>{release.stakeholder_summary || release.stakeholderSummary || 'No stakeholder summary provided'}</p>
            </div>

            <Accordion className="mt-3">
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  <i className="bi bi-ticket me-2"></i> Related Tickets ({release.tickets ? release.tickets.length : 0})
                </Accordion.Header>
                <Accordion.Body>
                  {release.tickets && release.tickets.length > 0 ? (
                    <div className="related-tickets">
                      <h5>Tickets in Release</h5>
                      {release.tickets && release.tickets.map(ticket => (
                        <div key={ticket.id} className="related-ticket-item">
                          <div className="ticket-badges">
                            <span className={`status-badge ${ticket.type}`}>{ticket.type}</span>
                            <span className={`status-badge ${ticket.priority}`}>{ticket.priority}</span>
                          </div>
                          <div className="ticket-title">
                            {ticket.title}
                          </div>
                          <div className="ticket-id">
                            {ticket.id}
                          </div>
                          <span className={`status-badge ${ticket.status}`}>{ticket.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-tickets">
                      <p>No tickets associated with this release</p>
                    </div>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>

            <div className="release-actions">
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => navigate(`/releases/edit/${release.id}`)}
              >
                <i className="bi bi-pencil"></i>
              </Button>
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={() => {
                  setReleaseToDelete(release);
                  setShowDeleteModal(true);
                }}
              >
                <i className="bi bi-trash"></i>
              </Button>
            </div>
          </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-5">
          <i className="bi bi-inbox-fill" style={{ fontSize: '3rem', color: '#ccc' }}></i>
          <p className="mt-3">No releases found. Click "New Release" to create one.</p>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteError && (
            <div className="alert alert-danger">{deleteError}</div>
          )}
          <p>Are you sure you want to delete the release: <strong>{releaseToDelete?.name}</strong>?</p>
          <p className="text-danger">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteConfirm}
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Releases;
