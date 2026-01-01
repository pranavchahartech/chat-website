Write-Host "Setting up Firewall Rules for Chat App..." -ForegroundColor Cyan

$ports = @(3001, 5173)

foreach ($port in $ports) {
    $ruleName = "Allow Chat App Port $port"
    Write-Host "Adding rule: $ruleName"
    
    # Remove existing rule if any to avoid duplicates
    Remove-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
    
    # Add new rule
    New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -LocalPort $port -Protocol TCP -Action Allow
    if ($?) {
        Write-Host "Successfully opened port $port" -ForegroundColor Green
    } else {
        Write-Host "Failed to open port $port. Make sure you run this as Administrator!" -ForegroundColor Red
    }
}

Write-Host "`nNetwork Profile Check:" -ForegroundColor Yellow
Get-NetConnectionProfile

Write-Host "`nIf the NetworkCategory is 'Public', Windows might still block connections." -ForegroundColor Gray
Write-Host "Done! You can close this window."
Pause
