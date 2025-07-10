import React, { useState } from 'react';
import { Form, Button, Card, Table } from 'react-bootstrap';
import './Reports.css';

const Reports = () => {
  const [reportType, setReportType] = useState('release');
  
  return (
    <div className="reports-container">
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p className="page-subtitle">Generate insights and analytics for stakeholders</p>
        </div>
        <Button variant="primary">
          <i className="bi bi-download"></i> Export Report
        </Button>
      </div>

      <div className="report-filters card">
        <div className="card-body">
          <h5>Report Filters</h5>
          <div className="filter-row">
            <Form.Group className="mb-3">
              <Form.Label>Report Type</Form.Label>
              <Form.Select 
                value={reportType} 
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="release">Release Summary</option>
                <option value="ticket">Ticket Analysis</option>
                <option value="metadata">Metadata Changes</option>
                <option value="timeline">Deployment Timeline</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Time Period</Form.Label>
              <Form.Select>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>Last 6 months</option>
                <option>Last year</option>
                <option>Custom range</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Release</Form.Label>
              <Form.Select>
                <option>All Releases</option>
                <option>February 2024 Release</option>
                <option>January 2024 Release</option>
              </Form.Select>
            </Form.Group>
          </div>

          <div className="d-flex justify-content-end">
            <Button variant="primary">
              Generate Report
            </Button>
          </div>
        </div>
      </div>

      {reportType === 'release' && (
        <div className="report-content">
          <Card className="mb-4">
            <Card.Header>
              <h5>Release Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="report-stats">
                <div className="stat-item">
                  <h3>2</h3>
                  <p>Total Releases</p>
                </div>
                <div className="stat-item">
                  <h3>1</h3>
                  <p>Completed</p>
                </div>
                <div className="stat-item">
                  <h3>1</h3>
                  <p>In Progress</p>
                </div>
                <div className="stat-item">
                  <h3>0</h3>
                  <p>Delayed</p>
                </div>
              </div>

              <div className="chart-container">
                <div className="chart-placeholder">
                  <p>Release Status Distribution Chart</p>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5>Release Details</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Release Name</th>
                    <th>Target Date</th>
                    <th>Status</th>
                    <th>Tickets</th>
                    <th>Metadata Items</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>February 2024 Release</td>
                    <td>Feb 28, 2024</td>
                    <td><span className="status-badge testing">testing</span></td>
                    <td>1</td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td>January 2024 Release</td>
                    <td>Jan 31, 2024</td>
                    <td><span className="status-badge development">development</span></td>
                    <td>0</td>
                    <td>0</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>
      )}

      {reportType === 'ticket' && (
        <div className="report-content">
          <Card className="mb-4">
            <Card.Header>
              <h5>Ticket Analysis</h5>
            </Card.Header>
            <Card.Body>
              <div className="report-stats">
                <div className="stat-item">
                  <h3>1</h3>
                  <p>Total Tickets</p>
                </div>
                <div className="stat-item">
                  <h3>1</h3>
                  <p>Bugs</p>
                </div>
                <div className="stat-item">
                  <h3>0</h3>
                  <p>Enhancements</p>
                </div>
                <div className="stat-item">
                  <h3>0</h3>
                  <p>Features</p>
                </div>
              </div>

              <div className="chart-container">
                <div className="chart-placeholder">
                  <p>Ticket Type Distribution Chart</p>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5>Ticket Details</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Release</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>SUP-00001</td>
                    <td>Email not sending</td>
                    <td><span className="status-badge bug">bug</span></td>
                    <td><span className="status-badge high">high</span></td>
                    <td><span className="status-badge open">open</span></td>
                    <td>February 2024 Release</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>
      )}

      {reportType === 'metadata' && (
        <div className="report-content">
          <Card className="mb-4">
            <Card.Header>
              <h5>Metadata Changes</h5>
            </Card.Header>
            <Card.Body>
              <div className="report-stats">
                <div className="stat-item">
                  <h3>3</h3>
                  <p>Total Changes</p>
                </div>
                <div className="stat-item">
                  <h3>1</h3>
                  <p>Created</p>
                </div>
                <div className="stat-item">
                  <h3>1</h3>
                  <p>Updated</p>
                </div>
                <div className="stat-item">
                  <h3>1</h3>
                  <p>Deleted</p>
                </div>
              </div>

              <div className="chart-container">
                <div className="chart-placeholder">
                  <p>Metadata Changes by Type Chart</p>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5>Metadata Details</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Action</th>
                    <th>Object</th>
                    <th>Date</th>
                    <th>Release</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Customer_Portal_Access_c</td>
                    <td>apex class</td>
                    <td><span className="status-badge create">create</span></td>
                    <td>Case</td>
                    <td>Jul 3, 2023</td>
                    <td>-</td>
                  </tr>
                  <tr>
                    <td>Customer_Portal_Access_c</td>
                    <td>custom field</td>
                    <td><span className="status-badge delete">delete</span></td>
                    <td>Account</td>
                    <td>Jul 7, 2023</td>
                    <td>February 2024 Release</td>
                  </tr>
                  <tr>
                    <td>OrderValidationRule</td>
                    <td>validation rule</td>
                    <td><span className="status-badge update">update</span></td>
                    <td>Order</td>
                    <td>Jul 7, 2023</td>
                    <td>February 2024 Release</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>
      )}

      {reportType === 'timeline' && (
        <div className="report-content">
          <Card>
            <Card.Header>
              <h5>Deployment Timeline</h5>
            </Card.Header>
            <Card.Body>
              <div className="timeline-container">
                <div className="timeline-placeholder">
                  <p>Deployment Timeline Chart</p>
                </div>
                <div className="timeline-legend">
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#1976d2' }}></span>
                    <span>Development</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#fbc02d' }}></span>
                    <span>Testing</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#43a047' }}></span>
                    <span>Production</span>
                  </div>
                </div>
              </div>

              <Table responsive className="mt-4">
                <thead>
                  <tr>
                    <th>Release</th>
                    <th>Development Start</th>
                    <th>Testing Start</th>
                    <th>Production Deploy</th>
                    <th>Duration (days)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>February 2024 Release</td>
                    <td>Jan 15, 2024</td>
                    <td>Feb 10, 2024</td>
                    <td>Feb 28, 2024</td>
                    <td>44</td>
                  </tr>
                  <tr>
                    <td>January 2024 Release</td>
                    <td>Dec 15, 2023</td>
                    <td>Jan 20, 2024</td>
                    <td>Jan 31, 2024</td>
                    <td>47</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reports;
