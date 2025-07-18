/**
 * Utility functions for handling ticket status display and styling
 */

/**
 * Get the correct CSS class for status badges
 * @param {string} status - The status string
 * @returns {string} - The CSS class name for the status badge
 */
export const getStatusClass = (status) => {
  if (!status) return "status-backlog";
  
  // Normalize the status string to match CSS class names
  const normalizedStatus = status
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/--+/g, "-"); // Replace multiple hyphens with single hyphen
  
  return `status-${normalizedStatus}`;
};

/**
 * Status color mapping for reference
 * This matches the CSS classes defined in Tickets.css and App.css
 */
export const STATUS_COLORS = {
  'Backlog': 'light grey',
  'Cancelled': 'red',
  'Requirements Gathering': 'yellow',
  'In Technical Design': 'yellow',
  'In Development': 'blue',
  'Blocked - User': 'red',
  'Blocked - Dev': 'red',
  'In Testing - Dev': 'light purple',
  'In Testing - UAT': 'light purple',
  'Ready For Release': 'green',
  'Released': 'green'
};

/**
 * Get all available status options
 * @returns {Array} - Array of status strings
 */
export const getAllStatuses = () => {
  return Object.keys(STATUS_COLORS);
};
