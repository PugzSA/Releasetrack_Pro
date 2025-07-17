import React, { useState, useEffect } from 'react';
import './Releases.css';
import { Button, Accordion, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import EditTicketModal from '../tickets/EditTicketModal';

const Releases = () => {
  const navigate = useNavigate();
  const { releases, loading, error, deleteRelease, supabase } = useApp();
  
  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [releaseToDelete, setReleaseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  
  // State for ticket edit modal
  const [showTicketEditModal, setShowTicketEditModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // State for ticket refresh operation
  const [refreshingTickets, setRefreshingTickets] = useState(false);
  const [refreshError, setRefreshError] = useState(null);
  
  // State for sorting
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' for ascending, 'desc' for descending
  
  // Toggle sort order between ascending and descending
  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };
  
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
    console.log(' handleTicketUpdate called with:', updatedTicket);
    if (!updatedTicket) return;
    
    try {
      // Set loading state
      setRefreshingTickets(true);
      setRefreshError(null);
      
      // Log the current state
      console.log(' Current state:');
      console.log(' - Using context releases:', releases && releases.length > 0);
      console.log(' - Using local releases:', localReleases && localReleases.length > 0);
      console.log(' - Supabase available:', !!supabase);
      
      // Find which release contains this ticket
      let releaseId = null;
      let releaseSource = null;
      
      // Check in context releases first
      if (releases && releases.length > 0) {
        console.log(' Searching in context releases...');
        const releaseWithTicket = releases.find(release => {
          const hasTicket = release.tickets && 
                          Array.isArray(release.tickets) && 
                          release.tickets.some(t => t.id === updatedTicket.id);
          if (hasTicket) {
            console.log(` Found ticket ${updatedTicket.id} in release ${release.id} (${release.name})`);
          }
          return hasTicket;
        });
        
        if (releaseWithTicket) {
          releaseId = releaseWithTicket.id;
          releaseSource = 'context';
          console.log(` Using release ID ${releaseId} from context`);
        } else {
          console.log(' Ticket not found in context releases');
        }
      }
      
      // If not found in context releases, check local releases
      if (!releaseId && localReleases && localReleases.length > 0) {
        console.log(' Searching in local releases...');
        const releaseWithTicket = localReleases.find(release => {
          const hasTicket = release.tickets && 
                          Array.isArray(release.tickets) && 
                          release.tickets.some(t => t.id === updatedTicket.id);
          if (hasTicket) {
            console.log(` Found ticket ${updatedTicket.id} in local release ${release.id} (${release.name})`);
          }
          return hasTicket;
        });
        
        if (releaseWithTicket) {
          releaseId = releaseWithTicket.id;
          releaseSource = 'local';
          console.log(` Using release ID ${releaseId} from local state`);
        } else {
          console.log(' Ticket not found in local releases');
        }
      }
      
      // If we found which release contains this ticket, fetch fresh data directly from Supabase
      if (releaseId && supabase) {
        console.log(` Fetching fresh data for release ID: ${releaseId}`);
        
        // First, get the release
        const { data: freshRelease, error: releaseError } = await supabase
          .from('releases')
          .select('*')
          .eq('id', releaseId)
          .single();
        
        console.log(' Release query result:', { freshRelease, releaseError });
        
        if (releaseError) {
          console.error(' Error fetching release:', releaseError);
          throw releaseError;
        }
        
        if (freshRelease) {
          // Get related tickets for this release
          const { data: freshTickets, error: ticketsError } = await supabase
            .from('tickets')
            .select('*')
            .eq('release_id', releaseId);
          
          console.log(' Tickets query result:', { 
            count: freshTickets?.length || 0, 
            error: ticketsError,
            ticketIds: freshTickets?.map(t => t.id) || []
          });
          
          if (ticketsError) {
            console.error(' Error fetching tickets:', ticketsError);
            throw ticketsError;
          }
          
          // Create a complete release object with tickets
          const completeRelease = {
            ...freshRelease,
            tickets: freshTickets || []
          };
          
          console.log(' Fresh release data fetched:', {
            id: completeRelease.id,
            name: completeRelease.name,
            ticketCount: completeRelease.tickets?.length || 0
          });
          
          // Check if our updated ticket is in the fresh data
          const updatedTicketInFreshData = completeRelease.tickets?.find(t => t.id === updatedTicket.id);
          console.log(' Updated ticket in fresh data:', updatedTicketInFreshData || 'Not found');
          
          // Update the appropriate releases array
          if (releaseSource === 'context' && releases && releases.length > 0) {
            console.log(' Updating context releases array');
            const updatedReleases = releases.map(release => 
              release.id === releaseId ? completeRelease : release
            );
            
            // Force a re-render with the updated data
            console.log(' Setting local releases from context update');
            setLocalReleases([...updatedReleases]);
          } else if (releaseSource === 'local' && localReleases && localReleases.length > 0) {
            console.log(' Updating local releases array');
            const updatedLocalReleases = localReleases.map(release => 
              release.id === releaseId ? completeRelease : release
            );
            
            // Force a re-render with the updated data
            console.log(' Setting local releases from local update');
            setLocalReleases([...updatedLocalReleases]);
          }
        }
      } else {
        // If we can't find which release contains this ticket or don't have supabase,
        // just update the local state as before
        console.log(' Falling back to local state update for ticket:', updatedTicket.id);
        console.log(' Reason:', !releaseId ? 'Release ID not found' : 'Supabase not available');
        
        // Determine which releases array to update
        const releasesToUpdate = releases && releases.length > 0 ? releases : localReleases;
        
        if (releasesToUpdate && releasesToUpdate.length > 0) {
          console.log(' Updating releases with local data');
          const updatedReleases = JSON.parse(JSON.stringify(releasesToUpdate));
          
          let ticketFound = false;
          updatedReleases.forEach(release => {
            if (release.tickets && Array.isArray(release.tickets)) {
              const ticketIndex = release.tickets.findIndex(t => t.id === updatedTicket.id);
              if (ticketIndex !== -1) {
                console.log(` Found ticket to update in release ${release.id}`);
                console.log(' Before update:', release.tickets[ticketIndex]);
                release.tickets[ticketIndex] = {...release.tickets[ticketIndex], ...updatedTicket};
                console.log(' After update:', release.tickets[ticketIndex]);
                ticketFound = true;
              }
            }
          });
          
          if (!ticketFound) {
            console.log(' Warning: Ticket not found in any release during local update');
          }
          
          // Force a re-render with the updated data
          console.log(' Setting local releases from fallback update');
          setLocalReleases([...updatedReleases]);
        } else {
          console.log(' No releases to update');
        }
      }
    } catch (err) {
      console.error(' Error refreshing release data after ticket update:', err);
      setRefreshError('Failed to refresh data after ticket update. Please reload the page.');
    } finally {
      setRefreshingTickets(false);
      console.log(' Ticket update process completed');
    }
  };
  
  // Local releases state that can be updated independently of context
  // Initialize with empty array, will be populated from context when available
  const [localReleases, setLocalReleases] = useState([]);
  
  // Initialize localReleases with context releases when they change
  useEffect(() => {
    if (releases && releases.length > 0) {
      console.log('Initializing local releases from context:', releases.length);
      setLocalReleases([...releases]);
    } else {
      // If no context releases, use fallback data
      setLocalReleases(fallbackReleases);
    }
  }, [releases]);
  
  // Fallback data in case no releases are loaded from context
  const fallbackReleases = [
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
          id: 101,
          title: 'Implement automated testing for API endpoints',
          description: 'Create automated test suite for all REST API endpoints',
          type: 'feature',
          priority: 'medium',
          status: 'in-progress'
        },
        {
          id: 102,
          title: 'Fix dashboard loading performance',
          description: 'Dashboard takes >3s to load on slower connections',
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
  ];

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

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="section-title mb-0">All Releases</h2>
        <Button 
          variant="outline-secondary" 
          className="sort-btn" 
          onClick={toggleSortOrder}
          title={sortOrder === 'asc' ? 'Sort by target date (oldest first)' : 'Sort by target date (newest first)'}
        >
          <i className={`bi bi-sort-${sortOrder === 'asc' ? 'up' : 'down'} me-1`}></i>
          <span>Sort by Target Date {sortOrder === 'asc' ? '(Oldest First)' : '(Newest First)'}</span>
        </Button>
      </div>

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
      ) : localReleases.length > 0 ? (
        <div className="releases-list">
          {/* Sort releases by target date based on sortOrder */}
          {[...localReleases]
            .sort((a, b) => {
              // Handle cases where target might be undefined or null
              if (!a.target) return 1;  // Move items without target to the bottom
              if (!b.target) return -1; // Move items without target to the bottom
              
              // Convert to Date objects for comparison
              const dateA = new Date(a.target);
              const dateB = new Date(b.target);
              
              // Sort based on the current sort order
              if (sortOrder === 'asc') {
                return dateA - dateB; // Ascending: oldest first
              } else {
                return dateB - dateA; // Descending: newest first
              }
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
                          {release.tickets.map(ticket => (
                            <div key={ticket.id} className="related-ticket-card">
                              <div className="ticket-header">
                                <h5 className="ticket-title">
                                  <a href="#" 
                                     onClick={(e) => {
                                       e.preventDefault();
                                       handleOpenTicketEditModal(ticket);
                                     }} 
                                     className="ticket-title-link"
                                  >
                                    {ticket.title}
                                  </a>
                                </h5>
                                <div className="ticket-badges">
                                  <span className={`status-badge ${ticket.type}`}>{ticket.type}</span>
                                  <span className={`status-badge ${ticket.priority}`}>{ticket.priority}</span>
                                </div>
                              </div>
                              
                              <div className="ticket-id">{ticket.id} • {ticket.date || (ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'No date')}</div>
                              
                              <div className="ticket-details mt-3">
                                <div className="ticket-assignee">
                                  <i className="bi bi-person"></i> {ticket.assignee || 'Unassigned'}
                                </div>
                                <div className="ticket-support-area">
                                  <i className="bi bi-headset"></i> {ticket.supportArea || 'Not specified'}
                                </div>
                              </div>

                              {ticket.description && (
                                <div className="ticket-detail mt-3">
                                  <h6><i className="bi bi-card-text me-2"></i>Description:</h6>
                                  <p>{ticket.description}</p>
                                </div>
                              )}
                              
                              <div className="ticket-actions">
                                <span className={`status-badge ${ticket.status}`}>{ticket.status}</span>
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  onClick={() => handleOpenTicketEditModal(ticket)}
                                >
                                  <i className="bi bi-pencil"></i>
                                </Button>
                              </div>
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
      
      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this release?</p>
          <p><strong>This action cannot be undone.</strong></p>
          {deleteError && (
            <div className="alert alert-danger mt-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {deleteError}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleteLoading}>
            {deleteLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Ticket refresh notification */}
      {refreshingTickets && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header">
              <div className="spinner-border spinner-border-sm me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <strong className="me-auto">Refreshing Data</strong>
              <small>Just now</small>
            </div>
            <div className="toast-body">
              Fetching the latest ticket information...
            </div>
          </div>
        </div>
      )}
      
      {/* Error notification */}
      {refreshError && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <div className="toast show bg-danger text-white" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header bg-danger text-white">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <strong className="me-auto">Error</strong>
              <button type="button" className="btn-close" onClick={() => setRefreshError(null)}></button>
            </div>
            <div className="toast-body">
              {refreshError}
            </div>
          </div>
        </div>
      )}
      
      {/* Ticket Edit Modal */}
      {selectedTicket && (
        <EditTicketModal
          show={showTicketEditModal}
          handleClose={handleCloseTicketEditModal}
          ticket={selectedTicket}
          onTicketUpdate={handleTicketUpdate}
        />
      )}
    </div>
  );
};

export default Releases;
