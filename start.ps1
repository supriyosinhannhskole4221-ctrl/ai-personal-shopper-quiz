Write-Host "`nClearing port 3000..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Milliseconds 500
Write-Host "Starting server with Supabase..." -ForegroundColor Green
node app-supabase.js