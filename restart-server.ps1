# Restart Server Script
# Kills all Node.js processes and starts the server

Write-Host "🔄 Restarting DH Pharmacy Server..." -ForegroundColor Cyan
Write-Host ""

# Kill all Node.js processes
Write-Host "🛑 Stopping all Node.js processes..." -ForegroundColor Yellow
try {
    taskkill /IM node.exe /F 2>$null
    Write-Host "✅ Node.js processes stopped" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  No Node.js processes running" -ForegroundColor Gray
}

Write-Host ""
Start-Sleep -Seconds 1

# Check if port 3000 is free
Write-Host "🔍 Checking port 3000..." -ForegroundColor Yellow
$port = netstat -ano | findstr :3000
if ($port) {
    Write-Host "⚠️  Port 3000 still in use, waiting..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
} else {
    Write-Host "✅ Port 3000 is free" -ForegroundColor Green
}

Write-Host ""

# Start server
Write-Host "🚀 Starting server..." -ForegroundColor Cyan
Write-Host ""
npm run dev
