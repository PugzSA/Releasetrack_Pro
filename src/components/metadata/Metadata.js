import React, { useState } from 'react';
import { Button, Tab, Nav, Form } from 'react-bootstrap';
import './Metadata.css';

const Metadata = () => {
  const [metadataItems, setMetadataItems] = useState([
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

  return (
    <div className="metadata-container">
      <div className="page-header">
        <div>
          <h1>Metadata Management</h1>
          <p className="page-subtitle">Track Salesforce components and deployment changes</p>
        </div>
        <Button variant="primary">
          <i className="bi bi-plus"></i> Add Metadata
        </Button>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="section-title">All Metadata Items</h2>

          <Tab.Container id="metadata-tabs" defaultActiveKey="all">
            <Nav variant="pills" className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="all">All (3)</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="create">Create (2)</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="update">Update (1)</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="delete">Delete (1)</Nav.Link>
              </Nav.Item>
            </Nav>

            <div className="filter-section mb-4">
              <div className="d-flex align-items-center">
                <i className="bi bi-funnel me-2"></i>
                <span>Filters:</span>
              </div>
              <div className="filter-options">
                <Form.Select className="filter-select">
                  <option>All Types</option>
                  <option>Apex Class</option>
                  <option>Custom Field</option>
                  <option>Validation Rule</option>
                </Form.Select>

                <Form.Select className="filter-select">
                  <option>All Actions</option>
                  <option>Create</option>
                  <option>Update</option>
                  <option>Delete</option>
                </Form.Select>

                <Form.Select className="filter-select">
                  <option>All Tickets</option>
                  <option>SUP-00001</option>
                </Form.Select>

                <Form.Select className="filter-select">
                  <option>All Releases</option>
                  <option>February 2024 Release</option>
                  <option>January 2024 Release</option>
                </Form.Select>
              </div>
            </div>

            <Tab.Content>
              <Tab.Pane eventKey="all">
                <div className="metadata-list">
                  {metadataItems.map(item => (
                    <div key={item.id} className="metadata-item">
                      <div className="metadata-header">
                        <div className="metadata-name-container">
                          <h4 className="metadata-name">{item.name}</h4>
                          <div className="metadata-badges">
                            <span className={`status-badge ${item.type.replace(' ', '-')}`}>{item.type}</span>
                            <span className={`status-badge ${item.action}`}>{item.action}</span>
                          </div>
                        </div>
                        <div className="metadata-actions">
                          <Button variant="link" className="btn-icon">
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button variant="link" className="btn-icon text-danger">
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </div>

                      <div className="metadata-info">
                        <span>Object: {item.object}</span>
                        <span>• {item.date}</span>
                      </div>

                      <div className="metadata-description mt-2">
                        {item.description}
                      </div>

                      {item.release && (
                        <div className="metadata-release mt-2">
                          <i className="bi bi-box"></i> Release: {item.release}
                        </div>
                      )}

                      <div className="technical-details mt-3">
                        <h6>Technical Details:</h6>
                        <p>{item.technicalDetails}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey="create">
                <div className="metadata-list">
                  {metadataItems.filter(item => item.action === 'create').map(item => (
                    <div key={item.id} className="metadata-item">
                      <div className="metadata-header">
                        <div className="metadata-name-container">
                          <h4 className="metadata-name">{item.name}</h4>
                          <div className="metadata-badges">
                            <span className={`status-badge ${item.type.replace(' ', '-')}`}>{item.type}</span>
                            <span className={`status-badge ${item.action}`}>{item.action}</span>
                          </div>
                        </div>
                        <div className="metadata-actions">
                          <Button variant="link" className="btn-icon">
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button variant="link" className="btn-icon text-danger">
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </div>

                      <div className="metadata-info">
                        <span>Object: {item.object}</span>
                        <span>• {item.date}</span>
                      </div>

                      <div className="metadata-description mt-2">
                        {item.description}
                      </div>

                      {item.release && (
                        <div className="metadata-release mt-2">
                          <i className="bi bi-box"></i> Release: {item.release}
                        </div>
                      )}

                      <div className="technical-details mt-3">
                        <h6>Technical Details:</h6>
                        <p>{item.technicalDetails}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey="update">
                <div className="metadata-list">
                  {metadataItems.filter(item => item.action === 'update').map(item => (
                    <div key={item.id} className="metadata-item">
                      <div className="metadata-header">
                        <div className="metadata-name-container">
                          <h4 className="metadata-name">{item.name}</h4>
                          <div className="metadata-badges">
                            <span className={`status-badge ${item.type.replace(' ', '-')}`}>{item.type}</span>
                            <span className={`status-badge ${item.action}`}>{item.action}</span>
                          </div>
                        </div>
                        <div className="metadata-actions">
                          <Button variant="link" className="btn-icon">
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button variant="link" className="btn-icon text-danger">
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </div>

                      <div className="metadata-info">
                        <span>Object: {item.object}</span>
                        <span>• {item.date}</span>
                      </div>

                      <div className="metadata-description mt-2">
                        {item.description}
                      </div>

                      {item.release && (
                        <div className="metadata-release mt-2">
                          <i className="bi bi-box"></i> Release: {item.release}
                        </div>
                      )}

                      <div className="technical-details mt-3">
                        <h6>Technical Details:</h6>
                        <p>{item.technicalDetails}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey="delete">
                <div className="metadata-list">
                  {metadataItems.filter(item => item.action === 'delete').map(item => (
                    <div key={item.id} className="metadata-item">
                      <div className="metadata-header">
                        <div className="metadata-name-container">
                          <h4 className="metadata-name">{item.name}</h4>
                          <div className="metadata-badges">
                            <span className={`status-badge ${item.type.replace(' ', '-')}`}>{item.type}</span>
                            <span className={`status-badge ${item.action}`}>{item.action}</span>
                          </div>
                        </div>
                        <div className="metadata-actions">
                          <Button variant="link" className="btn-icon">
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button variant="link" className="btn-icon text-danger">
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </div>

                      <div className="metadata-info">
                        <span>Object: {item.object}</span>
                        <span>• {item.date}</span>
                      </div>

                      <div className="metadata-description mt-2">
                        {item.description}
                      </div>

                      {item.release && (
                        <div className="metadata-release mt-2">
                          <i className="bi bi-box"></i> Release: {item.release}
                        </div>
                      )}

                      <div className="technical-details mt-3">
                        <h6>Technical Details:</h6>
                        <p>{item.technicalDetails}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </div>
      </div>
    </div>
  );
};

export default Metadata;
