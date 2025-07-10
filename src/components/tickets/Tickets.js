import React, { useState, useEffect } from 'react';
import './Tickets.css';
import { Tab, Nav, Button, Form, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import EditTicketModal from './EditTicketModal';
import DeleteTicketModal from './DeleteTicketModal';

const Tickets = () => {
  const navigate = useNavigate();
  const { tickets: contextTickets, releases, loading, error } = useAppContext();
  const [activeTab, setActiveTab] = useState('all');
  
  // State for filters
  const [filters, setFilters] = useState({
    status: 'All Status',
    type: 'All Types',
    priority: 'All Priority',
    supportArea: 'All Support Areas',
    release: 'All Releases',  // This special value indicates no filter
    requester: 'All Requesters',
    assignee: 'All Assignees'
  });
  
  // State for unique requesters and assignees
  const [requesters, setRequesters] = useState([]);
  const [assignees, setAssignees] = useState([]);
  
  // State for edit and delete modals
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Fallback data in case no tickets are loaded from context
  const [localTickets] = useState([
    {
      id: 'SUP-00001',
      title: 'Email not sending',
      date: 'Jul 8, 2023',
      status: 'Backlog',
      priority: 'High',
      type: 'Issue',
      assignee: 'Kyle',
      release: 'February 2024 Release',
      businessImpact: 'Very big impact on business'
    }
  ]);

  // Handle closing the edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedTicket(null);
  };

  // Handle closing the delete modal
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedTicket(null);
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Helper function to get release name from release_id
  const getReleaseName = (releaseId) => {
    if (!releaseId) return 'None';
    
    const releaseObj = releases.find(r => r.id === parseInt(releaseId));
    if (!releaseObj) return 'Unknown';
    
    return `${releaseObj.name}${releaseObj.version ? ` (${releaseObj.version})` : ''}`;
  };

  // Helper function to get assignee name
  const getAssigneeName = (ticket) => {
    if (ticket.assignee) return ticket.assignee;
    if (ticket.assignee_id) {
      // In a real implementation, we would fetch the user details here
      // or have them available in a users state variable
      return `User ID: ${ticket.assignee_id}`;
    }
    return 'Unassigned';
  };
  
  // Helper function to get requester name
  const getRequesterName = (ticket) => {
    if (ticket.requester) return ticket.requester;
    if (ticket.requester_id) {
      // In a real implementation, we would fetch the user details here
      // or have them available in a users state variable
      return `User ID: ${ticket.requester_id}`;
    }
    return 'Not specified';
  };

  // Extract unique requesters and assignees when tickets data changes
  useEffect(() => {
    if (contextTickets && contextTickets.length > 0) {
      // Get unique requesters
      const uniqueRequesters = Array.from(new Set(
        contextTickets.map(ticket => getRequesterName(ticket))
      )).filter(requester => requester !== 'Not specified');
      setRequesters(uniqueRequesters);
      
      // Get unique assignees
      const uniqueAssignees = Array.from(new Set(
        contextTickets.map(ticket => getAssigneeName(ticket))
      )).filter(assignee => assignee !== 'Unassigned');
      setAssignees(uniqueAssignees);
    }
  }, [contextTickets]);

  // Apply filters to tickets
  const applyFilters = (tickets) => {
    return tickets.filter(ticket => {
      // Status filter
      if (filters.status !== 'All Status' && ticket.status !== filters.status) {
        return false;
      }
      
      // Type filter
      if (filters.type !== 'All Types' && ticket.type !== filters.type) {
        return false;
      }
      
      // Priority filter
      if (filters.priority !== 'All Priority' && ticket.priority !== filters.priority) {
        return false;
      }
      
      // Support Area filter
      if (filters.supportArea !== 'All Support Areas' && ticket.supportArea !== filters.supportArea) {
        return false;
      }
      
      // Release filter
      if (filters.release !== 'All Releases') {
        // Filter by release_id (which is now stored as a number in the database)
        if (ticket.release_id !== parseInt(filters.release)) {
          return false;
        }
      }
      
      // Requester filter
      if (filters.requester !== 'All Requesters') {
        const ticketRequester = getRequesterName(ticket);
        if (ticketRequester !== filters.requester) {
          return false;
        }
      }
      
      // Assignee filter
      if (filters.assignee !== 'All Assignees') {
        const ticketAssignee = getAssigneeName(ticket);
        if (ticketAssignee !== filters.assignee) {
          return false;
        }
      }
      
      return true;
    });
  };

  return (
    <div className="tickets-container">
      <div className="page-header">
        <div>
          <h1>Ticket Management</h1>
          <p className="page-subtitle">Track enhancements, bugs, and feature requests</p>
        </div>
        <Link to="/tickets/new" className="btn btn-primary">
          <i className="bi bi-plus"></i> New Ticket
        </Link>
      </div>

      <div className="card">
        <div className="card-body">
          <Tab.Container id="tickets-tabs" defaultActiveKey="all">
            <Nav variant="tabs" className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="all">All ({(contextTickets && contextTickets.length) || localTickets.length})</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="open">In Development ({((contextTickets && contextTickets.filter(t => t.status === 'In Development').length) || localTickets.filter(t => t.status === 'In Development').length)})</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="completed">Released ({((contextTickets && contextTickets.filter(t => t.status === 'Released').length) || localTickets.filter(t => t.status === 'Released').length)})</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="unassigned">Unassigned ({((contextTickets && contextTickets.filter(t => !t.assignee).length) || localTickets.filter(t => !t.assignee).length)})</Nav.Link>
              </Nav.Item>
            </Nav>

            <div className="filter-section mb-4">
              <div className="d-flex align-items-center">
                <i className="bi bi-funnel me-2"></i>
                <span>Filters:</span>
              </div>
              <div className="filter-options">
                <Form.Select 
                  className="filter-select" 
                  name="status" 
                  value={filters.status} 
                  onChange={handleFilterChange}
                >
                  <option value="All Status">All Status</option>
                  <option value="Backlog">Backlog</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Requirements Gathering">Requirements Gathering</option>
                  <option value="In Technical Design">In Technical Design</option>
                  <option value="In Development">In Development</option>
                  <option value="Blocked - User">Blocked - User</option>
                  <option value="Blocked - Dev">Blocked - Dev</option>
                  <option value="In Testing - Dev">In Testing - Dev</option>
                  <option value="In Testing - UAT">In Testing - UAT</option>
                  <option value="Ready For Release">Ready For Release</option>
                  <option value="Released">Released</option>
                </Form.Select>

                <Form.Select 
                  className="filter-select" 
                  name="type" 
                  value={filters.type} 
                  onChange={handleFilterChange}
                >
                  <option value="All Types">All Types</option>
                  <option value="Enhancement">Enhancement</option>
                  <option value="Issue">Issue</option>
                  <option value="New Feature">New Feature</option>
                  <option value="Request">Request</option>
                </Form.Select>

                <Form.Select 
                  className="filter-select" 
                  name="priority" 
                  value={filters.priority} 
                  onChange={handleFilterChange}
                >
                  <option value="All Priority">All Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Form.Select>

                <Form.Select 
                  className="filter-select" 
                  name="supportArea" 
                  value={filters.supportArea} 
                  onChange={handleFilterChange}
                >
                  <option value="All Support Areas">All Support Areas</option>
                  <option value="CRM">CRM</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Marketing">Marketing</option>
                </Form.Select>

                <Form.Select 
                  className="filter-select" 
                  name="requester" 
                  value={filters.requester} 
                  onChange={handleFilterChange}
                >
                  <option value="All Requesters">All Requesters</option>
                  {requesters.map(requester => (
                    <option key={requester} value={requester}>
                      {requester}
                    </option>
                  ))}
                </Form.Select>

                <Form.Select 
                  className="filter-select" 
                  name="assignee" 
                  value={filters.assignee} 
                  onChange={handleFilterChange}
                >
                  <option value="All Assignees">All Assignees</option>
                  {assignees.map(assignee => (
                    <option key={assignee} value={assignee}>
                      {assignee}
                    </option>
                  ))}
                </Form.Select>

                <Form.Select 
                  className="filter-select" 
                  name="release" 
                  value={filters.release} 
                  onChange={handleFilterChange}
                >
                  <option value="All Releases">All Releases</option>
                  {releases && releases.map(release => (
                    <option key={release.id} value={release.id}>
                      {release.name} {release.version ? `(${release.version})` : ''}
                    </option>
                  ))}
                </Form.Select>
              </div>
              <div className="filter-actions">
                <Button 
                  variant="outline-secondary" 
                  className="reset-filters-btn" 
                  onClick={() => setFilters({
                    status: 'All Status',
                    type: 'All Types',
                    priority: 'All Priority',
                    supportArea: 'All Support Areas',
                    release: 'All Releases',
                    requester: 'All Requesters',
                    assignee: 'All Assignees'
                  })}
                  disabled={!Object.values(filters).some(f => !f.includes('All'))}
                >
                  <i className="bi bi-arrow-counterclockwise me-1"></i> Reset Filters
                </Button>
              </div>
            </div>

            <Tab.Content>
              <Tab.Pane eventKey="all">
                {loading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading tickets...</p>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                ) : (contextTickets && contextTickets.length > 0) || localTickets.length > 0 ? (
                  <div className="tickets-list">
                    {applyFilters(contextTickets && contextTickets.length > 0 ? contextTickets : localTickets).map(ticket => (
                    <div key={ticket.id} className="ticket-item">
                      <div className="ticket-header">
                        <h5 className="ticket-title">{ticket.title}</h5>
                        <div className="ticket-badges">
                          <span className="status-badge bug">{ticket.type}</span>
                          <span className="status-badge high">{ticket.priority}</span>
                        </div>
                      </div>
                      <div className="ticket-id">{ticket.id} • {ticket.date || new Date(ticket.created_at).toLocaleDateString()}</div>
                      
                      <div className="ticket-details mt-3">
        <div className="ticket-requester">
          <i className="bi bi-person-circle"></i> Requester: {getRequesterName(ticket)}
        </div>
        <div className="ticket-assignee">
          <i className="bi bi-person"></i> Assignee: {ticket.assignee || 'Unassigned'}
        </div>
                        <div className="ticket-support-area">
                          <i className="bi bi-headset"></i> Support Area: {ticket.supportArea || 'Not specified'}
                        </div>
                        <div className="ticket-release">
                          <i className="bi bi-box"></i> Release: {getReleaseName(ticket.release_id)}
                        </div>
                      </div>

                      <div className="ticket-detail mt-3">
                        <h6><i className="bi bi-card-text me-2"></i>Description:</h6>
                        <p>{ticket.description || 'No details provided'}</p>
                      </div>

                      {ticket.testNotes && ticket.testNotes.trim() !== '' && (
                        <div className="ticket-test-notes mt-3">
                          <h6><i className="bi bi-clipboard-check me-2"></i>Test Notes:</h6>
                          <p>{ticket.testNotes}</p>
                        </div>
                      )}

                      <div className="ticket-actions">
                        <span className={`status-badge ${(ticket.status?.toLowerCase() || 'open').replace(/\s+/g, '-')}`}>{ticket.status || 'Open'}</span>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-link"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setShowEditModal(true);
                            }}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="btn btn-link text-danger"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setShowDeleteModal(true);
                            }}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                ) : (
                  <div className="empty-state">
                    <i className="bi bi-inbox-fill"></i>
                    <p>No tickets found{Object.values(filters).some(f => !f.includes('All')) ? ' matching the selected filters' : ''}.</p>
                    {Object.values(filters).some(f => !f.includes('All')) ? (
                      <button className="btn btn-outline-secondary mt-2" onClick={() => setFilters({
                        status: 'All Status',
                        type: 'All Types',
                        priority: 'All Priority',
                        supportArea: 'All Support Areas',
                        release: 'All Releases'
                      })}>
                        <i className="bi bi-x-circle me-1"></i> Clear Filters
                      </button>
                    ) : (
                      <p className="mt-2">Click "New Ticket" to create one.</p>
                    )}
                  </div>
                )}
              </Tab.Pane>
              <Tab.Pane eventKey="open">
                {loading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (contextTickets && contextTickets.filter(t => t.status === 'In Development').length > 0) || localTickets.filter(t => t.status === 'In Development').length > 0 ? (
                  <div className="tickets-list">
                    {applyFilters(((contextTickets && contextTickets.length > 0) ? contextTickets : localTickets).filter(t => t.status === 'In Development')).map(ticket => (
                    <div key={ticket.id} className="ticket-item">
                      <div className="ticket-header">
                        <h5 className="ticket-title">{ticket.title}</h5>
                        <div className="ticket-badges">
                          <span className="status-badge bug">{ticket.type}</span>
                          <span className="status-badge high">{ticket.priority}</span>
                        </div>
                      </div>
                      <div className="ticket-id">{ticket.id} • {ticket.date || new Date(ticket.created_at).toLocaleDateString()}</div>
                      
                      <div className="ticket-details mt-3">
        <div className="ticket-requester">
          <i className="bi bi-person-circle"></i> Requester: {getRequesterName(ticket)}
        </div>
        <div className="ticket-assignee">
          <i className="bi bi-person"></i> Assignee: {ticket.assignee || 'Unassigned'}
        </div>
                        <div className="ticket-support-area">
                          <i className="bi bi-headset"></i> Support Area: {ticket.supportArea || 'Not specified'}
                        </div>
                        <div className="ticket-release">
                          <i className="bi bi-box"></i> Release: {getReleaseName(ticket.release_id)}
                        </div>
                      </div>

                      <div className="ticket-detail mt-3">
                        <h6><i className="bi bi-card-text me-2"></i>Description:</h6>
                        <p>{ticket.description || 'No details provided'}</p>
                      </div>

                      {ticket.testNotes && ticket.testNotes.trim() !== '' && (
                        <div className="ticket-test-notes mt-3">
                          <h6><i className="bi bi-clipboard-check me-2"></i>Test Notes:</h6>
                          <p>{ticket.testNotes}</p>
                        </div>
                      )}

                      <div className="ticket-actions">
                        <span className={`status-badge ${(ticket.status?.toLowerCase() || 'open').replace(/\s+/g, '-')}`}>{ticket.status || 'Open'}</span>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-link"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setShowEditModal(true);
                            }}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="btn btn-link text-danger"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setShowDeleteModal(true);
                            }}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                ) : (
                  <div className="empty-state">
                    <i className="bi bi-inbox-fill"></i>
                    <p>No in-development tickets{Object.values(filters).some(f => !f.includes('All')) ? ' matching the selected filters' : ''}.</p>
                    {Object.values(filters).some(f => !f.includes('All')) && (
                      <button className="btn btn-outline-secondary mt-2" onClick={() => setFilters({
                        status: 'All Status',
                        type: 'All Types',
                        priority: 'All Priority',
                        supportArea: 'All Support Areas',
                        release: 'All Releases'
                      })}>
                        <i className="bi bi-x-circle me-1"></i> Clear Filters
                      </button>
                    )}
                  </div>
                )}
              </Tab.Pane>
              <Tab.Pane eventKey="completed">
                {loading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (contextTickets && contextTickets.filter(t => t.status === 'Released').length > 0) || localTickets.filter(t => t.status === 'Released').length > 0 ? (
                  <div className="tickets-list">
                    {applyFilters(((contextTickets && contextTickets.length > 0) ? contextTickets : localTickets).filter(t => t.status === 'Released')).map(ticket => (
                      <div key={ticket.id} className="ticket-item">
                        <div className="ticket-header">
                          <h5 className="ticket-title">{ticket.title}</h5>
                          <div className="ticket-badges">
                            <span className="status-badge bug">{ticket.type}</span>
                            <span className="status-badge high">{ticket.priority}</span>
                          </div>
                        </div>
                        <div className="ticket-id">{ticket.id} • {ticket.date || new Date(ticket.created_at).toLocaleDateString()}</div>
                        <div className="ticket-details mt-3">
        <div className="ticket-requester">
          <i className="bi bi-person-circle"></i> Requester: {getRequesterName(ticket)}
        </div>
        <div className="ticket-assignee">
          <i className="bi bi-person"></i> Assignee: {ticket.assignee || (ticket.assignee_id ? 'Loading...' : 'Unassigned')}
        </div>
                          <div className="ticket-support-area">
                            <i className="bi bi-headset"></i> Support Area: {ticket.supportArea || 'Not specified'}
                          </div>
                          <div className="ticket-release">
                            <i className="bi bi-box"></i> Release: {getReleaseName(ticket.release_id)}
                          </div>
                        </div>
                        <div className="ticket-detail mt-3">
                          <h6><i className="bi bi-card-text me-2"></i>Description:</h6>
                          <p>{ticket.description || 'No details provided'}</p>
                        </div>

                        {ticket.testNotes && ticket.testNotes.trim() !== '' && (
                          <div className="ticket-test-notes mt-3">
                            <h6><i className="bi bi-clipboard-check me-2"></i>Test Notes:</h6>
                            <p>{ticket.testNotes}</p>
                          </div>
                        )}

                        <div className="ticket-actions">
                          <span className={`status-badge ${(ticket.status?.toLowerCase() || 'released').replace(/\s+/g, '-')}`}>{ticket.status || 'Released'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <i className="bi bi-check-circle"></i>
                    <p>No released tickets{Object.values(filters).some(f => !f.includes('All')) ? ' matching the selected filters' : ''}</p>
                    {Object.values(filters).some(f => !f.includes('All')) && (
                      <button className="btn btn-outline-secondary mt-2" onClick={() => setFilters({
                        status: 'All Status',
                        type: 'All Types',
                        priority: 'All Priority',
                        supportArea: 'All Support Areas',
                        release: 'All Releases'
                      })}>
                        <i className="bi bi-x-circle me-1"></i> Clear Filters
                      </button>
                    )}
                  </div>
                )}
              </Tab.Pane>
              <Tab.Pane eventKey="unassigned">
                {loading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (contextTickets && contextTickets.filter(t => !t.assignee && !t.assignee_id).length > 0) || localTickets.filter(t => !t.assignee && !t.assignee_id).length > 0 ? (
                  <div className="tickets-list">
                    {applyFilters(((contextTickets && contextTickets.length > 0) ? contextTickets : localTickets).filter(t => !t.assignee && !t.assignee_id)).map(ticket => (
                      <div key={ticket.id} className="ticket-item">
                        <div className="ticket-header">
                          <h5 className="ticket-title">{ticket.title}</h5>
                          <div className="ticket-badges">
                            <span className="status-badge bug">{ticket.type}</span>
                            <span className="status-badge high">{ticket.priority}</span>
                          </div>
                        </div>
                        <div className="ticket-id">{ticket.id} • {ticket.date || new Date(ticket.created_at).toLocaleDateString()}</div>
                        <div className="ticket-details mt-3">
                          <div className="ticket-assignee">
                            <i className="bi bi-person"></i> Requester: Unassigned
                          </div>
                          <div className="ticket-support-area">
                            <i className="bi bi-headset"></i> Support Area: {ticket.supportArea || 'Not specified'}
                          </div>
                          <div className="ticket-release">
                            <i className="bi bi-box"></i> Release: {getReleaseName(ticket.release_id)}
                          </div>
                        </div>
                        <div className="ticket-detail mt-3">
                          <h6><i className="bi bi-card-text me-2"></i>Description:</h6>
                          <p>{ticket.description || 'No details provided'}</p>
                        </div>

                        {ticket.testNotes && ticket.testNotes.trim() !== '' && (
                          <div className="ticket-test-notes mt-3">
                            <h6><i className="bi bi-clipboard-check me-2"></i>Test Notes:</h6>
                            <p>{ticket.testNotes}</p>
                          </div>
                        )}

                        <div className="ticket-actions">
                          <span className={`status-badge ${(ticket.status?.toLowerCase() || 'open').replace(/\s+/g, '-')}`}>{ticket.status || 'Open'}</span>
                          <div className="action-buttons">
                            <button 
                              className="btn btn-link"
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setShowEditModal(true);
                              }}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button 
                              className="btn btn-link text-danger"
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setShowDeleteModal(true);
                              }}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <i className="bi bi-person-x"></i>
                    <p>No unassigned tickets{Object.values(filters).some(f => !f.includes('All')) ? ' matching the selected filters' : ''}</p>
                    {Object.values(filters).some(f => !f.includes('All')) && (
                      <button className="btn btn-outline-secondary mt-2" onClick={() => setFilters({
                        status: 'All Status',
                        type: 'All Types',
                        priority: 'All Priority',
                        supportArea: 'All Support Areas',
                        release: 'All Releases'
                      })}>
                        <i className="bi bi-x-circle me-1"></i> Clear Filters
                      </button>
                    )}
                  </div>
                )}
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </div>
      </div>

      {/* Edit Modal */}
      {selectedTicket && (
        <EditTicketModal
          show={showEditModal}
          handleClose={handleCloseEditModal}
          ticket={selectedTicket}
        />
      )}

      {/* Delete Modal */}
      {selectedTicket && (
        <DeleteTicketModal
          show={showDeleteModal}
          handleClose={handleCloseDeleteModal}
          ticket={selectedTicket}
        />
      )}
    </div>
  );
};

export default Tickets;
