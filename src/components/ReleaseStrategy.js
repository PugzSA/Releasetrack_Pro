import React from 'react';
import { Card, Button, Table, Form } from 'react-bootstrap';
import './ReleaseStrategy.css';

const ReleaseStrategy = () => {
  return (
    <div className="release-strategy-container">
      <div className="page-header">
        <div>
          <h1>Release Strategy</h1>
          <p className="page-subtitle">Define and manage your release processes</p>
        </div>
        <Button variant="primary">
          <i className="bi bi-save"></i> Save Changes
        </Button>
      </div>

      <div className="row">
        <div className="col-md-6">
          <Card className="mb-4">
            <Card.Header>
              <h5>Release Cycle</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Release Frequency</Form.Label>
                  <Form.Select defaultValue="monthly">
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="custom">Custom</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Preferred Deployment Day</Form.Label>
                  <Form.Select defaultValue="wednesday">
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                    <option value="sunday">Sunday</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Development Lead Time (days)</Form.Label>
                  <Form.Control type="number" defaultValue="14" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Testing Period (days)</Form.Label>
                  <Form.Control type="number" defaultValue="7" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Stakeholder Review (days)</Form.Label>
                  <Form.Control type="number" defaultValue="3" />
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5>Naming Convention</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Release Name Format</Form.Label>
                  <Form.Select defaultValue="monthYear">
                    <option value="monthYear">Month Year (e.g., January 2024)</option>
                    <option value="yearMonth">Year-Month (e.g., 2024-01)</option>
                    <option value="version">Version Number (e.g., v1.0)</option>
                    <option value="custom">Custom</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Ticket ID Format</Form.Label>
                  <Form.Select defaultValue="prefix">
                    <option value="prefix">Prefix-Number (e.g., SUP-00001)</option>
                    <option value="date">Date-Number (e.g., 20240101-001)</option>
                    <option value="custom">Custom</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Ticket Prefix</Form.Label>
                  <Form.Control type="text" defaultValue="SUP" />
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-6">
          <Card className="mb-4">
            <Card.Header>
              <h5>Approval Workflow</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="checkbox"
                    id="requireTechReview"
                    label="Require Technical Review"
                    defaultChecked
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check 
                    type="checkbox"
                    id="requireBusinessReview"
                    label="Require Business Review"
                    defaultChecked
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check 
                    type="checkbox"
                    id="requireQaSignoff"
                    label="Require QA Signoff"
                    defaultChecked
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check 
                    type="checkbox"
                    id="requireStakeholderSignoff"
                    label="Require Stakeholder Signoff"
                    defaultChecked
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Approvers</Form.Label>
                  <div className="approvers-list">
                    <div className="approver-item">
                      <span>Technical Lead</span>
                      <Form.Control type="text" placeholder="Email" />
                    </div>
                    <div className="approver-item">
                      <span>Business Owner</span>
                      <Form.Control type="text" placeholder="Email" />
                    </div>
                    <div className="approver-item">
                      <span>QA Lead</span>
                      <Form.Control type="text" placeholder="Email" />
                    </div>
                    <div className="approver-item">
                      <span>Release Manager</span>
                      <Form.Control type="text" placeholder="Email" />
                    </div>
                  </div>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5>Notification Settings</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="checkbox"
                    id="notifyOnTicketCreation"
                    label="Notify on Ticket Creation"
                    defaultChecked
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check 
                    type="checkbox"
                    id="notifyOnReleaseCreation"
                    label="Notify on Release Creation"
                    defaultChecked
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check 
                    type="checkbox"
                    id="notifyOnMetadataChanges"
                    label="Notify on Metadata Changes"
                    defaultChecked
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check 
                    type="checkbox"
                    id="notifyOnApprovalRequired"
                    label="Notify on Approval Required"
                    defaultChecked
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check 
                    type="checkbox"
                    id="notifyOnDeployment"
                    label="Notify on Deployment"
                    defaultChecked
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email Template</Form.Label>
                  <Form.Select>
                    <option>Default Template</option>
                    <option>Minimal Template</option>
                    <option>Detailed Template</option>
                    <option>Custom Template</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReleaseStrategy;
