const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

// Setup logging to file
const logFile = path.join(__dirname, 'email-proxy-logs.txt');
const logToFile = (message, obj = null) => {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] ${message}`;
  
  if (obj) {
    if (typeof obj === 'object') {
      logMessage += ` ${JSON.stringify(obj)}`;
    } else {
      logMessage += ` ${obj}`;
    }
  }
  
  logMessage += '\n';
  fs.appendFileSync(logFile, logMessage);
  console.log(message, obj || '');
};

require('dotenv').config();

const app = express();
const port = process.env.EMAIL_PROXY_PORT || 3002;

logToFile('Starting email proxy server...');
logToFile('Environment variables loaded:', {
  REACT_APP_RESEND_API_KEY: process.env.REACT_APP_RESEND_API_KEY ? '✓ Present (masked)' : '✗ Missing',
  REACT_APP_EMAIL_FROM: process.env.REACT_APP_EMAIL_FROM || 'Not set'
});

// Initialize Resend with API key from environment variables
const resendApiKey = process.env.REACT_APP_RESEND_API_KEY;
if (!resendApiKey) {
  console.error('ERROR: REACT_APP_RESEND_API_KEY is not set in .env file');
  process.exit(1);
}

const resend = new Resend(resendApiKey);
logToFile('Resend client initialized');

// Enable CORS for the React app - allow all origins in development
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
logToFile('CORS middleware configured');

// Parse JSON request bodies
app.use(bodyParser.json());
logToFile('Body parser middleware configured');

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: err.message
  });
});

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  logToFile('💚 Health check requested');
  
  const healthData = {
    status: 'ok',
    message: 'Email proxy server is running',
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!resendApiKey,
    fromEmail: process.env.REACT_APP_EMAIL_FROM || 'notifications@sfdctest.online'
  };
  
  logToFile('💚 Health check response:', healthData);
  res.json(healthData);
});

// Root endpoint for basic testing
app.get('/', (req, res) => {
  console.log('Root endpoint called');
  res.send('Email proxy server is running. Use /api/health for health check and /api/send-email for sending emails.');
});

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    console.log('📧 Received email request at', new Date().toISOString());
    
    // Validate request body
    if (!req.body) {
      logToFile('❌ Missing request body');
      return res.status(400).json({ error: 'Request body is required' });
    }
    
    // Validate recipients
    if (!req.body.to || (Array.isArray(req.body.to) && req.body.to.length === 0)) {
      logToFile('❌ No recipients provided');
      return res.status(400).json({ error: 'At least one recipient is required' });
    }
    
    // Construct email payload
    const emailPayload = {
      from: req.body.from || process.env.REACT_APP_EMAIL_FROM || 'notifications@sfdctest.online',
      to: req.body.to, // expects array of strings for multiple recipients
      subject: req.body.subject || 'Notification from ReleaseTrack Pro',
      html: req.body.html || '<p>This is a notification from ReleaseTrack Pro.</p>',
      text: req.body.text || 'This is a notification from ReleaseTrack Pro.'
    };
    
    // Log the complete request payload for debugging
    logToFile('📧 COMPLETE REQUEST PAYLOAD:', req.body);
    
    // Log the exact format of the 'to' field for debugging
    logToFile('📧 Recipients format check:');
    logToFile('  Type:', Array.isArray(req.body.to) ? 'Array' : typeof req.body.to);
    logToFile('  Value:', JSON.stringify(req.body.to));
    logToFile('  Length:', Array.isArray(req.body.to) ? req.body.to.length : 'N/A');
    
    // Log the exact payload being sent to Resend API
    logToFile('🚀 RESEND API PAYLOAD:', emailPayload);
    
    logToFile('🚀 Sending email via Resend API...');
    logToFile('API Key used:', resendApiKey ? '✓ Present (masked)' : '✗ Missing');
    
    // Send the email using Resend
    logToFile('🚀 Calling Resend API with payload...');
    const { data, error } = await resend.emails.send(emailPayload);

    if (error) {
      logToFile('❌ Error sending email via Resend API:', error);
      return res.status(500).json({ success: false, error: error });
    }
    
    logToFile('✅ Email sent successfully via Resend API');
    logToFile('Email ID:', data?.id);
    return res.json({ success: true, data });
  } catch (err) {
    logToFile('❌ Server error while sending email:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Email proxy server running at http://localhost:${port}`);
  console.log(`API Key available: ${!!resendApiKey}`);
  console.log(`From email: ${process.env.REACT_APP_EMAIL_FROM || 'notifications@sfdctest.online'}`);
});
