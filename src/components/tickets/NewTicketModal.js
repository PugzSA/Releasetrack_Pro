import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const NewTicketModal = ({ show, onHide }) => {
  // Placeholder function for form submission
  const handleSave = () => {
    console.log('Saving new ticket...');
    onHide(); // Close modal after save
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Create New Ticket</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="ticketTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control type="text" placeholder="Enter ticket title" />
          </Form.Group>

          <Form.Group className="mb-3" controlId="ticketDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="Describe the issue or request" />
          </Form.Group>

          <p>Additional fields for status, type, priority, etc. will be added here.</p>

        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Ticket
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NewTicketModal;
