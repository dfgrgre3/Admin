$passwords = @("admin123", "Admin@Tolo2026!")

foreach ($password in $passwords) {
    Write-Host "=== Testing password: $password ==="
    $body = '{"email":"admin@thanawy.com","password":"' + $password + '"}'
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
}