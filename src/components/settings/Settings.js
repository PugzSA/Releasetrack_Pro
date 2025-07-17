import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Table, Modal, Nav, Tab, Spinner } from 'react-bootstrap';
import { useApp } from '../../context/AppContext';
import NotificationSettings from './NotificationSettings';
import NotificationLogs from './NotificationLogs';
import './Settings.css';

const Settings = () => {
  const { supabase } = useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  
  // Form state for adding new users
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Fetch users from the database
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('lastName', { ascending: true });
        
      if (error) throw error;
      
      setUsers(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle edit form input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add new user
  const addUser = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUser.email)) {
        setError('Please enter a valid email address.');
        setLoading(false);
        return;
      }
      
      console.log('Attempting to add user:', newUser);
      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select();
        
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`${error.message} - ${error.details || 'No additional details'}`);
      }
      
      if (!data || data.length === 0) {
        throw new Error('No data returned from insert operation');
      }
      
      console.log('User added successfully:', data[0]);
      setUsers(prev => [...prev, data[0]]);
      setNewUser({ firstName: '', lastName: '', email: '' });
      setShowAddModal(false);
      setError(null);
    } catch (err) {
      console.error('Error adding user:', err);
      setError(`Failed to add user: ${err.message}. This might be because the users table doesn't exist yet. Please run the SQL migration script.`);
    } finally {
      setLoading(false);
    }
  };
  
  // Update user
  const updateUser = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(selectedUser.email)) {
        setError('Please enter a valid email address.');
        setLoading(false);
        return;
      }
      
      const { error } = await supabase
        .from('users')
        .update({
          firstName: selectedUser.firstName,
          lastName: selectedUser.lastName,
          email: selectedUser.email
        })
        .eq('id', selectedUser.id);
        
      if (error) throw error;
      
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id ? selectedUser : user
      ));
      setShowEditModal(false);
      setError(null);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete user
  const deleteUser = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', selectedUser.id);
        
      if (error) throw error;
      
      setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
      setShowDeleteModal(false);
      setError(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="settings-container">
      <h1>Settings</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <Tab.Container id="settings-tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="users">
              <i className="bi bi-people me-2"></i>
              User Management
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="notifications">
              <i className="bi bi-bell me-2"></i>
              Notification Settings
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="logs">
              <i className="bi bi-journal-text me-2"></i>
              Notification Logs
            </Nav.Link>
          </Nav.Item>
        </Nav>
        
        <Tab.Content>
          <Tab.Pane eventKey="users">
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Users</h5>
                <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
                  <i className="bi bi-plus"></i> Add User
                </Button>
              </Card.Header>
              <Card.Body>
                {loading && users.length === 0 ? (
                  <div className="text-center p-5">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
                ) : (
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="text-center">
                            No users found. Add a user to get started.
                          </td>
                        </tr>
                      ) : (
                        users.map(user => (
                          <tr key={user.id}>
                            <td>{user.firstName} {user.lastName}</td>
                            <td>{user.email}</td>
                            <td>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowEditModal(true);
                                }}
                              >
                                <i className="bi bi-pencil"></i>
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Tab.Pane>
          
          <Tab.Pane eventKey="notifications">
            <NotificationSettings />
          </Tab.Pane>
          
          <Tab.Pane eventKey="logs">
            <NotificationLogs />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
      
      {/* Add User Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={addUser}>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={newUser.firstName}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={newUser.lastName}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add User'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <Form onSubmit={updateUser}>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={selectedUser.firstName}
                  onChange={handleEditChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={selectedUser.lastName}
                  onChange={handleEditChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={selectedUser.email}
                  onChange={handleEditChange}
                  required
                />
              </Form.Group>
              
              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
      
      {/* Delete User Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <p>Are you sure you want to delete the user <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>?</p>
              <p className="text-danger">This action cannot be undone.</p>
              
              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={deleteUser} disabled={loading}>
                  {loading ? 'Deleting...' : 'Delete User'}
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Settings;
