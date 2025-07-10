const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end(`Error loading index.html: ${err.message}`);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
  } else if (req.url === '/test') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ReleaseTrack Pro - Test Page</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background-color: white;
              padding: 20px;
              border-radius: 5px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 {
              color: #0066cc;
            }
            .success {
              color: green;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>ReleaseTrack Pro - Server Test</h1>
            <p class="success">✅ Server is running successfully!</p>
            <p>This confirms that the HTTP server is working correctly on port ${PORT}.</p>
            <p>Next steps:</p>
            <ul>
              <li>If you're trying to run the React app, you may need to fix issues with React dependencies.</li>
              <li>Check if the node_modules folder exists and has all required dependencies.</li>
              <li>Try running <code>npm install</code> followed by <code>npm start</code> in a new terminal window.</li>
            </ul>
          </div>
        </body>
      </html>
    `);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Test page available at http://localhost:${PORT}/test`);
});
