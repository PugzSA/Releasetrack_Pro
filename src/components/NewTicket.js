import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Card, Alert, Row, Col } from "react-bootstrap";
import { useApp } from "../context/AppContext";
import {
  TICKET_TYPES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  TICKET_SUPPORT_AREAS,
} from "../constants/ticketFields";
import "./NewRelease.css"; // Reuse the same CSS

const NewTicket = () => {
  const navigate = useNavigate();
  const { createTicket, releases, supabase } = useApp();
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "Issue",
    priority: "Medium",
    status: "Backlog",
    supportArea: "CRM",
    assignee: "",
    assignee_id: null,
    requester: "",
    requester_id: null,
    release_id: "",
    testNotes: "",
  });

  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .order("lastName", { ascending: true });

        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
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
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Format the data for submission
      // Note: The ticket ID will be generated server-side by the database
      const formattedData = {
        ...formData,
        created_at: new Date().toISOString(),
        release_id: formData.release_id || null,
        assignee_id: formData.assignee_id
          ? parseInt(formData.assignee_id)
          : null,
        requester_id: formData.requester_id
          ? parseInt(formData.requester_id)
          : null,
      };

      // If we have an assignee_id, find the user to set the display name
      if (formattedData.assignee_id) {
        const selectedUser = users.find(
          (user) => user.id === parseInt(formData.assignee_id)
        );
        if (selectedUser) {
          formattedData.assignee = `${selectedUser.firstName} ${selectedUser.lastName}`;
        }
      } else {
        // Clear the assignee name if no ID is selected
        formattedData.assignee = "";
      }

      // If we have a requester_id, find the user to set the display name
      if (formattedData.requester_id) {
        const selectedRequester = users.find(
          (user) => user.id === parseInt(formData.requester_id)
        );
        if (selectedRequester) {
          formattedData.requester = `${selectedRequester.firstName} ${selectedRequester.lastName}`;
        }
      } else {
        // Clear the requester name if no ID is selected
        formattedData.requester = "";
      }

      // Submit the ticket
      await createTicket(formattedData);

      setSuccess(true);

      // Reset form after successful submission
      setTimeout(() => {
        navigate("/tickets");
      }, 1500); // Wait 1.5 seconds before redirecting
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="new-release-container">
      <Card className="new-release-card">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Create New Ticket</h2>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && (
            <Alert variant="success">
              Ticket created successfully! Redirecting...
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter a brief, descriptive title"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Provide a detailed description of the ticket"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    {TICKET_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    {TICKET_PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    {TICKET_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Support Area</Form.Label>
                  <Form.Select
                    name="supportArea"
                    value={formData.supportArea}
                    onChange={handleChange}
                  >
                    {TICKET_SUPPORT_AREAS.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Assignee</Form.Label>
                  <Form.Select
                    name="assignee_id"
                    value={formData.assignee_id || ""}
                    onChange={handleChange}
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Requester</Form.Label>
                  <Form.Select
                    name="requester_id"
                    value={formData.requester_id || ""}
                    onChange={handleChange}
                  >
                    <option value="">Not specified</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Release</Form.Label>
                  <Form.Select
                    name="release_id"
                    value={formData.release_id}
                    onChange={handleChange}
                  >
                    <option value="">None</option>
                    {releases &&
                      releases.map((release) => (
                        <option key={release.id} value={release.id}>
                          {release.name}{" "}
                          {release.version ? `(${release.version})` : ""}
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
                onClick={() => navigate("/tickets")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={loading || success}
              >
                {loading ? "Creating..." : "Create Ticket"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default NewTicket;
