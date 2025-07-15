import React, { useState, useEffect } from 'react';
import './Tickets.css';
import { Button, Form, InputGroup, Accordion, Dropdown, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import EditTicketModal from './EditTicketModal';
import DeleteTicketModal from './DeleteTicketModal';

const Tickets = () => {
  const navigate = useNavigate();
  const { 
    tickets: contextTickets, 
    releases, 
    loading, 
    error, 
    supabase,
    savedFilters,
    addSavedFilter,
    updateSavedFilter,
    deleteSavedFilter,
    getSavedFilters
  } = useAppContext();
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
  
  // State for sorting
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' for ascending, 'desc' for descending
  
  // State for unique requesters and assignees
  const [requesters, setRequesters] = useState([]);
  const [assignees, setAssignees] = useState([]);
  
  // We don't need a separate filteredTickets state as we'll filter directly in the render
  
  // State for edit and delete modals
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // State for save filter modal
  const [showSaveFilterModal, setShowSaveFilterModal] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [saveFilterLoading, setSaveFilterLoading] = useState(false);
  const [saveFilterError, setSaveFilterError] = useState(null);
  const [selectedSavedFilter, setSelectedSavedFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fallback data in case no tickets are loaded from context - only used if contextTickets is null
  const [localTickets] = useState([
    {
      id: 'SUP-00010',
      id_display: 'SUP-00010',
      title: 'Entitlements for Key Accounts',
      description: 'When a account Entitlement/SLA field is updated to Key Account then an entitlement needs to be generated for the account.',
      type: 'Feature',
      priority: 'High',
      status: 'In Development',
      release_id: 1,
      date: '09/07/2025',
      requester: 'Kyle Cockcroft',
      assignee: 'Bob Burger',
      supportArea: 'CRM',
      testNotes: 'This needs to be tested manually end to end'
    }
  ]);
  
  // State for related metadata
  const [ticketMetadata, setTicketMetadata] = useState({});
  const [loadingMetadata, setLoadingMetadata] = useState({});
  
  // Effect to fetch metadata for all tickets when component mounts
  useEffect(() => {
    if (supabase) {
      fetchAllTicketsMetadata();
      // Fetch ticket-specific saved filters
      getSavedFilters('tickets');
    }
  }, [supabase]);
  
  // We no longer need to initialize filteredTickets since we're using getFilteredTickets function
  // directly in the render
  
  // Also fetch metadata when tickets change
  useEffect(() => {
    if (supabase && (contextTickets?.length > 0 || localTickets?.length > 0)) {
      fetchAllTicketsMetadata();
    }
  }, [contextTickets, localTickets]);

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
  
  // Toggle sort order between ascending and descending
  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };
  
  // Save current filter settings
  const handleSaveFilter = async () => {
    if (!filterName.trim()) {
      setSaveFilterError('Please enter a filter name');
      return;
    }
    
    setSaveFilterLoading(true);
    setSaveFilterError(null);
    
    try {
      console.log('=== SAVING FILTER ===');
      console.log('Current filters state:', filters);
      console.log('Current sortOrder:', sortOrder);
      
      const filterData = {
        name: filterName.trim(),
        filter_type: 'tickets',
        filter_criteria: JSON.stringify({
          filters,
          sortOrder
        })
      };
      
      console.log('Saving filter data:', filterData);
      await addSavedFilter(filterData);
      setShowSaveFilterModal(false);
      setFilterName('');
    } catch (err) {
      console.error('Error saving filter:', err);
      setSaveFilterError(err.message || 'Failed to save filter. Please try again.');
    } finally {
      setSaveFilterLoading(false);
    }
  };
  
  // Apply a saved filter
  const applyFilter = (filter) => {
    try {
      console.log('=== APPLYING FILTER ===');
      console.log('Filter to apply:', filter);
      
      const criteria = JSON.parse(filter.filter_criteria);
      console.log('Parsed criteria:', criteria);
      
      setFilters(criteria.filters || {
        status: 'All Status',
        type: 'All Types',
        priority: 'All Priority',
        supportArea: 'All Support Areas',
        release: 'All Releases'
      });
      setSortOrder(criteria.sortOrder || 'desc');
      setSearchQuery(criteria.searchQuery || '');
      setSelectedSavedFilter(filter);
    } catch (err) {
      console.error('Error applying filter:', err);
    }
  };
  
  // Delete a saved filter
  const handleDeleteFilter = async (filterId, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    try {
      await deleteSavedFilter(filterId);
      if (selectedSavedFilter && selectedSavedFilter.id === filterId) {
        setSelectedSavedFilter(null);
      }
    } catch (err) {
      console.error('Error deleting filter:', err);
    }
  };
  
  // Helper function to get release name from release_id
  const getReleaseName = (releaseId) => {
    if (!releaseId) return 'None';
    
    const releaseObj = releases.find(r => r.id === parseInt(releaseId));
    if (!releaseObj) return 'Unknown';
    
    // Return only the release name without the version
    return releaseObj.name;
  };
  
  // Helper function to get metadata count for a ticket
  const getMetadataCount = (ticketId) => {
    if (!ticketMetadata[ticketId]) return 0;
    return Array.isArray(ticketMetadata[ticketId]) ? ticketMetadata[ticketId].length : 0;
  };
  
  // Function to fetch all metadata for all tickets at once
  const fetchAllTicketsMetadata = async () => {
    if (!supabase) {
      console.log('Cannot fetch metadata: Supabase client not available');
      return;
    }
    
    const ticketsToProcess = contextTickets && contextTickets.length > 0 ? contextTickets : localTickets;
    if (!ticketsToProcess || !ticketsToProcess.length) {
      console.log('Cannot fetch metadata: No tickets available');
      return;
    }
    
    console.log('Fetching metadata for all tickets...', { ticketCount: ticketsToProcess.length });
    
    try {
      // Show loading state for all tickets
      const loadingState = {};
      ticketsToProcess.forEach(ticket => {
        loadingState[ticket.id] = true;
      });
      setLoadingMetadata(loadingState);
      
      // Get all metadata items
      const { data: allMetadata, error } = await supabase
        .from('metadata')
        .select('*');
      
      if (error) throw error;
      
      console.log('Fetched metadata:', allMetadata);
      
      // Group metadata by ticket_id
      const metadataByTicket = {};
      ticketsToProcess.forEach(ticket => {
        // Initialize with empty array for all tickets
        metadataByTicket[ticket.id] = [];
      });
      
      // Populate with actual metadata
      if (allMetadata && allMetadata.length > 0) {
        allMetadata.forEach(item => {
          if (item.ticket_id && metadataByTicket[item.ticket_id] !== undefined) {
            metadataByTicket[item.ticket_id].push(item);
          }
        });
      }
      
      // Update state with all metadata
      setTicketMetadata(metadataByTicket);
      console.log('Metadata loaded for all tickets:', metadataByTicket);
      
      // Clear loading state
      const notLoadingState = {};
      ticketsToProcess.forEach(ticket => {
        notLoadingState[ticket.id] = false;
      });
      setLoadingMetadata(notLoadingState);
      
    } catch (err) {
      console.error('Error fetching metadata for tickets:', err);
      
      // Clear loading state on error
      const notLoadingState = {};
      ticketsToProcess.forEach(ticket => {
        notLoadingState[ticket.id] = false;
      });
      setLoadingMetadata(notLoadingState);
    }
  };
  
  // Function to get metadata for a specific ticket when accordion is clicked
  // Only used if the metadata wasn't already loaded
  const fetchTicketMetadata = async (ticketId) => {
    if (!ticketId || loadingMetadata[ticketId]) return;
    
    // If we already have metadata for this ticket, don't fetch again
    if (ticketMetadata[ticketId] && Array.isArray(ticketMetadata[ticketId])) {
      return;
    }
    
    try {
      setLoadingMetadata(prev => ({ ...prev, [ticketId]: true }));
      
      // Fetch metadata items related to this ticket
      const { data, error } = await supabase
        .from('metadata')
        .select('*')
        .eq('ticket_id', ticketId);
      
      if (error) throw error;
      
      // Store the metadata items in state
      setTicketMetadata(prev => ({ ...prev, [ticketId]: data || [] }));
    } catch (err) {
      console.error(`Error fetching metadata for ticket ${ticketId}:`, err);
    } finally {
      setLoadingMetadata(prev => ({ ...prev, [ticketId]: false }));
    }
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

  // Apply filters to tickets and sort by creation date
  const getFilteredTickets = () => {
    console.log('=== GETTING FILTERED TICKETS ===');
    
    // Only use contextTickets if available, otherwise use localTickets as fallback
    // This prevents duplication of tickets when both sources are available
    const tickets = Array.isArray(contextTickets) ? contextTickets : localTickets;
    console.log('Base tickets count:', tickets ? tickets.length : 0);
    
    // Create a Map to track unique tickets by ID to prevent duplication
    const uniqueTickets = new Map();
    tickets.forEach(ticket => {
      if (!uniqueTickets.has(ticket.id)) {
        uniqueTickets.set(ticket.id, ticket);
      }
    });
    
    const deduplicatedTickets = Array.from(uniqueTickets.values());
    
    if (!deduplicatedTickets || deduplicatedTickets.length === 0) {
      console.log('No tickets to filter! Returning empty array');
      return [];
    }
    
    // First, filter the tickets
    const filteredTickets = deduplicatedTickets.filter(ticket => {
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
        // Convert both to strings for comparison to avoid type issues
        const ticketReleaseId = ticket.release_id ? ticket.release_id.toString() : null;
        const filterReleaseId = filters.release ? filters.release.toString() : null;
        
        console.log('Comparing release IDs:', { 
          ticketReleaseId, 
          filterReleaseId, 
          ticket: ticket.id, 
          match: ticketReleaseId === filterReleaseId 
        });
        
        if (ticketReleaseId !== filterReleaseId) {
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
    
    // Then, sort the filtered tickets by creation date
    const sortedTickets = filteredTickets.sort((a, b) => {
      // Get the date from either created_at (from database) or date (from local tickets)
      const dateA = a.created_at ? new Date(a.created_at) : new Date(a.date || 0);
      const dateB = b.created_at ? new Date(b.created_at) : new Date(b.date || 0);
      
      // Sort based on the current sort order
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    console.log('After filtering and sorting, returning tickets:', sortedTickets.length);
    return sortedTickets;
  };

  return (
    <>
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
          <div>

            <div className="filter-section mb-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center">
                  <i className="bi bi-funnel me-2"></i>
                  <span>Filters:</span>
                </div>
                
                <div className="saved-filters-dropdown">
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" id="saved-filters-dropdown">
                      <i className="bi bi-bookmark me-1"></i>
                      {selectedSavedFilter ? selectedSavedFilter.name : 'Saved Filters'}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Header>Select a saved filter</Dropdown.Header>
                      {savedFilters && savedFilters.filter(f => f.filter_type === 'tickets').length > 0 ? (
                        savedFilters.filter(f => f.filter_type === 'tickets').map(filter => (
                          <Dropdown.Item 
                            key={filter.id} 
                            onClick={() => applyFilter(filter)}
                            className="d-flex justify-content-between align-items-center"
                          >
                            <span>{filter.name}</span>
                            <Button 
                              variant="link" 
                              className="p-0 ms-2 text-danger" 
                              onClick={(e) => handleDeleteFilter(filter.id, e)}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </Dropdown.Item>
                        ))
                      ) : (
                        <Dropdown.Item disabled>No saved filters</Dropdown.Item>
                      )}
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={() => setShowSaveFilterModal(true)}>
                        <i className="bi bi-plus-circle me-1"></i> Save Current Filter
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
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
                  className="sort-btn me-2" 
                  onClick={toggleSortOrder}
                  title={sortOrder === 'asc' ? 'Sort by date (oldest first)' : 'Sort by date (newest first)'}
                >
                  <i className={`bi bi-sort-${sortOrder === 'asc' ? 'up' : 'down'} me-1`}></i>
                  <span>Sort by Date {sortOrder === 'asc' ? '(Oldest First)' : '(Newest First)'}</span>
                </Button>
                <Button 
                  variant="outline-secondary" 
                  className="reset-filters-btn" 
                  onClick={() => {
                    setFilters({
                      status: 'All Status',
                      type: 'All Types',
                      priority: 'All Priority',
                      supportArea: 'All Support Areas',
                      release: 'All Releases',
                      requester: 'All Requesters',
                      assignee: 'All Assignees'
                    });
                    setSelectedSavedFilter(null);
                  }}
                  disabled={!Object.values(filters).some(f => !f.includes('All'))}
                >
                  <i className="bi bi-arrow-counterclockwise me-1"></i> Reset Filters
                </Button>
              </div>
            </div>

            <div className="tickets-content">
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
                    {/* Get filtered tickets directly in render */}
                    {getFilteredTickets().map(ticket => (
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

                      <Accordion className="mt-3">
                        <Accordion.Item eventKey="0">
                          <Accordion.Header>
                            <i className="bi bi-code-square me-2"></i> Related Metadata
                            {` (${getMetadataCount(ticket.id)})`}
                          </Accordion.Header>
                          <Accordion.Body>
                            {loadingMetadata[ticket.id] ? (
                              <div className="text-center p-3">
                                <div className="spinner-border spinner-border-sm" role="status">
                                  <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-2 small">Loading metadata...</p>
                              </div>
                            ) : ticketMetadata[ticket.id] && ticketMetadata[ticket.id].length > 0 ? (
                              <div className="related-tickets">
                                {ticketMetadata[ticket.id].map(metadata => (
                                  <div key={metadata.id} className="related-ticket-card">
                                    <div className="ticket-header">
                                      <h5 className="ticket-title">
                                        <Link to={`/metadata/edit/${metadata.id}`} className="ticket-title-link">
                                          {metadata.name}
                                        </Link>
                                      </h5>
                                      <div className="ticket-badges">
                                        <span className="status-badge">{metadata.type}</span>
                                        <span className="status-badge">{metadata.action}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="ticket-details mt-3">
                                      {metadata.object && (
                                        <div className="ticket-support-area">
                                          <i className="bi bi-database"></i> Object: {metadata.object}
                                        </div>
                                      )}
                                      {metadata.release_id && (
                                        <div className="ticket-release">
                                          <i className="bi bi-box"></i> Release: {getReleaseName(metadata.release_id)}
                                        </div>
                                      )}
                                    </div>

                                    {metadata.description && (
                                      <div className="ticket-detail mt-3">
                                        <h6><i className="bi bi-card-text me-2"></i>Description:</h6>
                                        <p>{metadata.description}</p>
                                      </div>
                                    )}
                                    
                                    <div className="ticket-actions">
                                      <Link to={`/metadata/edit/${metadata.id}`} className="btn btn-sm btn-outline-primary">
                                        <i className="bi bi-pencil"></i> Edit
                                      </Link>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="empty-tickets">
                                <p>No metadata associated with this ticket</p>
                                <Link to={`/metadata/new?ticketId=${ticket.id}`} className="btn btn-sm btn-outline-primary">
                                  <i className="bi bi-plus"></i> Add Metadata
                                </Link>
                              </div>
                            )}
                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion>

                      <div className="ticket-actions">
                        <span className={`status-badge ${(ticket.status?.toLowerCase() || 'backlog').replace(/\s+/g, '-')}`}>{ticket.status || 'Backlog'}</span>
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

                        <Accordion className="mt-3">
                          <Accordion.Item eventKey="0">
                            <Accordion.Header>
                              <i className="bi bi-code-square me-2"></i> Related Metadata
                              {` (${getMetadataCount(ticket.id)})`}
                            </Accordion.Header>
                            <Accordion.Body>
                              {loadingMetadata[ticket.id] ? (
                                <div className="text-center p-3">
                                  <div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                  </div>
                                  <p className="mt-2 small">Loading metadata...</p>
                                </div>
                              ) : ticketMetadata[ticket.id] && ticketMetadata[ticket.id].length > 0 ? (
                                <div className="related-tickets">
                                  {ticketMetadata[ticket.id].map(metadata => (
                                    <div key={metadata.id} className="related-ticket-card">
                                      <div className="ticket-header">
                                        <h5 className="ticket-title">
                                          <Link to={`/metadata/edit/${metadata.id}`} className="ticket-title-link">
                                            {metadata.name}
                                          </Link>
                                        </h5>
                                        <div className="ticket-badges">
                                          <span className="status-badge">{metadata.type}</span>
                                          <span className="status-badge">{metadata.action}</span>
                                        </div>
                                      </div>
                                      
                                      <div className="ticket-details mt-3">
                                        {metadata.object && (
                                          <div className="ticket-support-area">
                                            <i className="bi bi-database"></i> Object: {metadata.object}
                                          </div>
                                        )}
                                        {metadata.release_id && (
                                          <div className="ticket-release">
                                            <i className="bi bi-box"></i> Release: {getReleaseName(metadata.release_id)}
                                          </div>
                                        )}
                                      </div>

                                      {metadata.description && (
                                        <div className="ticket-detail mt-3">
                                          <h6><i className="bi bi-card-text me-2"></i>Description:</h6>
                                          <p>{metadata.description}</p>
                                        </div>
                                      )}
                                      
                                      <div className="ticket-actions">
                                        <Link to={`/metadata/edit/${metadata.id}`} className="btn btn-sm btn-outline-primary">
                                          <i className="bi bi-pencil"></i> Edit
                                        </Link>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="empty-tickets">
                                  <p>No metadata associated with this ticket</p>
                                  <Link to={`/metadata/new?ticketId=${ticket.id}`} className="btn btn-sm btn-outline-primary">
                                    <i className="bi bi-plus"></i> Add Metadata
                                  </Link>
                                </div>
                              )}
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>

                        <div className="ticket-actions">
                          <span className={`status-badge ${(ticket.status?.toLowerCase() || 'backlog').replace(/\s+/g, '-')}`}>{ticket.status || 'Backlog'}</span>
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
                    <p>No tickets{Object.values(filters).some(f => !f.includes('All')) ? ' matching the selected filters' : ''}.</p>
                    {Object.values(filters).some(f => !f.includes('All')) && (
                      <button className="btn btn-outline-secondary mt-2" onClick={() => setFilters({
                        status: 'All Status',
                        type: 'All Types',
                        priority: 'All Priority',
                        supportArea: 'All Support Areas',
                        release: 'All Releases',
                        requester: 'All Requesters',
                        assignee: 'All Assignees'
                      })}>
                        <i className="bi bi-x-circle me-1"></i> Clear Filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals - Rendered directly without extra container div to prevent duplication */}
      <EditTicketModal 
        show={showEditModal} 
        handleClose={handleCloseEditModal} 
        ticket={selectedTicket} 
      />
      <DeleteTicketModal 
        show={showDeleteModal} 
        handleClose={handleCloseDeleteModal} 
        ticket={selectedTicket} 
      />
      
      {/* Save filter modal */}
      <Modal show={showSaveFilterModal} onHide={() => setShowSaveFilterModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Save Filter</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Filter Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter a name for this filter"
                value={filterName}
                onChange={(e) => {
                  setFilterName(e.target.value);
                  setSaveFilterError(null);
                }}
                className={!filterName.trim() && saveFilterError ? "is-invalid" : ""}
              />
              {!filterName.trim() && saveFilterError && (
                <div className="invalid-feedback" style={{display: "block"}}>
                  Please enter a filter name
                </div>
              )}
            </Form.Group>
            {saveFilterError && saveFilterError !== "Please enter a filter name" && (
              <div className="alert alert-danger mt-3">{saveFilterError}</div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowSaveFilterModal(false)} disabled={saveFilterLoading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveFilter} disabled={saveFilterLoading || !filterName.trim()}>
              {saveFilterLoading ? 'Saving...' : 'Save Filter'}
            </Button>
          </Modal.Footer>
        </Modal>
    </>
  );
};

export default Tickets;
