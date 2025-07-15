import React, { useState, useEffect, useRef, useMemo } from 'react';
import './Tickets.css';
import { Button, Form, Accordion, Dropdown, Modal, FormGroup } from 'react-bootstrap';
import CustomTypeahead from '../common/CustomTypeahead';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import EditTicketModal from './EditTicketModal';
import DeleteTicketModal from './DeleteTicketModal';
import MetadataCard from '../metadata/MetadataCard';

const Tickets = () => {
  const {
    tickets: contextTickets,
    releases,
    metadataItems,
    loading,
    error,
    supabase,
    savedFilters = [],
    addSavedFilter,
    deleteSavedFilter,
    getSavedFilters
  } = useAppContext();

  // State for filters
  const [filters, setFilters] = useState({
    status: 'All Status',
    type: 'All Types',
    priority: 'All Priority',
    supportArea: 'All Support Areas',
    release: 'All Releases',
    requester: 'All Requesters',
    assignee: 'All Assignees'
  });

  // State for sorting
  const [sortOrder, setSortOrder] = useState('desc');

  // State for unique requesters and assignees for filter dropdowns
  const [requesters, setRequesters] = useState([]);
  const [assignees, setAssignees] = useState([]);

  // State for modals
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // State for save filter modal
  const [showSaveFilterModal, setShowSaveFilterModal] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [saveFilterLoading, setSaveFilterLoading] = useState(false);
  const [saveFilterError, setSaveFilterError] = useState(null);
  const [selectedSavedFilter, setSelectedSavedFilter] = useState(null);
  const [selectedRelease, setSelectedRelease] = useState([]);
  const releaseTypeaheadRef = useRef(null);
  const [typeaheadKey, setTypeaheadKey] = useState(Date.now());

  const releaseOptions = releases
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
    .map(release => ({
      id: release.id,
      label: release.name
    }));

  // Fallback data - useful for testing UI without a backend connection
  const [localTickets] = useState([]);

  // State for related metadata
  const [ticketMetadata, setTicketMetadata] = useState({});
  const [loadingMetadata, setLoadingMetadata] = useState({});

  // Initial data fetching
  useEffect(() => {
    if (supabase) {
      const abortController = new AbortController();
      // Fetch metadata for all tickets on initial load
      fetchAllTicketsMetadata(abortController);
      // Fetch saved filters specific to the tickets page
      getSavedFilters('tickets');

      return () => {
        abortController.abort();
      };
    }
  }, [supabase, contextTickets]); // Re-run if contextTickets changes to get metadata for new tickets

  // Handle closing modals
  const handleCloseEditModal = () => setShowEditModal(false);
  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setSelectedSavedFilter(null); // Clear selected saved filter when manual changes are made
  };

  const handleReleaseChange = (selected) => {
    setSelectedRelease(selected);
  };

  // Toggle sort order
  const toggleSortOrder = () => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));

  const resetFilters = () => {
    setFilters({
      status: 'All Status',
      type: 'All Types',
      priority: 'All Priority',
      supportArea: 'All Support Areas',
      release: 'All Releases',
      requester: 'All Requesters',
      assignee: 'All Assignees'
    });
    setSelectedRelease([]);
    setSortOrder('desc');
    setSelectedSavedFilter(null);
    setTypeaheadKey(Date.now());
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
      const filterData = {
        name: filterName.trim(),
        filter_type: 'tickets',
        filter_criteria: JSON.stringify({ filters, sortOrder, selectedRelease: selectedRelease.length > 0 ? selectedRelease[0] : null })

      };
      await addSavedFilter(filterData);
      setShowSaveFilterModal(false);
      setFilterName('');
    } catch (err) {
      setSaveFilterError(err.message || 'Failed to save filter.');
    } finally {
      setSaveFilterLoading(false);
    }
  };

  // Apply a saved filter
  const applyFilter = (filter) => {
    try {
      const criteria = JSON.parse(filter.filter_criteria);
      setFilters(criteria.filters);
      setSortOrder(criteria.sortOrder);
      setSelectedRelease(criteria.selectedRelease ? [criteria.selectedRelease] : []);
      setSelectedSavedFilter(filter);
      setTypeaheadKey(Date.now());
    } catch (err) {
      console.error('Error applying filter:', err);
    }
  };

  // Delete a saved filter
  const handleDeleteFilter = async (filterId, event) => {
    event.stopPropagation();
    try {
      await deleteSavedFilter(filterId);
      if (selectedSavedFilter && selectedSavedFilter.id === filterId) {
        setSelectedSavedFilter(null);
      }
    } catch (err) {
      console.error('Error deleting filter:', err);
    }
  };

  // Helper to get release name from ID
  const getReleaseName = (releaseId) => {
    if (!releaseId || !releases) return 'None';
    const releaseObj = releases.find(r => r.id === parseInt(releaseId));
    return releaseObj ? releaseObj.name : 'Unknown';
  };

  // Helper to get metadata count
  const getMetadataCount = (ticketId) => ticketMetadata[ticketId]?.length || 0;

  // Fetch metadata for all tickets
  const fetchAllTicketsMetadata = async (abortController) => {
    if (!supabase) return;
    const ticketsToProcess = contextTickets?.length ? contextTickets : localTickets;
    if (!ticketsToProcess?.length) return;

    setLoadingMetadata(prev => ({ ...prev, all: true }));
    try {
      const { data, error } = await supabase.from('metadata').select('*').abortSignal(abortController.signal);
      if (error) throw error;

      const metadataByTicket = {};
      ticketsToProcess.forEach(ticket => { metadataByTicket[ticket.id] = []; });
      data.forEach(item => {
        if (item.ticket_id && metadataByTicket[item.ticket_id]) {
          metadataByTicket[item.ticket_id].push(item);
        }
      });
      setTicketMetadata(metadataByTicket);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching all metadata:', err);
      }
    } finally {
      setLoadingMetadata(prev => ({ ...prev, all: false }));
    }
  };

  // Helpers to get names for display
  const getAssigneeName = (ticket) => ticket.assignee || (ticket.assignee_id ? `User ID: ${ticket.assignee_id}` : 'Unassigned');
  const getRequesterName = (ticket) => ticket.requester || (ticket.requester_id ? `User ID: ${ticket.requester_id}` : 'Not specified');

  // Populate filter dropdowns with unique requesters and assignees
  useEffect(() => {
    if (contextTickets?.length) {
      setRequesters([...new Set(contextTickets.map(t => getRequesterName(t)).filter(Boolean))]);
      setAssignees([...new Set(contextTickets.map(t => getAssigneeName(t)).filter(Boolean))]);
    }
  }, [contextTickets]);

  // Memoize filtered and sorted tickets
  const filteredTickets = useMemo(() => {
    const tickets = Array.isArray(contextTickets) ? contextTickets : localTickets;
    if (!tickets.length) return [];

    // Deduplicate tickets using a Map
    const uniqueTickets = new Map();
    tickets.forEach(ticket => { if (!uniqueTickets.has(ticket.id)) uniqueTickets.set(ticket.id, ticket); });
    const deduplicatedTickets = Array.from(uniqueTickets.values());

    // Apply filters
    const filtered = deduplicatedTickets.filter(ticket => {
      return (
        (filters.status === 'All Status' || ticket.status === filters.status) &&
        (filters.type === 'All Types' || ticket.type === filters.type) &&
        (filters.priority === 'All Priority' || ticket.priority === filters.priority) &&
        (filters.supportArea === 'All Support Areas' || ticket.supportArea === filters.supportArea) &&
        (selectedRelease.length === 0 || (ticket.release_id && ticket.release_id.toString() === selectedRelease[0].id.toString())) &&
        (filters.requester === 'All Requesters' || getRequesterName(ticket) === filters.requester) &&
        (filters.assignee === 'All Assignees' || getAssigneeName(ticket) === filters.assignee)
      );
    });

    // Apply sorting
    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || a.date || 0);
      const dateB = new Date(b.created_at || b.date || 0);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [contextTickets, localTickets, filters, selectedRelease, sortOrder]);

  // Main component render
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
                      {savedFilters?.filter(f => f.filter_type === 'tickets').map(filter => (
                        <Dropdown.Item key={filter.id} onClick={() => applyFilter(filter)} className="d-flex justify-content-between align-items-center">
                          <span>{filter.name}</span>
                          <Button variant="link" className="p-0 ms-2 text-danger" onClick={(e) => handleDeleteFilter(filter.id, e)}>
                            <i className="bi bi-trash"></i>
                          </Button>
                        </Dropdown.Item>
                      ))}
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={() => setShowSaveFilterModal(true)}>
                        <i className="bi bi-plus-circle me-1"></i> Save Current Filter
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
              <div className="filter-options">
                {/* Filter Dropdowns */}
                <Form.Select className="filter-select" name="status" value={filters.status} onChange={handleFilterChange}>
                  <option>All Status</option>
                  <option>Backlog</option>
                  <option>Cancelled</option>
                  <option>Requirements Gathering</option>
                  <option>In Technical Design</option>
                  <option>In Development</option>
                  <option>Blocked - User</option>
                  <option>Blocked - Dev</option>
                  <option>In Testing - Dev</option>
                  <option>In Testing - UAT</option>
                  <option>Ready For Release</option>
                  <option>Released</option>
                </Form.Select>
                <Form.Select className="filter-select" name="type" value={filters.type} onChange={handleFilterChange}>
                  <option>All Types</option>
                  <option>Enhancement</option>
                  <option>Issue</option>
                  <option>New Feature</option>
                  <option>Request</option>
                </Form.Select>
                <Form.Select className="filter-select" name="priority" value={filters.priority} onChange={handleFilterChange}>
                  <option>All Priority</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </Form.Select>
                <Form.Select className="filter-select" name="supportArea" value={filters.supportArea} onChange={handleFilterChange}>
                  <option>All Support Areas</option>
                  <option>CRM</option>
                  <option>Customer Support</option>
                  <option>Marketing</option>
                </Form.Select>
                <Form.Select className="filter-select" name="requester" value={filters.requester} onChange={handleFilterChange}>
                  <option>All Requesters</option>
                  {requesters.map(r => <option key={r} value={r}>{r}</option>)}
                </Form.Select>
                <Form.Select className="filter-select" name="assignee" value={filters.assignee} onChange={handleFilterChange}>
                  <option>All Assignees</option>
                  {assignees.map(a => <option key={a} value={a}>{a}</option>)}
                </Form.Select>
                <Form.Group className="filter-select">
                  <CustomTypeahead
                    key={typeaheadKey}
                    ref={releaseTypeaheadRef}
                    id="release-filter"
                    options={releaseOptions}
                    selected={selectedRelease}
                    onChange={handleReleaseChange}
                    placeholder="Filter by release..."
                    classNamePrefix="react-select-filter"
                  />
                </Form.Group>
              </div>
              <div className="filter-actions">
                <Button variant="outline-secondary" className="sort-btn me-2" onClick={toggleSortOrder} title={`Sort by date (${sortOrder === 'asc' ? 'oldest' : 'newest'} first)`}>
                  <i className={`bi bi-sort-${sortOrder === 'asc' ? 'up' : 'down'} me-1`}></i>
                  <span>Sort by Date</span>
                </Button>
                <Button variant="outline-secondary" className="reset-filters-btn" onClick={resetFilters}>
                  <i className="bi bi-arrow-counterclockwise me-1"></i> Reset Filters
                </Button>
              </div>
            </div>

            <div className="tickets-content">
              {loading ? (
                <div className="text-center p-5">
                  <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
                  <p className="mt-3">Loading tickets...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger"><i className="bi bi-exclamation-triangle me-2"></i>{error}</div>
              ) : filteredTickets.length > 0 ? (
                <div className="tickets-list">
                  {filteredTickets.map(ticket => (
                    <div key={ticket.id} className="ticket-item">
                      <div className="ticket-header">
                        <h5 className="ticket-title">{ticket.title}</h5>
                        <div className="ticket-badges">
                          <span className="status-badge bug">{ticket.type}</span>
                          <span className="status-badge high">{ticket.priority}</span>
                        </div>
                      </div>
                      <div className="ticket-id">{ticket.id} • {new Date(ticket.created_at || ticket.date).toLocaleDateString()}</div>
                      <div className="ticket-details mt-3">
                        <div><i className="bi bi-person-circle"></i> Requester: {getRequesterName(ticket)}</div>
                        <div><i className="bi bi-person"></i> Assignee: {getAssigneeName(ticket)}</div>
                        <div><i className="bi bi-headset"></i> Support Area: {ticket.supportArea || 'N/A'}</div>
                        <div><i className="bi bi-box"></i> Release: {getReleaseName(ticket.release_id)}</div>
                      </div>
                      <div className="ticket-detail mt-3">
                        <h6><i className="bi bi-card-text me-2"></i>Description:</h6>
                        <p>{ticket.description || 'No details provided'}</p>
                      </div>
                      {ticket.testNotes && (
                        <div className="ticket-test-notes mt-3">
                          <h6><i className="bi bi-clipboard-check me-2"></i>Test Notes:</h6>
                          <p>{ticket.testNotes}</p>
                        </div>
                      )}
                      <Accordion className="mt-3">
                        <Accordion.Item eventKey="0">
                          <Accordion.Header>
                            <i className="bi bi-code-square me-2"></i> Related Metadata ({getMetadataCount(ticket.id)})
                          </Accordion.Header>
                          <Accordion.Body>
                            {loadingMetadata.all || loadingMetadata[ticket.id] ? (
                              <div className="text-center p-3"><div className="spinner-border spinner-border-sm"></div></div>
                            ) : ticketMetadata[ticket.id]?.length > 0 ? (
                              <div className="related-metadata-list">
                                {ticketMetadata[ticket.id].map(metadata => (
                                  <MetadataCard 
                                    key={metadata.id} 
                                    metadataItem={metadata} 
                                    onDeleteClick={() => { /* No delete from this view */ }}
                                  />
                                ))}
                              </div>
                            ) : (
                              <div className="text-center my-3">
                                <p>No metadata associated with this ticket.</p>
                              </div>
                            )}
                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion>
                      <div className="ticket-actions">
                        <span className={`status-badge ${(ticket.status?.toLowerCase() || 'backlog').replace(/\s+/g, '-')}`}>{ticket.status || 'Backlog'}</span>
                        <div className="action-buttons">
                          <button className="btn btn-link" onClick={() => { setSelectedTicket(ticket); setShowEditModal(true); }}><i className="bi bi-pencil"></i></button>
                          <button className="btn btn-link text-danger" onClick={() => { setSelectedTicket(ticket); setShowDeleteModal(true); }}><i className="bi bi-trash"></i></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-tickets">
                  <i className="bi bi-ticket-detailed-fill empty-icon"></i>
                  <h4>No tickets found</h4>
                  <p>There are no tickets that match your current filters.</p>
                  <Link to="/tickets/new" className="btn btn-primary"><i className="bi bi-plus"></i> Create New Ticket</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditTicketModal show={showEditModal} handleClose={handleCloseEditModal} ticket={selectedTicket} />
      <DeleteTicketModal show={showDeleteModal} handleClose={handleCloseDeleteModal} ticket={selectedTicket} />
      <Modal show={showSaveFilterModal} onHide={() => setShowSaveFilterModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Save Filter</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Filter Name</Form.Label>
            <Form.Control type="text" value={filterName} onChange={(e) => setFilterName(e.target.value)} placeholder="e.g., My High Priority Tickets" />
            {saveFilterError && <Form.Text className="text-danger">{saveFilterError}</Form.Text>}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSaveFilterModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveFilter} disabled={saveFilterLoading}>{saveFilterLoading ? 'Saving...' : 'Save Filter'}</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Tickets;
