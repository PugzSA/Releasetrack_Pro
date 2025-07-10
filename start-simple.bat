@echo off
echo Starting simplified ReleaseTrack Pro application...

echo Checking for running servers on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
    echo Terminating process: %%a
    taskkill /F /PID %%a 2>nul
)

echo Renaming files for simplified version...
copy /Y src\index-simple.js src\index.js

echo Starting development server...
start http://localhost:3000
call npx react-app-rewired start

if %ERRORLEVEL% neq 0 (
    echo Error starting development server.
    echo Trying alternative method...
    call npx react-scripts start
    
    if %ERRORLEVEL% neq 0 (
        echo All attempts to start the server failed.
        echo Please check the error messages above.
        pause
        exit /b 1
    )
)

pause
