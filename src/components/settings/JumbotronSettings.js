import React, { useState, useEffect } from "react";
import { Card, Form, Button, Alert, Spinner, Table, Modal } from "react-bootstrap";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { useApp } from "../../context/AppContext";

const JumbotronSettings = () => {
  const { supabase } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);

  // Form state for new/edit message
  const [formData, setFormData] = useState({
    message: "",
    is_active: true,
    display_order: 0,
    background_color: "#007bff",
    text_color: "#ffffff",
  });

  // Fetch jumbotron messages
  useEffect(() => {
    fetchMessages();
  }, [supabase]);

  const fetchMessages = async () => {
    if (!supabase) return;

    try {
      setLoading(true);
      setError(null);

      const { data: messagesData, error: messagesError } = await supabase
        .from("jumbotron_messages")
        .select("*")
        .order("display_order", { ascending: true });

      if (messagesError) {
        throw messagesError;
      }

      setMessages(messagesData || []);
    } catch (err) {
      console.error("Error fetching jumbotron messages:", err);
      setError("Failed to load jumbotron messages. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Open modal for new message
  const handleNewMessage = () => {
    setEditingMessage(null);
    setFormData({
      message: "",
      is_active: true,
      display_order: messages.length + 1,
      background_color: "#007bff",
      text_color: "#ffffff",
    });
    setShowModal(true);
  };

  // Open modal for editing message
  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setFormData({
      message: message.message,
      is_active: message.is_active,
      display_order: message.display_order,
      background_color: message.background_color,
      text_color: message.text_color,
    });
    setShowModal(true);
  };

  // Save message (create or update)
  const handleSaveMessage = async () => {
    if (!formData.message.trim()) {
      setError("Message text is required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (editingMessage) {
        // Update existing message
        const { error: updateError } = await supabase
          .from("jumbotron_messages")
          .update({
            message: formData.message.trim(),
            is_active: formData.is_active,
            display_order: parseInt(formData.display_order),
            background_color: formData.background_color,
            text_color: formData.text_color,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingMessage.id);

        if (updateError) throw updateError;
      } else {
        // Create new message
        const { error: insertError } = await supabase
          .from("jumbotron_messages")
          .insert({
            message: formData.message.trim(),
            is_active: formData.is_active,
            display_order: parseInt(formData.display_order),
            background_color: formData.background_color,
            text_color: formData.text_color,
          });

        if (insertError) throw insertError;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setShowModal(false);
      fetchMessages();
    } catch (err) {
      console.error("Error saving jumbotron message:", err);
      setError("Failed to save message. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from("jumbotron_messages")
        .delete()
        .eq("id", messageId);

      if (deleteError) throw deleteError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchMessages();
    } catch (err) {
      console.error("Error deleting jumbotron message:", err);
      setError("Failed to delete message. Please try again.");
    }
  };

  // Toggle message active status
  const handleToggleActive = async (message) => {
    try {
      const { error: updateError } = await supabase
        .from("jumbotron_messages")
        .update({
          is_active: !message.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", message.id);

      if (updateError) throw updateError;

      fetchMessages();
    } catch (err) {
      console.error("Error toggling message status:", err);
      setError("Failed to update message status. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Jumbotron Messages</h5>
        <Button variant="primary" size="sm" onClick={handleNewMessage}>
          <Plus size={16} className="me-1" />
          Add Message
        </Button>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && (
          <Alert variant="success">
            Jumbotron message saved successfully!
          </Alert>
        )}

        {messages.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted">No jumbotron messages configured.</p>
            <Button variant="primary" onClick={handleNewMessage}>
              <Plus size={16} className="me-1" />
              Add Your First Message
            </Button>
          </div>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Order</th>
                <th>Message</th>
                <th>Status</th>
                <th>Colors</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr key={message.id}>
                  <td>{message.display_order}</td>
                  <td>
                    <div className="message-preview">
                      {message.message.length > 100
                        ? `${message.message.substring(0, 100)}...`
                        : message.message}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        message.is_active ? "bg-success" : "bg-secondary"
                      }`}
                    >
                      {message.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="color-preview"
                        style={{
                          backgroundColor: message.background_color,
                          color: message.text_color,
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      >
                        Sample
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleToggleActive(message)}
                        title={message.is_active ? "Deactivate" : "Activate"}
                      >
                        {message.is_active ? (
                          <EyeOff size={14} />
                        ) : (
                          <Eye size={14} />
                        )}
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEditMessage(message)}
                        title="Edit"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteMessage(message.id)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Message Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {editingMessage ? "Edit Message" : "Add New Message"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Message Text *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Enter your announcement message..."
                />
              </Form.Group>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Display Order</Form.Label>
                    <Form.Control
                      type="number"
                      name="display_order"
                      value={formData.display_order}
                      onChange={handleInputChange}
                      min="1"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      name="is_active"
                      label="Active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Background Color</Form.Label>
                    <Form.Control
                      type="color"
                      name="background_color"
                      value={formData.background_color}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Text Color</Form.Label>
                    <Form.Control
                      type="color"
                      name="text_color"
                      value={formData.text_color}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </div>
              </div>

              {/* Preview */}
              <Form.Group className="mb-3">
                <Form.Label>Preview</Form.Label>
                <div
                  className="p-3 rounded"
                  style={{
                    backgroundColor: formData.background_color,
                    color: formData.text_color,
                    textAlign: "center",
                  }}
                >
                  {formData.message || "Your message will appear here..."}
                </div>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveMessage}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Message"}
            </Button>
          </Modal.Footer>
        </Modal>
      </Card.Body>
    </Card>
  );
};

export default JumbotronSettings;
