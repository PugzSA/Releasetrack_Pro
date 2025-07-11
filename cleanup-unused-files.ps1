# ReleaseTrack Pro - Cleanup Script
# Created on: 2025-07-11
# This script moves unused and duplicate files to a backup directory

# Create timestamp for backup folder
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$backupDir = ".\backup_unused_files_$timestamp"

# Create backup directory
Write-Host "Creating backup directory: $backupDir" -ForegroundColor Cyan
New-Item -Path $backupDir -ItemType Directory -Force | Out-Null

# Function to move a file to backup directory
function Move-ToBackup {
    param (
        [string]$filePath
    )
    
    if (Test-Path $filePath) {
        $fileName = Split-Path $filePath -Leaf
        $destPath = Join-Path $backupDir $fileName
        
        # If file with same name exists in backup, add a suffix
        $counter = 1
        while (Test-Path $destPath) {
            $fileNameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($fileName)
            $extension = [System.IO.Path]::GetExtension($fileName)
            $destPath = Join-Path $backupDir "$fileNameWithoutExt`_$counter$extension"
            $counter++
        }
        
        Write-Host "Moving $filePath to backup" -ForegroundColor Yellow
        Move-Item -Path $filePath -Destination $destPath
        return $true
    } else {
        Write-Host "File not found: $filePath" -ForegroundColor Red
        return $false
    }
}

# List of files to backup (grouped by category)
Write-Host "Starting cleanup process..." -ForegroundColor Green

# 1. Duplicate Server Files
Write-Host "`nBacking up duplicate server files:" -ForegroundColor Magenta
Move-ToBackup ".\basic-server.js"
Move-ToBackup ".\simple-server.js"
Move-ToBackup ".\test-server.js"

# 2. Duplicate Email Test Files
Write-Host "`nBacking up duplicate email test files:" -ForegroundColor Magenta
Move-ToBackup ".\email-fix.js"
Move-ToBackup ".\send-test-email.js"
Move-ToBackup ".\test-email.js"
Move-ToBackup ".\direct-test.js"

# 3. Duplicate Documentation
Write-Host "`nBacking up duplicate documentation:" -ForegroundColor Magenta
Move-ToBackup ".\EMAIL_NOTIFICATIONS.md"
Move-ToBackup ".\README_EMAIL_NOTIFICATIONS.md"

# 4. Duplicate Ticket Update Files
Write-Host "`nBacking up duplicate ticket update files:" -ForegroundColor Magenta
Move-ToBackup ".\ticket-display-updates.js"
Move-ToBackup ".\ticket-display-updates.jsx"
Move-ToBackup ".\update-ticket-display.js"
Move-ToBackup ".\update-tickets-display.js"

# 5. Test Ticket Files
Write-Host "`nBacking up test ticket files:" -ForegroundColor Magenta
Move-ToBackup ".\test-ticket-update-direct.js"
Move-ToBackup ".\test-ticket-update.js"

# 6. One-time SQL Scripts (after confirming they've been applied)
Write-Host "`nBacking up one-time SQL scripts:" -ForegroundColor Magenta
Move-ToBackup ".\add-requester-id-to-tickets.sql"
Move-ToBackup ".\add-requester-to-tickets.sql"
Move-ToBackup ".\add-support-area-column.sql"
Move-ToBackup ".\add-test-notes-column.sql"
Move-ToBackup ".\fix-support-area-column-case.sql"
Move-ToBackup ".\fix-test-notes-column-case.sql"

# 7. Other Unused Files
Write-Host "`nBacking up other unused files:" -ForegroundColor Magenta
Move-ToBackup ".\single-quotes-test.js"

# Summary
Write-Host "`nCleanup completed!" -ForegroundColor Green
Write-Host "All unused files have been moved to: $backupDir" -ForegroundColor Cyan
Write-Host "You can delete this directory when you're sure you don't need these files anymore." -ForegroundColor Yellow
