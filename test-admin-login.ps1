# =====================================================
# Test Admin Login - Use environment variables only
# =====================================================
# WARNING: Do NOT hardcode credentials in scripts.
# Pass credentials via environment variables:
#   $env:TEST_EMAIL = "admin@thanawy.com"
#   $env:TEST_PASSWORD = "<your-password>"
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

Write-Host "=== Testing password for: $email ==="

$body = "{`"email`":`"$email`",`"password`":`"$password`"}"
try {
    $response = Invoke-WebRequest -Uri 'http://localhost:3001/api/auth/login' -Method POST -ContentType 'application/json' -Body $body -UseBasicParsing -TimeoutSec 10
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Content: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host "Body: $($reader.ReadToEnd())"
    }
}
Write-Host ""