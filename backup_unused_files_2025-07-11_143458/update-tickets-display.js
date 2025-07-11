// This script will help you update the Tickets.js file to properly display both requester and assignee information
// Run this script with Node.js to update your Tickets.js file

const fs = require('fs');
const path = require('path');

// Path to the Tickets.js file
const ticketsFilePath = path.join(__dirname, 'src', 'components', 'tickets', 'Tickets.js');

// Read the file
fs.readFile(ticketsFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Create a backup of the original file
  fs.writeFile(`${ticketsFilePath}.backup`, data, 'utf8', (err) => {
    if (err) {
      console.error('Error creating backup file:', err);
      return;
    }
    console.log('Backup file created successfully');
  });

  // Update the "all" tab ticket display
  let updatedContent = data.replace(
    /<div className="ticket-details mt-3">\s*<div className="ticket-assignee">\s*<i className="bi bi-person"><\/i> Requested by: {ticket\.assignee \|\| 'Unassigned'}\s*<\/div>\s*<div className="ticket-support-area">/g,
    `<div className="ticket-details mt-3">
        <div className="ticket-requester">
          <i className="bi bi-person-circle"></i> Requested by: {getRequesterName(ticket)}
        </div>
        <div className="ticket-assignee">
          <i className="bi bi-person"></i> Assigned to: {getAssigneeName(ticket)}
        </div>
        <div className="ticket-support-area">`
  );

  // Update the "open" tab ticket display
  updatedContent = updatedContent.replace(
    /<div className="ticket-details mt-3">\s*<div className="ticket-assignee">\s*<i className="bi bi-person"><\/i> Requested by: {ticket\.assignee \|\| 'Unassigned'}\s*<\/div>\s*<div className="ticket-support-area">/g,
    `<div className="ticket-details mt-3">
        <div className="ticket-requester">
          <i className="bi bi-person-circle"></i> Requested by: {getRequesterName(ticket)}
        </div>
        <div className="ticket-assignee">
          <i className="bi bi-person"></i> Assigned to: {getAssigneeName(ticket)}
        </div>
        <div className="ticket-support-area">`
  );

  // Update the "completed" tab ticket display
  updatedContent = updatedContent.replace(
    /<div className="ticket-details mt-3">\s*<div className="ticket-assignee">\s*<i className="bi bi-person"><\/i> Requested by: {ticket\.assignee \|\| \(ticket\.assignee_id \? 'Loading\.\.\.' : 'Unassigned'\)}\s*<\/div>\s*<div className="ticket-support-area">/g,
    `<div className="ticket-details mt-3">
        <div className="ticket-requester">
          <i className="bi bi-person-circle"></i> Requested by: {getRequesterName(ticket)}
        </div>
        <div className="ticket-assignee">
          <i className="bi bi-person"></i> Assigned to: {getAssigneeName(ticket)}
        </div>
        <div className="ticket-support-area">`
  );

  // Update the "unassigned" tab ticket display
  updatedContent = updatedContent.replace(
    /<div className="ticket-details mt-3">\s*<div className="ticket-assignee">\s*<i className="bi bi-person"><\/i> Requested by: Unassigned\s*<\/div>\s*<div className="ticket-support-area">/g,
    `<div className="ticket-details mt-3">
        <div className="ticket-requester">
          <i className="bi bi-person-circle"></i> Requested by: {getRequesterName(ticket)}
        </div>
        <div className="ticket-assignee">
          <i className="bi bi-person"></i> Assigned to: Unassigned
        </div>
        <div className="ticket-support-area">`
  );

  // Write the updated content back to the file
  fs.writeFile(ticketsFilePath, updatedContent, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('Tickets.js updated successfully');
  });
});
