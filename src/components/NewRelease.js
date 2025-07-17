import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useApp } from '../context/AppContext';
import './NewRelease.css';

const NewRelease = () => {
  const navigate = useNavigate();
  const { addRelease } = useApp();
  
  const [formData, setFormData] = useState({
    name: '',
    version: '',
    target: '',
    status: 'planning',
    description: '',
    stakeholder_summary: ''
  });
  
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
      // Convert target date string to ISO format for database
      const formattedData = {
        ...formData,
        target: formData.target ? new Date(formData.target).toISOString().split('T')[0] : null
      };
      
      const newRelease = await addRelease(formattedData);
      setSuccess(true);
      
      // Reset form after successful submission
      setFormData({
        name: '',
        version: '',
        target: '',
        status: 'planning',
        description: '',
        stakeholder_summary: ''
      });
      
      // Redirect after short delay to show success message
      setTimeout(() => {
        navigate('/releases');
      }, 1500);
      
    } catch (err) {
      console.error('Error creating release:', err);
      setError(err.message || 'Failed to create release. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="new-release-container">
      <div className="page-header">
        <div>
          <h1>Create New Release</h1>
          <p className="page-subtitle">Add a new release to the system</p>
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
              Release created successfully! Redirecting to releases page...
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Release Name*</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. February 2024 Release"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Version</Form.Label>
              <Form.Control
                type="text"
                name="version"
                value={formData.version}
                onChange={handleChange}
                placeholder="e.g. v1.0"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Target Date</Form.Label>
              <Form.Control
                type="date"
                name="target"
                value={formData.target}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Status*</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="planning">Planning</option>
                <option value="development">Development</option>
                <option value="testing">Testing</option>
                <option value="ready">Ready for Deployment</option>
                <option value="deployed">Deployed</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Detailed description of this release"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Stakeholder Summary</Form.Label>
              <Form.Control
                as="textarea"
                name="stakeholder_summary"
                value={formData.stakeholder_summary}
                onChange={handleChange}
                rows={3}
                placeholder="Summary for stakeholders (business impact, key features, etc.)"
              />
            </Form.Group>
            
            <div className="form-actions">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/releases')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading || success}
              >
                {loading ? 'Creating...' : 'Create Release'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default NewRelease;
