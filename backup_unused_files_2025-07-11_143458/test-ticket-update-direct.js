// Test script to directly test the EmailService without importing it
require('dotenv').config();
const { Resend } = require('resend');

// Initialize Resend with API key
const resendApiKey = process.env.REACT_APP_RESEND_API_KEY;
const resend = new Resend(resendApiKey);

// Email configuration
const fromEmail = process.env.REACT_APP_EMAIL_FROM || 'onboarding@resend.dev';
const toEmail = 'kyle.cockcroft@watchmakergenomics.com';

// Sample ticket data
const sampleTicket = {
  id: 'ticket-123',
  title: 'Test Ticket',
  description: 'This is a test ticket to verify email notifications',
  status: 'in_progress',
  assignee: 'user-1',
  requester: 'user-2',
  priority: 'medium',
  created_at: new Date().toISOString()
};

// Send a ticket status change notification email
async function sendTicketStatusChangeEmail() {
  console.log('🎫 Sending ticket status change notification...');
  
  try {
    // Generate HTML content
    const ticketUrl = `https://releasetrackpro.com/tickets/${sampleTicket.id}`;
    const previousStatus = 'open';
    const newStatus = sampleTicket.status;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #0066cc;
            color: white;
            padding: 10px 20px;
            border-radius: 5px 5px 0 0;
          }
          .content {
            padding: 20px;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 5px 5px;
          }
          .button {
            display: inline-block;
            background-color: #0066cc;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
          .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Ticket Status Updated</h2>
        </div>
        <div class="content">
          <p>The status for ticket <strong>${sampleTicket.id}: ${sampleTicket.title}</strong> has been updated.</p>
          <p><strong>Previous Status:</strong> ${previousStatus}</p>
          <p><strong>New Status:</strong> ${newStatus}</p>
          <p><strong>Updated by:</strong> Kyle Cockcroft</p>
          
          <a href="${ticketUrl}" class="button">View Ticket</a>
          
          <p>Thank you for using ReleaseTrack Pro.</p>
        </div>
        <div class="footer">
          <p>This is an automated message from ReleaseTrack Pro. Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `;
    
    console.log('📧 Sending email via Resend SDK...');
    console.log(`📧 From: ${fromEmail}`);
    console.log(`📧 To: ${toEmail}`);
    
    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `[ReleaseTrack Pro] Ticket ${sampleTicket.id} Status Changed: ${previousStatus} → ${newStatus}`,
      html,
      text: `The status for ticket ${sampleTicket.id}: ${sampleTicket.title} has been updated from ${previousStatus} to ${newStatus}.`
    });
    
    if (error) {
      console.error('❌ Error sending email:', error);
      return;
    }
    
    console.log('✅ Email sent successfully!');
    console.log('📬 Email ID:', data.id);
    console.log('📬 Check your inbox for the test email (it may take a few minutes to arrive)');
  } catch (error) {
    console.error('❌ Error sending ticket status change email:', error);
  }
}

// Run the test
sendTicketStatusChangeEmail()
  .then(() => console.log('🏁 Test complete'))
  .catch(err => console.error('❌ Test failed:', err));
