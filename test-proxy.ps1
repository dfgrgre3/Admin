$body = '{"email":"admin@thanawy.com","password":"admin123"}'
try {
    $response = Invoke-WebRequest -Uri 'http://localhost:3001/api/auth/admin-login' -Method POST -ContentType 'application/json' -Body $body -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Content: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host "Body: $($reader.ReadToEnd())"
    }
}
