# Update Email From Address Script
# This script updates the REACT_APP_EMAIL_FROM variable in the .env file

$envFile = ".\.env"
$newEmailFrom = "notifications@sfdctest.online"
$backupFile = ".\.env.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

Write-Host "Updating email sender address in .env file..." -ForegroundColor Cyan

# Check if .env file exists
if (-not (Test-Path $envFile)) {
    Write-Host "Error: .env file not found!" -ForegroundColor Red
    exit 1
}

# Create a backup of the original .env file
Copy-Item $envFile $backupFile
Write-Host "Created backup of .env file at $backupFile" -ForegroundColor Green

# Read the current content of the .env file
$envContent = Get-Content $envFile -Raw

# Check if REACT_APP_EMAIL_FROM already exists in the file
if ($envContent -match "REACT_APP_EMAIL_FROM=(.*)") {
    # Replace the existing value
    $updatedContent = $envContent -replace "REACT_APP_EMAIL_FROM=(.*)", "REACT_APP_EMAIL_FROM=$newEmailFrom"
    Write-Host "Updating existing REACT_APP_EMAIL_FROM value to $newEmailFrom" -ForegroundColor Yellow
} else {
    # Add the variable if it doesn't exist
    $updatedContent = $envContent.TrimEnd() + "`nREACT_APP_EMAIL_FROM=$newEmailFrom`n"
    Write-Host "Adding REACT_APP_EMAIL_FROM=$newEmailFrom to .env file" -ForegroundColor Yellow
}

# Write the updated content back to the .env file
$updatedContent | Set-Content $envFile

Write-Host "Email sender address successfully updated in .env file" -ForegroundColor Green
Write-Host "Please restart both the React app and the email proxy server for changes to take effect" -ForegroundColor Cyan
