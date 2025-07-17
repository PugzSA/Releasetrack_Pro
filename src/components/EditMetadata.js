import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { useApp } from '../context/AppContext';
import './NewMetadata.css'; // Reuse the same CSS

const EditMetadata = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { metadataItems, updateMetadataItem, releases, tickets, loading: contextLoading } = useApp();
  
  // State for the typeahead component
  const [selectedTicket, setSelectedTicket] = useState([]);
  
  // Format tickets for the typeahead component
  const ticketOptions = tickets
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
    .slice(0, 15)
    .map(ticket => {
      return {
        id: ticket.id,
        label: `${ticket.id_display || ticket.id} - ${ticket.title}`
      };
    });
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'apex class', // Set default value to avoid empty string
    action: 'create',  // Set default value to avoid empty string
    object: '',
    description: '',
    release_id: null,  // Initialize as null instead of empty string
    ticket_id: null    // Initialize as null instead of empty string
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (contextLoading || !metadataItems || !tickets) {
    return <div className="text-center p-5"><div className="spinner-border"></div></div>;
  }
  
  // Load the metadata item data when the component mounts
  useEffect(() => {
    if (!metadataItems || metadataItems.length === 0) {
      return; // Wait for the context to load
    }

    const metadataItem = metadataItems.find(item => item.id === parseInt(id));
    
    if (metadataItem) {
      setFormData({
        name: metadataItem.name || '',
        type: metadataItem.type || 'apex class',
        action: metadataItem.action || 'create',
        object: metadataItem.object || '',
        description: metadataItem.description || '',
        release_id: metadataItem.release_id || null,
        ticket_id: metadataItem.ticket_id || null
      });
      
      // Set the selected ticket for the typeahead if there's a ticket_id
      if (metadataItem.ticket_id) {
        const ticket = tickets.find(t => t.id === metadataItem.ticket_id);
        if (ticket) {
          setSelectedTicket([{
            id: ticket.id,
            label: `${ticket.id_display || ticket.id} - ${ticket.title}`
          }]);
        }
      }
    } else {
      if (!contextLoading) {
        setError('Metadata item not found');
      }
    }
  }, [id, metadataItems]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle ticket selection from typeahead
  const handleTicketChange = (selected) => {
    setSelectedTicket(selected);
    if (selected && selected.length > 0) {
      // Find the actual ticket object from the tickets array
      const ticketId = selected[0].id;
      console.log('Selected ticket ID:', ticketId);
      
      // Get the actual ticket object to ensure we have the correct ID format
      const selectedTicketObj = tickets.find(t => t.id === ticketId || t.id === parseInt(ticketId));
      console.log('Found ticket object:', selectedTicketObj);
      
      if (selectedTicketObj) {
        setFormData({
          ...formData,
          ticket_id: selectedTicketObj.id
        });
      } else {
        console.warn('Could not find ticket object for ID:', ticketId);
        setFormData({
          ...formData,
          ticket_id: ticketId
        });
      }
    } else {
      setFormData({
        ...formData,
        ticket_id: null
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Create a clean copy of the form data
    const dataToSubmit = { ...formData };
    
    // Handle the ticket_id field specifically
    if (dataToSubmit.ticket_id) {
      // Ensure we're using the raw ticket ID without any parsing
      // This preserves the original ID format from the tickets table
      console.log('Raw ticket_id before submission:', dataToSubmit.ticket_id);
    } else {
      dataToSubmit.ticket_id = null;
    }
    
    console.log('Final metadata submission data:', JSON.stringify(dataToSubmit, null, 2));
    
    try {
      await updateMetadataItem(id, dataToSubmit);
      setSuccess(true);
      
      // Redirect after short delay to show success message
      setTimeout(() => {
        navigate('/metadata');
      }, 1500);
      
    } catch (err) {
      console.error('Error updating metadata item:', err);
      setError(err.message || 'Failed to update metadata item. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="new-metadata-container">
      <div className="page-header">
        <div>
          <h1>Edit Metadata Item</h1>
          <p className="page-subtitle">Update metadata component details</p>
        </div>
      </div>
      
      <Card className="form-card">
        <Card.Body>
          {error && (
            <Alert variant="danger">
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert variant="success">
              Metadata item updated successfully! Redirecting to metadata page...
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Component Name*</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Customer_Portal_Access_c"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Type*</Form.Label>
              <Form.Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="apex class">Apex Class</option>
                <option value="custom field">Custom Field</option>
                <option value="validation rule">Validation Rule</option>
                <option value="trigger">Trigger</option>
                <option value="flow">Flow</option>
                <option value="page layout">Page Layout</option>
                <option value="lightning component">Lightning Component</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Action*</Form.Label>
              <Form.Select
                name="action"
                value={formData.action}
                onChange={handleChange}
                required
              >
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Object</Form.Label>
              <Form.Control
                type="text"
                name="object"
                value={formData.object}
                onChange={handleChange}
                placeholder="e.g. Account, Contact, Custom Object"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Detailed description of this metadata component"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Release</Form.Label>
              <Form.Select
                name="release_id"
                value={formData.release_id}
                onChange={handleChange}
              >
                <option value="">None</option>
                {releases.map(release => (
                  <option key={release.id} value={release.id}>
                    {release.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Ticket</Form.Label>
              <Typeahead
                id="ticket-typeahead"
                labelKey="label"
                onChange={handleTicketChange}
                options={ticketOptions}
                placeholder="Search for ticket by ID or title..."
                selected={selectedTicket}
                clearButton
              />
              <Form.Text className="text-muted">
                Search by ticket ID or title. Showing the 15 most recent tickets by default.
              </Form.Text>
            </Form.Group>
            
            <div className="form-actions">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/metadata')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading || success}
              >
                {loading ? 'Updating...' : 'Update Metadata Item'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default EditMetadata;
