$body = '{"email":"admin@thanawy.com","password":"admin123"}'
$response = Invoke-WebRequest -Uri 'http://127.0.0.1:8082/api/auth/login' -Method POST -ContentType 'application/json' -Body $body -UseBasicParsing
Write-Host "Status: $($response.StatusCode)"
Write-Host "Content: $($response.Content)"
