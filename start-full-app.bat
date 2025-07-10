@echo off
echo Starting ReleaseTrack Pro full application...

echo Checking for running servers on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
    echo Terminating process: %%a
    taskkill /F /PID %%a 2>nul
)

echo Ensuring all dependencies are installed...
call npm install --no-fund --loglevel=error

echo Starting development server...
start http://localhost:3000
call npx react-app-rewired start

if %ERRORLEVEL% neq 0 (
    echo Error starting development server.
    echo Please check the error messages above.
    pause
    exit /b 1
)

pause
