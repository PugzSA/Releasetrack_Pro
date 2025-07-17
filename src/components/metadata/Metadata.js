import React, { useState, useEffect, useMemo } from 'react';
import { Button, Modal, Form, Dropdown } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import CustomTypeahead from '../common/CustomTypeahead';
import MetadataCard from './MetadataCard';
import './Metadata.css';

const Metadata = () => {
  const {
    metadataItems = [],
    tickets = [],
    releases = [],
    savedFilters = [],
    addSavedFilter,
    deleteSavedFilter,
    deleteMetadataItem,
    loading,
    error
  } = useApp();


  const [filters, setFilters] = useState({
    type: 'All Types',
    action: 'All Actions',
  });
  const [selectedRelease, setSelectedRelease] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showSaveFilterModal, setShowSaveFilterModal] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [saveFilterError, setSaveFilterError] = useState(null);
  const [selectedSavedFilter, setSelectedSavedFilter] = useState(null);
  const [typeaheadKey, setTypeaheadKey] = useState(Date.now());
  const [sortOrder, setSortOrder] = useState('desc');

  const navigate = useNavigate();

  useEffect(() => {
    resetFilters();
  }, []);

  const releaseOptions = useMemo(() => releases.map(r => ({ id: r.id, label: r.name, ...r })), [releases]);
  const ticketOptions = useMemo(() => tickets.map(t => ({ id: t.id, label: `${t.id} - ${t.title}`, ...t })), [tickets]);

  const filteredItems = useMemo(() => {
    let items = metadataItems ? [...metadataItems] : [];

    if (filters.type !== 'All Types') {
      items = items.filter(item => item.type === filters.type);
    }
    if (filters.action !== 'All Actions') {
      items = items.filter(item => item.action === filters.action);
    }
    if (selectedRelease.length > 0) {
      const releaseId = selectedRelease[0].id;
      items = items.filter(item => item.release_id === releaseId);
    }
    if (selectedTicket.length > 0) {
      const ticketId = selectedTicket[0].id;
      items = items.filter(item => item.ticket_id === ticketId);
    }

    return items.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [filters, selectedRelease, selectedTicket, metadataItems, sortOrder]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setSelectedSavedFilter(null);
  };

  const handleReleaseChange = (selected) => {
    setSelectedRelease(selected);
    setSelectedSavedFilter(null);
  };

  const handleTicketChange = (selected) => {
    setSelectedTicket(selected);
    setSelectedSavedFilter(null);
  };

  const resetFilters = () => {
    setFilters({
      type: 'All Types',
      action: 'All Actions',
    });
    setSelectedRelease([]);
    setSelectedTicket([]);
    setSelectedSavedFilter(null);
    setSortOrder('desc');
    setTypeaheadKey(Date.now());
  };

  const toggleSortOrder = () => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteMetadataItem(itemToDelete.id);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleSaveFilter = async () => {
    if (!filterName.trim()) {
      setSaveFilterError('Filter name cannot be empty.');
      return;
    }
    const filterData = {
      name: filterName.trim(),
      filter_type: 'metadata',
      filter_criteria: JSON.stringify({ 
        filters, 
        selectedRelease: selectedRelease.length > 0 ? selectedRelease[0] : null,
        selectedTicket: selectedTicket.length > 0 ? selectedTicket[0] : null,
        sortOrder
      })
    };
    const newFilter = await addSavedFilter(filterData);
    setSelectedSavedFilter(newFilter);
    setShowSaveFilterModal(false);
    setFilterName('');
    setSaveFilterError(null);
  };

  const applyFilter = (filter) => {
    try {
      const criteria = JSON.parse(filter.filter_criteria);
      setFilters(criteria.filters);
      setSelectedRelease(criteria.selectedRelease ? [criteria.selectedRelease] : []);
      setSelectedTicket(criteria.selectedTicket ? [criteria.selectedTicket] : []);
      setSortOrder(criteria.sortOrder || 'desc');
      setSelectedSavedFilter(filter);
      setTypeaheadKey(Date.now());
    } catch (err) {
      console.error('Error applying filter:', err);
    }
  };

  const renderEmptyState = () => (
    <div className="empty-state">
      <i className="bi bi-cloud-slash fs-1 text-muted"></i>
      <h5 className="mt-3">No Metadata Found</h5>
      <p>No metadata items match the current filter criteria.</p>
    </div>
  );

  if (loading) return <div className="text-center p-5"><div className="spinner-border"></div></div>;
  if (error) return <div className="alert alert-danger">Error loading metadata: {error}</div>;

  return (
    <>
      <div className="metadata-container">
        <div className="page-header">
          <div>
            <h1>Metadata Management</h1>
            <p className="page-subtitle">Track Metadata changes related to Tickets/Releases</p>
          </div>
          <div className="header-actions">
            <Link to="/metadata/create" className="btn btn-primary">
              <i className="bi bi-plus"></i> Create Metadata
            </Link>
          </div>
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
                      {savedFilters?.filter(f => f.filter_type === 'metadata').map(filter => (
                        <Dropdown.Item key={filter.id} onClick={() => applyFilter(filter)} className="d-flex justify-content-between align-items-center">
                          <span>{filter.name}</span>
                          <Button variant="link" className="p-0 ms-2 text-danger" onClick={(e) => { e.stopPropagation(); deleteSavedFilter(filter.id); }}>
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
                <Form.Select name="type" value={filters.type} onChange={handleFilterChange} className="filter-select">
                  <option>All Types</option>
                  <option>Apex Class</option>
                  <option>Custom Field</option>
                  <option>Validation Rule</option>
                </Form.Select>
                <Form.Select name="action" value={filters.action} onChange={handleFilterChange} className="filter-select">
                  <option>All Actions</option>
                  <option>Create</option>
                  <option>Update</option>
                  <option>Delete</option>
                </Form.Select>
                <Form.Group className="filter-select">
                  <CustomTypeahead
                    key={`release-${typeaheadKey}`}
                    id="release-filter"
                    options={releaseOptions}
                    selected={selectedRelease}
                    onChange={handleReleaseChange}
                    placeholder="Filter by release..."
                    classNamePrefix="react-select-filter"
                  />
                </Form.Group>
                <Form.Group className="filter-select">
                  <CustomTypeahead
                    key={`ticket-${typeaheadKey}`}
                    id="ticket-filter"
                    options={ticketOptions}
                    selected={selectedTicket}
                    onChange={handleTicketChange}
                    placeholder="Filter by ticket..."
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
          </div>
        </div>

        <div className="metadata-list mt-4">
          {filteredItems.length === 0 ? 
            renderEmptyState() : 
            filteredItems.map(item => (
              <MetadataCard 
                key={item.id} 
                metadataItem={item} 
                onDeleteClick={handleDeleteClick}
              />
            ))
          }
        </div>
      </div>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the metadata item "<strong>{itemToDelete?.name}</strong>"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showSaveFilterModal} onHide={() => setShowSaveFilterModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Save Filter</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Filter Name</Form.Label>
            <Form.Control 
              type="text" 
              value={filterName} 
              onChange={(e) => setFilterName(e.target.value)} 
              placeholder="Enter a name for this filter"
              isInvalid={!!saveFilterError}
            />
            <Form.Control.Feedback type="invalid">
              {saveFilterError}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowSaveFilterModal(false); setSaveFilterError(null); }}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveFilter}>Save</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Metadata;
