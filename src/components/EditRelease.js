import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useAppContext } from '../context/AppContext';
import './NewRelease.css'; // Reuse the same CSS

const EditRelease = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { releases, updateRelease, loading: contextLoading } = useAppContext();
  
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
  
  // Load release data when component mounts
  useEffect(() => {
    if (releases && releases.length > 0) {
      const releaseToEdit = releases.find(release => release.id === parseInt(id) || release.id === id);
      
      if (releaseToEdit) {
        // Format the target date if it exists
        const formattedTarget = releaseToEdit.target ? 
          (typeof releaseToEdit.target === 'string' ? 
            releaseToEdit.target.split('T')[0] : 
            new Date(releaseToEdit.target).toISOString().split('T')[0]) : 
          '';
          
        setFormData({
          name: releaseToEdit.name || '',
          version: releaseToEdit.version || '',
          target: formattedTarget,
          status: releaseToEdit.status || 'planning',
          description: releaseToEdit.description || '',
          stakeholder_summary: releaseToEdit.stakeholder_summary || releaseToEdit.stakeholderSummary || ''
        });
      } else {
        setError(`Release with ID ${id} not found`);
      }
    }
  }, [id, releases]);
  
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
      
      const updatedRelease = await updateRelease(id, formattedData);
      setSuccess(true);
      
      // Redirect after short delay to show success message
      setTimeout(() => {
        navigate('/releases');
      }, 1500);
      
    } catch (err) {
      console.error('Error updating release:', err);
      setError(err.message || 'Failed to update release. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (contextLoading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading release data...</p>
      </div>
    );
  }
  
  return (
    <div className="new-release-container">
      <div className="page-header">
        <div>
          <h1>Edit Release</h1>
          <p className="page-subtitle">Update release information</p>
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
              Release updated successfully! Redirecting to releases page...
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
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default EditRelease;
