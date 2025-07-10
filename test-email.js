// Simple script to test email notifications
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// In Node.js v18 and later, fetch is available globally
// For older Node.js versions, we use node-fetch
let fetchFn;
if (typeof fetch === 'undefined') {
  console.log('Using node-fetch module');
  fetchFn = require('node-fetch');
} else {
  console.log('Using global fetch');
  fetchFn = fetch;
}

// We're using the proxy server instead of direct Resend SDK

// Resend API configuration
const resendApiKey = process.env.REACT_APP_RESEND_API_KEY;
// Using Resend's onboarding domain which is pre-verified
// This domain is automatically verified and can be used for testing
const fromEmail = 'onboarding@resend.dev';

/**
 * Test function to simulate a ticket status change notification
 */
async function testEmailNotification() {
  try {
    console.log('🧪 Testing ticket status change email notification...');
    
    // Create a Supabase client for logging
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase credentials. Check your .env file.');
      process.exit(1);
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Mock data for testing
    const ticket = {
      id: 'TEST-123',
      title: 'Test Ticket for Email Notification',
      description: 'This is a test ticket to verify email notifications are working',
      status: 'In Progress',
      priority: 'Medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const user = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Test User',
      email: 'test@example.com'
    };

    // Mock recipients for testing
    const mockAssignee = {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Bob Burger',
      email: 'bob@gmail.com'
    };

    const mockRequester = {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Kyle Cockcroft',
      email: 'kyle.cockcroft@watchmakergenomics.com'
    };

    console.log(`👤 Using assignee: ${mockAssignee.name} (${mockAssignee.email})`);
    console.log(`👤 Using requester: ${mockRequester.name} (${mockRequester.email})`);

    // Recipients would typically be filtered based on notification preferences
    const recipients = [mockAssignee, mockRequester];
    
    // Generate HTML content for the email
    const htmlContent = generateTicketStatusChangeEmailHtml({
      ticket,
      previousStatus: 'Open',
      user
    });
    
    // Prepare to send an actual email
    console.log('📧 Sending actual email to:', recipients.map(r => r.email).join(', '));
    
    const emailData = {
      from: fromEmail,
      to: recipients.map(r => r.email),
      subject: `[ReleaseTrack Pro] Ticket ${ticket.id} Status Changed: Open → ${ticket.status}`,
      html: htmlContent
    };
    
    // Send an actual email using the Resend API
    console.log('📝 Email content preview:', htmlContent.substring(0, 100) + '...');
    console.log('🚀 Sending actual email via Resend API...');
    
    if (!resendApiKey) {
      console.error('❌ Missing Resend API key. Check your .env file.');
      process.exit(1);
    }
    
    try {
      // Use fetch to send the email through our proxy server
      console.log('Sending email through proxy server at http://localhost:3002/api/send-email');
      
      // Log the email data for debugging
      console.log('Email data:', {
        from: fromEmail,
        to: emailData.to,
        subject: emailData.subject
      });
      
      // Send email using fetch to our proxy server
      console.log('Sending email through proxy server...');
      const proxyUrl = 'http://localhost:3002/api/send-email';
      
      console.log('Email recipients:', emailData.to);
      console.log('Using proxy URL:', proxyUrl);
      
      try {
        const payload = {
          from: fromEmail,
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
          text: 'This is a test email from ReleaseTrack Pro to verify email notifications are working.'
        };
        
        console.log('Request payload:', JSON.stringify(payload, null, 2));
        
        const response = await fetchFn(proxyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        console.log('Response status:', response.status);
        console.log('Response status text:', response.statusText);
        
        const result = await response.json();
        console.log('Proxy server response:', JSON.stringify(result, null, 2));
        
        if (!response.ok) {
          console.error('❌ Error sending email:', result.error || response.statusText);
        } else {
          console.log('✅ Email sent successfully through proxy server!');
          console.log('📬 Check your email inbox for the test email (it may take a few minutes to arrive)');
        }
      } catch (fetchError) {
        console.error('❌ Fetch error:', fetchError.message);
        console.error('Error details:', fetchError);
      }
    } catch (error) {
      console.error('❌ Error sending email:', error.message);
    }
    
    // Log the email notification in the database
    try {
      console.log('📝 Logging email notification to database...');
      
      // Convert metadata to a proper JSON string for Supabase
      const metadataJson = {
        status: {
          from: 'Open',
          to: ticket.status
        },
        ticket: {
          title: ticket.title,
          url: '#'
        }
      };
      
      const { data: logData, error: logError } = await supabase
        .from('email_notification_logs')
        .insert({
          type: 'status_change',
          ticket_id: ticket.id,
          recipients: recipients.map(r => r.id),
          sender_id: user.id,
          metadata: metadataJson,
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        });
      
      if (logError) {
        console.warn('⚠️ Warning: Could not log email notification to database:', logError.message);
      } else {
        console.log('✅ Email notification logged successfully to database');
      }
    } catch (logErr) {
      console.warn('⚠️ Warning: Could not log email notification to database:', logErr);
    }
    
    console.log('✅ Email test completed successfully');
    
  } catch (error) {
    console.error('❌ Error testing email notification:', error);
  }
}

/**
 * Generate HTML content for ticket status change email
 */
function generateTicketStatusChangeEmailHtml({ ticket, previousStatus, user }) {
  const ticketUrl = `http://localhost:3000/tickets/${ticket.id}`;
  const timestamp = new Date().toLocaleString();
  
  return `
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
        }
        .header {
          background-color: #0066cc;
          color: white;
          padding: 15px;
          text-align: center;
        }
        .content {
          padding: 20px;
          background-color: #f9f9f9;
        }
        .ticket-info {
          background-color: white;
          border: 1px solid #ddd;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .status-change {
          font-weight: bold;
          color: #0066cc;
        }
        .footer {
          font-size: 12px;
          color: #666;
          text-align: center;
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #ddd;
        }
        .button {
          display: inline-block;
          background-color: #0066cc;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 4px;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>Ticket Status Update</h2>
      </div>
      <div class="content">
        <p>The status of ticket <strong>${ticket.id}</strong> has been updated.</p>
        
        <div class="ticket-info">
          <h3>${ticket.title}</h3>
          <p><strong>Description:</strong> ${ticket.description}</p>
          <p><strong>Status:</strong> <span class="status-change">${previousStatus} → ${ticket.status}</span></p>
          <p><strong>Priority:</strong> ${ticket.priority}</p>
          <p><strong>Updated by:</strong> ${user.name}</p>
          <p><strong>Updated at:</strong> ${timestamp}</p>
        </div>
        
        <a href="${ticketUrl}" class="button">View Ticket</a>
        
        <p>Thank you for using ReleaseTrack Pro.</p>
      </div>
      <div class="footer">
        <p>This is an automated message from ReleaseTrack Pro. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
}

// Run the test
testEmailNotification();
