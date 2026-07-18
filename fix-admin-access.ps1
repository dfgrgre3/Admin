# Script to fix admin access for ffyoussef12@gmail.com
# This script connects to the database and updates the user role

param(
    [string]$DatabaseUrl = "postgresql://postgres.vowortqooklkavlaqigr:Khaled%4020088@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
)

Write-Host "=== Fixing Admin Access for ffyoussef12@gmail.com ===" -ForegroundColor Cyan
Write-Host ""

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "ERROR: PostgreSQL client (psql) is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install PostgreSQL client tools or run the SQL manually." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can run this SQL manually in your database:" -ForegroundColor Yellow
    Write-Host @"
UPDATE "User" 
SET 
  role = 'ADMIN',
  status = 'ACTIVE',
  email_verified = true,
  updated_at = NOW()
WHERE email = 'ffyoussef12@gmail.com';
"@
    exit 1
}

Write-Host "PostgreSQL client found. Executing SQL..." -ForegroundColor Green
Write-Host ""

# Create SQL file
$sqlContent = @"
-- Check current user status
SELECT id, email, role, status, email_verified 
FROM "User" 
WHERE email = 'ffyoussef12@gmail.com';

-- Update user to ADMIN role
UPDATE "User" 
SET 
  role = 'ADMIN',
  status = 'ACTIVE',
  email_verified = true,
  updated_at = NOW()
WHERE email = 'ffyoussef12@gmail.com';

-- Verify the update
SELECT id, email, role, status, email_verified 
FROM "User" 
WHERE email = 'ffyoussef12@gmail.com';
"@

$sqlFile = "temp-fix-admin-access.sql"
$sqlContent | Out-File -FilePath $sqlFile -Encoding UTF8

try {
    # Execute SQL
    $env:PGPASSWORD = "Khaled@20088"
    $result = psql $DatabaseUrl -f $sqlFile 2>&1
    
    Write-Host $result -ForegroundColor Green
    Write-Host ""
    Write-Host "=== Fix Applied Successfully ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Clear your browser cookies/cache" -ForegroundColor White
    Write-Host "2. Logout from the admin panel" -ForegroundColor White
    Write-Host "3. Login again with:" -ForegroundColor White
    Write-Host "   Email: ffyoussef12@gmail.com" -ForegroundColor White
    Write-Host "   Password: Khaled@2008" -ForegroundColor White
    Write-Host ""
    Write-Host "You should now have admin access!" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Failed to execute SQL: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run the SQL manually in your database:" -ForegroundColor Yellow
    Write-Host $sqlContent
}
finally {
    # Cleanup
    if (Test-Path $sqlFile) {
        Remove-Item $sqlFile
    }
}