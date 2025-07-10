// Simple script to test email sending with Resend
require('dotenv').config();
const { Resend } = require('resend');

// Initialize Resend with API key
const resendApiKey = process.env.REACT_APP_RESEND_API_KEY;
const resend = new Resend(resendApiKey);

// Email configuration
const fromEmail = 'onboarding@resend.dev'; // Using Resend's verified domain
const toEmails = ['kyle.cockcroft@watchmakergenomics.com']; // Replace with your email

async function sendTestEmail() {
  console.log('🚀 Sending test email using Resend API...');
  console.log(`📧 From: ${fromEmail}`);
  console.log(`📧 To: ${toEmails.join(', ')}`);
  
  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: toEmails,
      subject: 'Test Email from ReleaseTrack Pro',
      html: `
        <h1>This is a test email</h1>
        <p>If you're seeing this, the email notification system in ReleaseTrack Pro is working correctly.</p>
        <p>Time sent: ${new Date().toISOString()}</p>
      `,
      text: 'This is a test email from ReleaseTrack Pro. If you\'re seeing this, the email notification system is working correctly.'
    });
    
    console.log('✅ Email sent successfully!');
    console.log('📬 Email ID:', data.id);
    console.log('📬 Check your inbox for the test email (it may take a few minutes to arrive)');
  } catch (error) {
    console.error('❌ Error sending email:');
    console.error(error);
  }
}

// Execute the test
sendTestEmail();
