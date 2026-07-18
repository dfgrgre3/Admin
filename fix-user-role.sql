-- Fix user role for admin panel access
-- Run this SQL query against your database to grant admin access to ffyoussef12@gmail.com

-- First, check the current user details
SELECT id, email, role, status, email_verified 
FROM "User" 
WHERE email = 'ffyoussef12@gmail.com';

-- Update the user role to ADMIN (or SUPER_ADMIN for full access)
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

-- Optional: Grant all permissions to the user
-- First check what permissions exist
SELECT DISTINCT unnest(permissions) as permission 
FROM "User" 
WHERE role IN ('ADMIN', 'SUPER_ADMIN')
LIMIT 50;

-- Grant admin bypass permission (this is automatically added for ADMIN/SUPER_ADMIN roles)
-- No need to manually add permissions as the system automatically grants PermAdminBypass