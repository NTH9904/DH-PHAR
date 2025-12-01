# Simple Git Conflict Fixer

Write-Host "Fixing conflicts..." -ForegroundColor Cyan

# Fix orders.html
$file1 = "admin/pages/orders.html"
if (Test-Path $file1) {
    $content = Get-Content $file1 -Raw
    $content = $content -replace '<<<<<<< HEAD[\s\S]*?=======\s*', ''
    $content = $content -replace '>>>>>>> [a-f0-9]+', ''
    Set-Content -Path $file1 -Value $content -NoNewline
    Write-Host "Fixed: $file1" -ForegroundColor Green
}

# Fix users.html
$file2 = "admin/pages/users.html"
if (Test-Path $file2) {
    $content = Get-Content $file2 -Raw
    $content = $content -replace '<<<<<<< HEAD[\s\S]*?=======\s*', ''
    $content = $content -replace '>>>>>>> [a-f0-9]+', ''
    Set-Content -Path $file2 -Value $content -NoNewline
    Write-Host "Fixed: $file2" -ForegroundColor Green
}

Write-Host "Done!" -ForegroundColor Green
