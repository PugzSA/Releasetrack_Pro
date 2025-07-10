@echo off
echo Starting Email Proxy Server...
echo.

:: Kill any process running on port 3001 if needed
echo Checking for processes on port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
  echo Found process: %%a on port 3001
  taskkill /F /PID %%a 2>NUL
  if not errorlevel 1 (
    echo Killed process %%a
  )
)

:: Install dependencies if needed
if not exist node_modules\express (
  echo Installing required dependencies...
  npm install express cors body-parser dotenv
)

:: Start the email proxy server
echo Starting email proxy server on port 3001...
node email-proxy-server.js
