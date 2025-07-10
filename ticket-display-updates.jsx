// This file contains the updated ticket display sections for the Tickets.js component
// Copy and paste these sections into your Tickets.js file to replace the existing ticket display sections

// 1. For the "all" tab (around line 283-293):
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

// 2. For the "open" tab (around line 373-383):
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

// 3. For the "completed" tab (around line 474-484):
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

// 4. For the "unassigned" tab (around line 574-584):
<div className="ticket-details mt-3">
  <div className="ticket-requester">
    <i className="bi bi-person-circle"></i> Requested by: {getRequesterName(ticket)}
  </div>
  <div className="ticket-assignee">
    <i className="bi bi-person"></i> Assigned to: Unassigned
  </div>
  <div className="ticket-support-area">
    <i className="bi bi-headset"></i> Support Area: {ticket.supportArea || 'Not specified'}
  </div>
  <div className="ticket-release">
    <i className="bi bi-box"></i> Release: {getReleaseName(ticket.release_id)}
  </div>
</div>
