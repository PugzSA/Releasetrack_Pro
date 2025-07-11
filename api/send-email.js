// Serverless function to send emails via Resend API
const { Resend } = require('resend');

// Initialize Resend with API key from environment variables
const resendApiKey = process.env.REACT_APP_RESEND_API_KEY;
const resend = new Resend(resendApiKey);

// Handler function for the API endpoint
module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { from, to, subject, html } = req.body;
    
    if (!to || to.length === 0) {
      return res.status(400).json({ error: 'No recipients provided' });
    }
    
    // Use the verified from email or fallback to custom domain
    const fromEmail = from || process.env.REACT_APP_EMAIL_FROM || 'notifications@sfdctest.online';
    
    console.log(`Sending email via Resend API:
      From: ${fromEmail}
      To: ${to.join(', ')}
      Subject: ${subject}
    `);
    
    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html
    });
    
    if (error) {
      console.error('Error sending email:', error);
      return res.status(400).json({ error });
    }
    
    console.log('Email sent successfully:', data);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error in send-email API:', error);
    return res.status(500).json({ error: error.message });
  }
};
