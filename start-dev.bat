@echo off
echo Starting ReleaseTrack Pro development server...

echo Installing required dependencies...
call npm install react-app-rewired --save-dev
call npm install stream-browserify buffer util assert stream-http https-browserify os-browserify url crypto-browserify process path-browserify browserify-zlib --save-dev

echo Checking for running servers on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
    echo Terminating process: %%a
    taskkill /F /PID %%a 2>nul
)

echo Starting development server...
start http://localhost:3000
call npm start

if %ERRORLEVEL% neq 0 (
    echo Error starting development server.
    echo Trying alternative method...
    call npx react-app-rewired start
    
    if %ERRORLEVEL% neq 0 (
        echo All attempts to start the server failed.
        echo Please check the error messages above.
        pause
        exit /b 1
    )
)

pause
