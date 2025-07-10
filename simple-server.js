const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Add a simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Serve a simple HTML page for testing
app.get('/test', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>ReleaseTrack Pro - Test</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .container { max-width: 800px; margin: 0 auto; }
          h1 { color: #0066cc; }
          .card { border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; border-radius: 5px; }
          .success { color: green; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>ReleaseTrack Pro</h1>
          <div class="card">
            <h2>Server Status</h2>
            <p class="success">✅ Server is running successfully on port ${PORT}!</p>
          </div>
          <div class="card">
            <h2>Application Features</h2>
            <ul>
              <li>Dashboard with release statistics</li>
              <li>Release management</li>
              <li>Ticket tracking</li>
              <li>Metadata management</li>
              <li>Reports and analytics</li>
            </ul>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Test page available at http://localhost:${PORT}/test`);
});
