import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, InputGroup, Dropdown } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import CustomTypeahead from '../common/CustomTypeahead';
import './Metadata.css';

const Metadata = () => {
  const navigate = useNavigate();
  const { 
    metadataItems, 
    deleteMetadataItem, 
    releases, 
    tickets, 
    savedFilters, 
    addSavedFilter,
    updateSavedFilter,
    deleteSavedFilter,
    getSavedFilters 
  } = useAppContext();
  
  // Helper function to get ticket information from ticket_id
  const getTicketInfo = (ticketId) => {
    if (!ticketId) return { id: 'None', title: '' };
    
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return { id: ticketId, title: 'Unknown Ticket' };
    
    return { id: ticket.id, title: ticket.title || 'No Title' };
  };
  
  // Helper function to get release name from release_id
  const getReleaseName = (releaseId) => {
    if (!releaseId) return 'None';
    
    const releaseObj = releases.find(r => r.id === parseInt(releaseId));
    if (!releaseObj) return 'Unknown';
    
    return releaseObj.name;
  };
  
  // State for filters
  const [nameFilter, setNameFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState([]);
  const [selectedRelease, setSelectedRelease] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc'); // Default to newest first
  
  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  
  // State for save filter modal
  const [showSaveFilterModal, setShowSaveFilterModal] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [saveFilterLoading, setSaveFilterLoading] = useState(false);
  const [saveFilterError, setSaveFilterError] = useState(null);
  const [selectedSavedFilter, setSelectedSavedFilter] = useState(null);
  
  // Format tickets for the typeahead component
  const ticketOptions = tickets
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
    .map(ticket => ({
      id: ticket.id,
      label: `${ticket.id_display || ticket.id} - ${ticket.title}`
    }));
    
  // Format releases for the typeahead component
  const releaseOptions = releases
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
    .map(release => ({
      id: release.id,
      label: release.name
    }));
    
  // Get unique metadata types for the type filter dropdown
  const metadataTypes = ['all', ...new Set(metadataItems.map(item => item.type))];
  
  // Get unique metadata actions for the action filter dropdown
  const metadataActions = ['all', ...new Set(metadataItems.map(item => item.action))];
  
  // Fetch metadata-specific saved filters when component mounts
  useEffect(() => {
    // Fetch only metadata-specific saved filters
    getSavedFilters('metadata');
  }, []);
  
  // Apply filters to metadata items
  useEffect(() => {
    let filtered = [...metadataItems];
    
    // Filter by name (case-insensitive)
    if (nameFilter) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }
    
    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }
    
    // Filter by action
    if (actionFilter !== 'all') {
      filtered = filtered.filter(item => item.action === actionFilter);
    }
    
    // Filter by ticket
    if (selectedTicket.length > 0) {
      filtered = filtered.filter(item => 
        item.ticket_id && item.ticket_id.toString() === selectedTicket[0].id.toString()
      );
    }
    
    // Filter by release
    if (selectedRelease.length > 0) {
      filtered = filtered.filter(item => 
        item.release_id && item.release_id.toString() === selectedRelease[0].id.toString()
      );
    }
    
    // Sort by created date
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    setFilteredItems(filtered);
  }, [metadataItems, nameFilter, typeFilter, actionFilter, selectedTicket, selectedRelease, sortOrder]);
  
  // Handle ticket selection in typeahead
  const handleTicketChange = (selected) => {
    setSelectedTicket(selected);
  };
  
  // Handle release selection in typeahead
  const handleReleaseChange = (selected) => {
    setSelectedRelease(selected);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setNameFilter('');
    setTypeFilter('all');
    setActionFilter('all');
    setSelectedTicket([]);
    setSelectedRelease([]);
    setSelectedSavedFilter(null);
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
      const filterData = {
        name: filterName.trim(),
        filter_criteria: JSON.stringify({
          nameFilter,
          typeFilter,
          actionFilter,
          selectedTicket: selectedTicket.length > 0 ? selectedTicket[0] : null,
          selectedRelease: selectedRelease.length > 0 ? selectedRelease[0] : null,
          sortOrder
        })
      };
      
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
      const criteria = JSON.parse(filter.filter_criteria);
      
      setNameFilter(criteria.nameFilter || '');
      setTypeFilter(criteria.typeFilter || 'all');
      setActionFilter(criteria.actionFilter || 'all');
      setSelectedTicket(criteria.selectedTicket ? [criteria.selectedTicket] : []);
      setSelectedRelease(criteria.selectedRelease ? [criteria.selectedRelease] : []);
      setSortOrder(criteria.sortOrder || 'desc');
      setSelectedSavedFilter(filter);
    } catch (err) {
      console.error('Error applying filter:', err);
    }
  };
  
  // Delete a saved filter
  const handleDeleteFilter = async (filterId) => {
    try {
      await deleteSavedFilter(filterId);
      if (selectedSavedFilter && selectedSavedFilter.id === filterId) {
        setSelectedSavedFilter(null);
      }
    } catch (err) {
      console.error('Error deleting filter:', err);
    }
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    setDeleteLoading(true);
    setDeleteError(null);
    
    try {
      await deleteMetadataItem(itemToDelete.id);
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Error deleting metadata item:', err);
      setDeleteError(err.message || 'Failed to delete metadata item. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };
  
  // Fallback data in case no metadata items are loaded from context
  const [localMetadataItems] = useState([
    {
      id: 1,
      name: 'Customer_Portal_Access_c',
      type: 'apex class',
      action: 'create',
      object: 'Case',
      date: 'Jul 3, 2023',
      description: 'This is a test',
      technicalDetails: 'None',
      release: null
    },
    {
      id: 2,
      name: 'Customer_Portal_Access_c',
      type: 'custom field',
      action: 'delete',
      object: 'Account',
      date: 'Jul 7, 2023',
      description: 'Boolean field to control portal access for customers',
      technicalDetails: 'Checkbox field with default value false, used in permission sets',
      release: 'February 2024 Release'
    },
    {
      id: 3,
      name: 'OrderValidationRule',
      type: 'validation rule',
      action: 'update',
      object: 'Order',
      date: 'Jul 7, 2023',
      description: 'Fix validation logic for order amount validation',
      technicalDetails: 'Update formula to handle null values properly',
      release: 'February 2024 Release'
    }
  ]);

  // Initialize filteredItems with metadataItems on component mount
  useEffect(() => {
    setFilteredItems(metadataItems);
  }, [metadataItems]);

  // Render a metadata item
  const renderMetadataItem = (item) => (
    <div key={item.id} className="metadata-item">
      <div className="metadata-header">
        <h5 className="metadata-title">{item.name}</h5>
        <div className="metadata-badges">
          <span className={`status-badge ${item.type.replace(' ', '-')}`}>{item.type}</span>
          <span className={`status-badge ${item.action}`}>{item.action}</span>
        </div>
      </div>
      
      <div className="metadata-id">
        {item.date && <span>{item.date}</span>}
      </div>
      
      <div className="metadata-details mt-3">
        <div className="metadata-info-row">
          <div className="metadata-ticket">
            <i className="bi bi-ticket-perforated"></i> Ticket: {
              item.ticket_id ? 
                `${getTicketInfo(item.ticket_id).id} - ${getTicketInfo(item.ticket_id).title}` : 
                'None'
            }
          </div>
          <span className="metadata-divider">|</span>
          <div className="metadata-release">
            <i className="bi bi-box"></i> Release: {getReleaseName(item.release_id)}
          </div>
          <span className="metadata-divider">|</span>
          <div className="metadata-created-date">
            <i className="bi bi-calendar3"></i> Created Date: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Unknown'}
          </div>
        </div>
      </div>

      <div className="metadata-detail mt-3">
        <h6><i className="bi bi-card-text me-2"></i>Description:</h6>
        <p>{item.description || 'No details provided'}</p>
      </div>

      <div className="metadata-actions">
        <span className={`status-badge ${item.action}`}>{item.object || 'No Object'}</span>
        <div className="action-buttons">
          <Button 
            variant="link" 
            className="btn-icon"
            onClick={() => navigate(`/metadata/edit/${item.id}`)}
          >
            <i className="bi bi-pencil"></i>
          </Button>
          <Button 
            variant="link" 
            className="btn-icon text-danger"
            onClick={() => {
              setItemToDelete(item);
              setShowDeleteModal(true);
            }}
          >
            <i className="bi bi-trash"></i>
          </Button>
        </div>
      </div>
    </div>
  );

  // Render empty state when no items match filters
  const renderEmptyState = (actionType = '') => (
    <div className="empty-state">
      <i className="bi bi-search"></i>
      <p>No{actionType ? ` '${actionType}'` : ''} metadata items match your filter criteria</p>
      <Button variant="outline-primary" size="sm" onClick={resetFilters}>Reset Filters</Button>
    </div>
  );

  return (
    <>
      <div className="metadata-container">
        <div className="page-header">
          <div>
            <h1>Metadata Management</h1>
            <p className="page-subtitle">Track Salesforce components and deployment changes</p>
          </div>
          <Link to="/metadata/new" className="btn btn-primary">
            <i className="bi bi-plus"></i> Add Metadata
          </Link>
        </div>
        
        <div className="card mb-4">
          <div className="card-body" style={{ borderBottom: 'none' }}>
            <div className="metadata-filters">
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
                      {savedFilters && savedFilters.length > 0 ? (
                        savedFilters.map(filter => (
                          <Dropdown.Item 
                            key={filter.id} 
                            onClick={() => applyFilter(filter)}
                            className="d-flex justify-content-between align-items-center"
                          >
                            <span>{filter.name}</span>
                            <Button 
                              variant="link" 
                              className="p-0 ms-2 text-danger" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFilter(filter.id);
                              }}
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
            {/* Name filter */}
            <div className="filter-typeahead">
              <div className="search-input-wrapper">
                <i className="bi bi-search search-icon"></i>
                <Form.Control
                  className="form-control-with-icon"
                  placeholder="Filter by name..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                />
                {nameFilter && (
                  <button 
                    type="button" 
                    className="custom-clear-button" 
                    onClick={() => setNameFilter('')}
                    aria-label="Clear selection"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Type filter */}
            <Form.Select 
              className="filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {metadataTypes.map((type, index) => (
                <option key={index} value={type === 'all' ? 'all' : type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </Form.Select>

            {/* Action filter */}
            <Form.Select 
              className="filter-select"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              {metadataActions.map((action, index) => (
                <option key={index} value={action === 'all' ? 'all' : action}>
                  {action === 'all' ? 'All Actions' : action.charAt(0).toUpperCase() + action.slice(1)}
                </option>
              ))}
            </Form.Select>

            {/* Ticket filter with typeahead */}
            <div className="filter-typeahead">
              <CustomTypeahead
                id="ticket-filter-typeahead"
                labelKey="label"
                onChange={handleTicketChange}
                options={ticketOptions}
                placeholder="Filter by ticket..."
                selected={selectedTicket}
                renderMenuItemChildren={(option) => (
                  <div>
                    <span className="ticket-id">{option.id}</span> - {option.label.split(' - ')[1]}
                  </div>
                )}
              />
            </div>

            {/* Release filter with typeahead */}
            <div className="filter-typeahead">
              <CustomTypeahead
                id="release-filter-typeahead"
                labelKey="label"
                onChange={handleReleaseChange}
                options={releaseOptions}
                placeholder="Filter by release..."
                selected={selectedRelease}
                renderMenuItemChildren={(option) => (
                  <div>
                    {option.label}
                  </div>
                )}
              />
            </div>
          </div>
          
              <div className="metadata-filter-actions">
                <Button 
                  variant="outline-secondary" 
                  className="sort-btn me-2" 
                  onClick={toggleSortOrder}
                  title={sortOrder === 'asc' ? 'Sort by created date (oldest first)' : 'Sort by created date (newest first)'}
                >
                  <i className={`bi bi-sort-${sortOrder === 'asc' ? 'up' : 'down'} me-1`}></i>
                  <span>Sort by Created Date {sortOrder === 'asc' ? '(Oldest First)' : '(Newest First)'}</span>
                </Button>
                <Button 
                  variant="outline-secondary" 
                  className="reset-filters-btn" 
                  onClick={resetFilters}
                  disabled={!nameFilter && typeFilter === 'all' && actionFilter === 'all' && selectedTicket.length === 0 && selectedRelease.length === 0}
                >
                  <i className="bi bi-arrow-counterclockwise me-1"></i> Reset Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card mb-4">
          <div className="card-body pb-3">
            <div className="metadata-list">
              {filteredItems.length === 0 ? 
                renderEmptyState() : 
                filteredItems.map(item => renderMetadataItem(item))
              }
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the metadata item <strong>{itemToDelete?.name}</strong>?
          This action cannot be undone.
          {deleteError && <div className="alert alert-danger mt-3">{deleteError}</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleteLoading}>
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
      
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
              onChange={(e) => setFilterName(e.target.value)}
            />
          </Form.Group>
          {saveFilterError && <div className="alert alert-danger mt-3">{saveFilterError}</div>}
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

export default Metadata;
