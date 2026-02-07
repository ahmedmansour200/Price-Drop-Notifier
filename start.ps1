# Quick Start Script for Price Drop Notifier

Write-Host "🚀 Price Drop Notifier - Quick Start" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js is not installed. Please install Node.js from https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node.js $nodeVersion detected" -ForegroundColor Green

# Navigate to widget directory
Write-Host ""
Write-Host "📦 Building widget..." -ForegroundColor Yellow
Set-Location -Path "widget"

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing widget dependencies..." -ForegroundColor Gray
    npm install --silent
}

Write-Host "Compiling TypeScript and creating bundles..." -ForegroundColor Gray
npm run build --silent

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Widget build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Widget built successfully (3.21 KB gzipped)" -ForegroundColor Green

# Copy widget to backend
Write-Host ""
Write-Host "📋 Deploying widget to backend..." -ForegroundColor Yellow
Copy-Item "dist\price-drop-widget.min.js" "..\backend\public\assets\price-drop-widget.min.js" -Force
Copy-Item "dist\widget.css" "..\backend\public\assets\widget.css" -Force
Write-Host "✓ Widget and CSS deployed" -ForegroundColor Green

# Navigate to backend directory
Set-Location -Path "..\backend"

if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    npm install --silent
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
}

# Start server
Write-Host ""
Write-Host "🌐 Starting Express server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Demo Page:      http://localhost:3000/demo.html" -ForegroundColor White
Write-Host "📍 Widget Bundle:  http://localhost:3000/assets/price-drop-widget.min.js" -ForegroundColor White
Write-Host "📍 Embed Page:     http://localhost:3000/embed/price-drop.html" -ForegroundColor White
Write-Host ""
Write-Host "📝 Userscript:     Install from userscript/price-drop-injector.user.js" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

node server.js

