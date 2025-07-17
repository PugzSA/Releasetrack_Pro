import React, { useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { useApp } from '../../context/AppContext';

const DeleteTicketModal = ({ show, handleClose, ticket }) => {
  const { deleteTicket } = useApp();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await deleteTicket(ticket.id);
      handleClose();
    } catch (err) {
      console.error('Error deleting ticket:', err);
      setError(err.message || 'Failed to delete ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Delete Ticket</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}
        
        <p>Are you sure you want to delete ticket <strong>{ticket?.id}</strong>?</p>
        <p><strong>{ticket?.title}</strong></p>
        <p>This action cannot be undone.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="danger" 
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Delete Ticket'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteTicketModal;
