# =====================================================
# Test Login - Use environment variables only
# =====================================================
# WARNING: Do NOT hardcode credentials in scripts.
# Pass credentials via environment variables:
#   $env:TEST_EMAIL = "user@example.com"
#   $env:TEST_PASSWORD = "your-password"
# =====================================================

$email = $env:TEST_EMAIL
$password = $env:TEST_PASSWORD

if (-not $email -or -not $password) {
    Write-Host "ERROR: Set TEST_EMAIL and TEST_PASSWORD environment variables first." -ForegroundColor Red
    Write-Host "Example:" -ForegroundColor Yellow
    Write-Host '  $env:TEST_EMAIL = "admin@thanawy.com"' -ForegroundColor Gray
    Write-Host '  $env:TEST_PASSWORD = "<your-password>"' -ForegroundColor Gray
    exit 1
}

$body = "{\`"email\`":\`"$email\`",\`"password\`":\`"$password\`"}"
$response = Invoke-WebRequest -Uri 'http://127.0.0.1:8082/api/auth/login' -Method POST -ContentType 'application/json' -Body $body -UseBasicParsing
Write-Host "Status: $($response.StatusCode)"
Write-Host "Content: $($response.Content)"