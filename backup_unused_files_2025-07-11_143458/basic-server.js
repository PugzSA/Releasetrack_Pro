const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Basic Server Test</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; }
          h1 { color: #0066cc; }
          .success { color: green; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Basic Server Test</h1>
          <p class="success">✅ Success! This basic server is working.</p>
          <p>If you can see this page, your browser can successfully connect to localhost:3000.</p>
          <p>Current time: ${new Date().toLocaleString()}</p>
        </div>
      </body>
    </html>
  `);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Basic test server running at http://localhost:${PORT}`);
});
