-- =====================================================
-- MFA Diagnostics (Read-only) - DO NOT embed user data
-- =====================================================
-- Use the approved internal admin workflow for credential
-- resets or MFA recovery. This file exists only for
-- read-only diagnostics via environment variables.

-- Read-only: Inspect any user's current MFA state
-- Supply email via psql -v email='user@example.com'
SELECT
    id,
    email,
    role,
    status,
    email_verified,
    two_factor_enabled,
    two_factor_secret IS NOT NULL AS has_secret,
    backup_codes IS NOT NULL AS has_backup
FROM "User"
WHERE email = :'email';

-- No DML (UPDATE/DELETE) statements are present.
-- All role/MFA changes must go through the audited
-- internal admin provisioning workflow.