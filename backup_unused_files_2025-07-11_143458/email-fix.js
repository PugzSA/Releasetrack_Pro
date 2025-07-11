// This is a helper function to validate and extract email addresses
// It will be used in both sendTicketStatusChangeEmail and sendAssigneeChangeEmail methods

/**
 * Validates and extracts email addresses from recipient objects
 * @param {Array} recipients - Array of recipient objects with email property
 * @returns {Array} - Array of valid email addresses
 */
function validateAndExtractEmails(recipients) {
  if (!recipients || recipients.length === 0) {
    console.warn('No recipients provided for validation');
    return [];
  }
  
  // Log the original recipients for debugging
  console.log('🔍 Recipients before validation:', recipients);
  
  // Filter and extract valid email addresses
  const validEmails = recipients
    .filter(r => r && typeof r === 'object')
    .map(r => {
      if (!r.email) {
        console.warn(`⚠️ Recipient missing email property:`, r);
        return null;
      }
      if (typeof r.email !== 'string') {
        console.warn(`⚠️ Recipient email is not a string:`, r.email);
        return null;
      }
      if (!r.email.includes('@')) {
        console.warn(`⚠️ Invalid email format (missing @):`, r.email);
        return null;
      }
      return r.email;
    })
    .filter(email => email !== null);
  
  console.log('✅ Valid emails after validation:', validEmails);
  
  return validEmails;
}

// Export the helper function
module.exports = { validateAndExtractEmails };
