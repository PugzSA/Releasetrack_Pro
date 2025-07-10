$filePath = "c:\Windsurf\ReleaseTrack Pro\src\services\EmailService.js"
$content = Get-Content $filePath -Raw

# Add our validation helper function at the beginning of the class
$classStart = "class EmailService {"
$validationFunction = @"
  /**
   * Validates and extracts email addresses from recipient objects
   * @param {Array} recipients - Array of recipient objects with email property
   * @returns {Array} - Array of valid email addresses
   * @private
   */
  validateAndExtractEmails(recipients) {
    if (!recipients || recipients.length === 0) {
      console.warn('⚠️ No recipients provided for validation');
      return [];
    }
    
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

"@

$content = $content -replace "class EmailService \{", "class EmailService {`n$validationFunction"

# Fix the pattern where filteredRecipients.map(r => r.email) is used
$pattern = "to: filteredRecipients\.map\(r => r\.email\),"
$replacement = "to: this.validateAndExtractEmails(filteredRecipients),"

$content = $content -replace $pattern, $replacement

# Save the modified content back to the file
$content | Out-File $filePath -Encoding utf8

Write-Host "EmailService.js has been updated with email validation fixes."
