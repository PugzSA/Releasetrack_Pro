// Node.js script to update the Tickets.js file to display both requester and assignee information
const fs = require('fs');
const path = require('path');

// Path to the Tickets.js file
const ticketsFilePath = path.join(__dirname, 'src', 'components', 'tickets', 'Tickets.js');

// Read the file content
let content = fs.readFileSync(ticketsFilePath, 'utf8');

// Create a backup of the original file
fs.writeFileSync(`${ticketsFilePath}.backup`, content, 'utf8');
console.log(`Created backup at ${ticketsFilePath}.backup`);

// Function to update the ticket display section
function updateTicketDisplay(content) {
  // Regular expression to match the ticket display section
  const regex = /<div className="ticket-details mt-3">\s*<div className="ticket-assignee">\s*<i className="bi bi-person"><\/i> Requested by: \{(.*?)\}\s*<\/div>/gs;
  
  // Replace with the updated ticket display section
  return content.replace(regex, 
    `<div className="ticket-details mt-3">
        <div className="ticket-requester">
          <i className="bi bi-person-circle"></i> Requested by: {getRequesterName(ticket)}
        </div>
        <div className="ticket-assignee">
          <i className="bi bi-person"></i> Assigned to: {$1}
        </div>`);
}

// Update the content
const updatedContent = updateTicketDisplay(content);

// Write the updated content back to the file
fs.writeFileSync(ticketsFilePath, updatedContent, 'utf8');
console.log(`Updated ${ticketsFilePath} with requester and assignee information`);

console.log('Done! Please check the file to ensure the changes were made correctly.');
