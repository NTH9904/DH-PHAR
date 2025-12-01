# Fix Git Conflicts Script
# Automatically resolves Git conflicts by choosing the newer version

Write-Host "🔧 Fixing Git conflicts..." -ForegroundColor Cyan
Write-Host ""

$files = @(
    "admin/pages/orders.html",
    "admin/pages/users.html"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "📝 Processing: $file" -ForegroundColor Yellow
        
        # Read file content
        $content = Get-Content $file -Raw
        
        # Remove conflict markers and keep the newer version (after =======)
        $content = $content -replace '<<<<<<< HEAD[\s\S]*?=======\s*', ''
        $content = $content -replace '>>>>>>> [a-f0-9]+', ''
        
        # Write back
        Set-Content -Path $file -Value $content -NoNewline
        
        Write-Host "✅ Fixed: $file" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  Not found: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 All conflicts resolved!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review the changes"
Write-Host "2. Restart server: npm run dev"
Write-Host "3. Test admin pages"
