import React, { useState, useEffect } from "react";
import { X, User } from "lucide-react";
import { useApp } from "../../context/AppContext";
import NotificationToast from "../common/NotificationToast";
import "./Tickets.css";

const EditTicketModal = ({ show, handleClose, ticket, onTicketUpdate }) => {
  const { updateTicket, releases, supabase } = useApp();
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "Issue",
    priority: "Medium",
    status: "Open",
    supportArea: "CRM",
    assignee: "",
    assignee_id: null,
    requester: "",
    requester_id: null,
    release_id: "",
    solutionNotes: "",
    testNotes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    variant: "success",
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

    if (supabase) {
      fetchUsers();
    }
  }, [supabase]);

  // Update form data when ticket changes
  useEffect(() => {
    if (ticket) {
      setFormData({
        title: ticket.title || "",
        description: ticket.description || ticket.businessImpact || "",
        type: ticket.type || "Issue",
        priority: ticket.priority || "Medium",
        status: ticket.status || "Open",
        supportArea: ticket.supportArea || "CRM",
        assignee: ticket.assignee || "",
        assignee_id: ticket.assignee_id || null,
        requester: ticket.requester || "",
        requester_id: ticket.requester_id || null,
        release_id: ticket.release_id || "",
        solutionNotes: ticket.solutionnotes || "",
        testNotes: ticket.testNotes || "",
      });
    }
  }, [ticket]);

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

    try {
      // Format the data for submission
      const formattedData = {
        ...formData,
        // Keep release_id as string (RELEASE-X format)
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

      const updatedTicket = await updateTicket(ticket.id, formattedData);

      // Call the onTicketUpdate callback if provided
      if (onTicketUpdate && typeof onTicketUpdate === "function") {
        onTicketUpdate({ ...ticket, ...formattedData });
      }

      // Show notification if status was changed
      if (ticket.status !== formattedData.status) {
        setNotification({
          show: true,
          message: `Email notification sent for ticket status change: ${ticket.status} → ${formattedData.status}`,
          variant: "info",
        });
      }

      // Close modal immediately after successful update
      handleClose();
      setSuccess(false);
    } catch (err) {
      console.error("Error updating ticket:", err);
      setError(err.message || "Failed to update ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <NotificationToast
        show={notification.show}
        message={notification.message}
        variant={notification.variant}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      <div className="ticket-modal-backdrop" onClick={handleClose}>
        <div
          className="ticket-modal-modern"
          onClick={(e) => e.stopPropagation()}
          style={{ position: "relative" }}
        >
          {/* Full-screen loading overlay */}
          {loading && (
            <div className="ticket-modal-loading-overlay">
              <div className="ticket-modal-loading-spinner">
                <div className="loader"></div>
                <p className="loading-text">Updating ticket...</p>
              </div>
            </div>
          )}
          <button onClick={handleClose} className="ticket-modal-close-btn">
            <X size={20} />
          </button>

          {/* Header with gradient background matching main modal */}
          <div className="ticket-modal-header">
            <div>
              <div className="ticket-modal-id">{ticket?.id}</div>
              <h2 className="ticket-modal-title">
                {formData.title || "Edit Ticket"}
              </h2>
            </div>
          </div>

          {/* Modal Body */}
          <div className="ticket-modal-body-modern">
            {error && (
              <div className="alert alert-danger mb-3" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success mb-3" role="alert">
                Ticket updated successfully!
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Row 1: Ticket ID & Title */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="ticket-modal-field">
                    <label className="ticket-modal-label">Ticket ID</label>
                    <input
                      type="text"
                      className="ticket-modal-input"
                      value={ticket?.id || ""}
                      disabled
                      style={{ backgroundColor: "#f8f9fa", color: "#6c757d" }}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="ticket-modal-field">
                    <label className="ticket-modal-label">Title*</label>
                    <input
                      type="text"
                      name="title"
                      className="ticket-modal-input"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter ticket title"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Requester & Assignee */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="ticket-modal-field">
                    <label className="ticket-modal-label">Requester:</label>
                    <div className="d-flex align-items-center">
                      <User size={16} className="me-2 text-muted" />
                      <select
                        className="ticket-modal-select-with-icon"
                        name="requester_id"
                        value={formData.requester_id || ""}
                        onChange={handleChange}
                      >
                        <option
                          value=""
                          disabled
                          style={{ fontStyle: "italic" }}
                        >
                          Please select...
                        </option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <small className="text-muted">
                      Who requested this ticket
                    </small>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="ticket-modal-field">
                    <label className="ticket-modal-label">Assignee:</label>
                    <div className="d-flex align-items-center">
                      <User size={16} className="me-2 text-muted" />
                      <select
                        className="ticket-modal-select-with-icon"
                        name="assignee_id"
                        value={formData.assignee_id || ""}
                        onChange={handleChange}
                      >
                        <option
                          value=""
                          disabled
                          style={{ fontStyle: "italic" }}
                        >
                          Please select...
                        </option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <small className="text-muted">
                      Who is working on this ticket
                    </small>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="ticket-modal-field mb-4">
                <label className="ticket-modal-label">Description</label>
                <textarea
                  name="description"
                  className="ticket-modal-textarea"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Detailed description of this ticket"
                />
              </div>

              {/* Row 3: Type, Priority, Status */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <div className="ticket-modal-field">
                    <label className="ticket-modal-label">Type*</label>
                    <select
                      className="ticket-modal-select"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                    >
                      <option value="Enhancement">Enhancement</option>
                      <option value="Issue">Issue</option>
                      <option value="New Feature">New Feature</option>
                      <option value="Request">Request</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="ticket-modal-field">
                    <label className="ticket-modal-label">Priority*</label>
                    <select
                      className="ticket-modal-select"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      required
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="ticket-modal-field">
                    <label className="ticket-modal-label">Status*</label>
                    <select
                      className="ticket-modal-select"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                    >
                      <option value="Backlog">Backlog</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Requirements Gathering">
                        Requirements Gathering
                      </option>
                      <option value="In Technical Design">
                        In Technical Design
                      </option>
                      <option value="In Development">In Development</option>
                      <option value="Blocked - User">Blocked - User</option>
                      <option value="Blocked - Dev">Blocked - Dev</option>
                      <option value="In Testing - Dev">In Testing - Dev</option>
                      <option value="In Testing - UAT">In Testing - UAT</option>
                      <option value="Ready For Release">
                        Ready For Release
                      </option>
                      <option value="Released">Released</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 4: Support Area & Release */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="ticket-modal-field">
                    <label className="ticket-modal-label">Support Area*</label>
                    <select
                      className="ticket-modal-select"
                      name="supportArea"
                      value={formData.supportArea}
                      onChange={handleChange}
                      required
                    >
                      <option value="CRM">CRM</option>
                      <option value="Customer Support">Customer Support</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="ticket-modal-field">
                    <label className="ticket-modal-label">Release</label>
                    <select
                      className="ticket-modal-select"
                      name="release_id"
                      value={formData.release_id}
                      onChange={handleChange}
                    >
                      <option value="">Select Release</option>
                      {releases &&
                        releases.map((release) => (
                          <option key={release.id} value={release.id}>
                            {release.name}{" "}
                            {release.version ? `(${release.version})` : ""}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Solution Notes */}
              <div className="ticket-modal-field mb-4">
                <label className="ticket-modal-label">Solution Notes</label>
                <textarea
                  name="solutionNotes"
                  className="ticket-modal-textarea"
                  value={formData.solutionNotes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Add any notes related to the solution of this ticket"
                />
                <small className="text-muted">
                  Add any notes related to the solution of this ticket
                </small>
              </div>

              {/* Test Notes */}
              <div className="ticket-modal-field mb-4">
                <label className="ticket-modal-label">Test Notes</label>
                <textarea
                  name="testNotes"
                  className="ticket-modal-textarea"
                  value={formData.testNotes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Notes related to testing of this ticket"
                />
                <small className="text-muted">
                  Add any notes related to testing requirements or results
                </small>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="ticket-modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading || success}
            >
              Update Ticket
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditTicketModal;
