// This file contains code snippets to update the Tickets.js component
// to display both requester and assignee information

// 1. Add this helper function after the getAssigneeName function:
const getRequesterName = (ticket) => {
  if (ticket.requester) return ticket.requester;
  if (ticket.requester_id) {
    // In a real implementation, we would fetch the user details here
    // or have them available in a users state variable
    return `User ID: ${ticket.requester_id}`;
  }
  return 'Not specified';
};

// 2. Replace the ticket-details div in the "all" tab with this:
<div className="ticket-details mt-3">
  <div className="ticket-requester">
    <i className="bi bi-person-circle"></i> Requested by: {getRequesterName(ticket)}
  </div>
  <div className="ticket-assignee">
    <i className="bi bi-person"></i> Assigned to: {getAssigneeName(ticket)}
  </div>
  <div className="ticket-support-area">
    <i className="bi bi-headset"></i> Support Area: {ticket.supportArea || 'Not specified'}
  </div>
  <div className="ticket-release">
    <i className="bi bi-box"></i> Release: {getReleaseName(ticket.release_id)}
  </div>
</div>

// 3. Also replace the ticket-details div in the "open", "completed", and "unassigned" tabs with the same code

// 4. Update the applyFilters function to include filtering by requester_id:
const applyFilters = (tickets) => {
  return tickets.filter(ticket => {
    // Status filter
    if (filters.status !== 'All Status' && ticket.status !== filters.status) {
      return false;
    }
    
    // Type filter
    if (filters.type !== 'All Types' && ticket.type !== filters.type) {
      return false;
    }
    
    // Priority filter
    if (filters.priority !== 'All Priority' && ticket.priority !== filters.priority) {
      return false;
    }
    
    // Support Area filter
    if (filters.supportArea !== 'All Support Areas' && ticket.supportArea !== filters.supportArea) {
      return false;
    }
    
    // Release filter
    if (filters.release !== 'All Releases') {
      // Filter by release_id (which is now stored as a number in the database)
      if (ticket.release_id !== parseInt(filters.release)) {
        return false;
      }
    }
    
    return true;
  });
};
