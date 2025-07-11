// This file contains the code changes needed for the Tickets.js component
// to properly display both requester and assignee information

// 1. First, add this helper function to get the requester name
// Add this after the existing getAssigneeName function
const getRequesterName = (ticket) => {
  if (ticket.requester) return ticket.requester;
  if (ticket.requester_id) {
    // In a real implementation, we would fetch the user details here
    // or have them available in a users state variable
    return `User ID: ${ticket.requester_id}`;
  }
  return 'Not specified';
};

// 2. Replace the ticket display section in the "all" tab with this code
// Look for the section that displays the ticket details (around line 270-290)
<div key={ticket.id} className="ticket-item">
  <div className="ticket-header">
    <h5 className="ticket-title">{ticket.title}</h5>
    <div className="ticket-badges">
      <span className="status-badge bug">{ticket.type}</span>
      <span className="status-badge high">{ticket.priority}</span>
    </div>
  </div>
  <div className="ticket-id">{ticket.id} • {ticket.date || new Date(ticket.created_at).toLocaleDateString()}</div>
  
  <div className="ticket-details mt-3">
    <div className="ticket-requester">
      <i className="bi bi-person-circle"></i> Requested by: {ticket.requester || 'Not specified'}
    </div>
    <div className="ticket-assignee">
      <i className="bi bi-person"></i> Assigned to: {ticket.assignee || 'Unassigned'}
    </div>
    <div className="ticket-support-area">
      <i className="bi bi-headset"></i> Support Area: {ticket.supportArea || 'Not specified'}
    </div>
    <div className="ticket-release">
      <i className="bi bi-box"></i> Release: {getReleaseName(ticket.release_id)}
    </div>
  </div>

  <div className="ticket-detail mt-3">
    <h6><i className="bi bi-card-text me-2"></i>Description:</h6>
    <p>{ticket.description || 'No details provided'}</p>
  </div>

  {ticket.testNotes && ticket.testNotes.trim() !== '' && (
    <div className="ticket-test-notes mt-3">
      <h6><i className="bi bi-clipboard-check me-2"></i>Test Notes:</h6>
      <p>{ticket.testNotes}</p>
    </div>
  )}

  <div className="ticket-actions">
    <span className={`status-badge ${(ticket.status?.toLowerCase() || 'open').replace(/\s+/g, '-')}`}>{ticket.status || 'Open'}</span>
    <div className="action-buttons">
      <button 
        className="btn btn-link"
        onClick={() => {
          setSelectedTicket(ticket);
          setShowEditModal(true);
        }}
      >
        <i className="bi bi-pencil"></i>
      </button>
      <button 
        className="btn btn-link text-danger"
        onClick={() => {
          setSelectedTicket(ticket);
          setShowDeleteModal(true);
        }}
      >
        <i className="bi bi-trash"></i>
      </button>
    </div>
  </div>
</div>

// 3. You'll need to make similar changes to the other tabs (open, completed, unassigned)
// Look for similar ticket display code in those tabs and update them in the same way
