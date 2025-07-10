import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { useAppContext } from '../context/AppContext';
import './NewRelease.css'; // Reuse the same CSS

const NewTicket = () => {
  const navigate = useNavigate();
  const { addTicket, releases, lastTicketNumber, supabase } = useAppContext();
  const [users, setUsers] = useState([]);
  
  // Next ticket number will be lastTicketNumber + 1
  const nextNumber = lastTicketNumber + 1;
  const paddedNumber = String(nextNumber).padStart(5, '0');
  const nextTicketId = `SUP-${paddedNumber}`;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Issue',
    priority: 'Medium',
    status: 'Open',
    supportArea: 'CRM',
    assignee: '',
    assignee_id: null,
    requester: '',
    requester_id: null,
    release_id: '',
    testNotes: ''
  });
  
  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('lastName', { ascending: true });
          
        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    
    fetchUsers();
  }, [supabase]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Format the data for submission
      const formattedData = {
        ...formData,
        // Convert string IDs to numbers
        release_id: formData.release_id ? parseInt(formData.release_id) : null,
        assignee_id: formData.assignee_id ? parseInt(formData.assignee_id) : null,
        requester_id: formData.requester_id ? parseInt(formData.requester_id) : null
      };
      
      // If we have an assignee_id, find the user to set the display name
      if (formattedData.assignee_id) {
        const selectedUser = users.find(user => user.id === parseInt(formData.assignee_id));
        if (selectedUser) {
          formattedData.assignee = `${selectedUser.firstName} ${selectedUser.lastName}`;
        }
      } else {
        // Clear the assignee name if no ID is selected
        formattedData.assignee = '';
      }
      
      // If we have a requester_id, find the user to set the display name
      if (formattedData.requester_id) {
        const selectedRequester = users.find(user => user.id === parseInt(formData.requester_id));
        if (selectedRequester) {
          formattedData.requester = `${selectedRequester.firstName} ${selectedRequester.lastName}`;
        }
      } else {
        // Clear the requester name if no ID is selected
        formattedData.requester = '';
      }
      
      const newTicket = await addTicket(formattedData);
      setSuccess(true);
      
      // Reset form after successful submission
      setFormData({
        title: '',
        description: '',
        type: 'Issue',
        priority: 'Medium',
        status: 'Backlog',
        supportArea: 'CRM',
        assignee: '',
        assignee_id: null,
        requester: '',
        requester_id: null,
        release_id: '',
        testNotes: ''
      });
      
      // Redirect after short delay to show success message
      setTimeout(() => {
        navigate('/tickets');
      }, 1500);
      
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError(err.message || 'Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="new-release-container">
      <div className="page-header">
        <div>
          <h1>Create New Ticket</h1>
          <p className="page-subtitle">Add a new ticket to the system</p>
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
              Ticket created successfully! Redirecting to tickets page...
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Ticket ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="id"
                    value={nextTicketId}
                    readOnly
                    disabled
                    className="bg-light"
                  />
                  <Form.Text className="text-muted">
                    Auto-generated sequential ID (read-only)
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Requester</Form.Label>
                  <Form.Select
                    name="requester_id"
                    value={formData.requester_id || ''}
                    onChange={handleChange}
                  >
                    <option value="">None</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Who requested this ticket
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Assignee</Form.Label>
                  <Form.Select
                    name="assignee_id"
                    value={formData.assignee_id || ''}
                    onChange={handleChange}
                  >
                    <option value="">None</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Who is working on this ticket
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Title*</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Email not sending"
                required
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
                placeholder="Detailed description of this ticket"
              />
            </Form.Group>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Type*</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="Enhancement">Enhancement</option>
                    <option value="Issue">Issue</option>
                    <option value="New Feature">New Feature</option>
                    <option value="Request">Request</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Priority*</Form.Label>
                  <Form.Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    required
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Status*</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
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
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Support Area*</Form.Label>
                  <Form.Select
                    name="supportArea"
                    value={formData.supportArea}
                    onChange={handleChange}
                    required
                  >
                    <option value="CRM">CRM</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Marketing">Marketing</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Release</Form.Label>
                  <Form.Select
                    name="release_id"
                    value={formData.release_id}
                    onChange={handleChange}
                  >
                    <option value="">None</option>
                    {releases && releases.map(release => (
                      <option key={release.id} value={release.id}>
                        {release.name} {release.version ? `(${release.version})` : ''}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Test Notes</Form.Label>
              <Form.Control
                as="textarea"
                name="testNotes"
                value={formData.testNotes}
                onChange={handleChange}
                rows={3}
                placeholder="Notes related to testing of this ticket"
              />
              <Form.Text className="text-muted">
                Add any notes related to testing requirements or results
              </Form.Text>
            </Form.Group>
            
            <div className="form-actions">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/tickets')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading || success}
              >
                {loading ? 'Creating...' : 'Create Ticket'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default NewTicket;
