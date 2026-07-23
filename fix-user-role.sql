-- This file intentionally avoids direct role changes.
-- Use the approved internal admin provisioning workflow or an audited admin console.

-- Read-only example: inspect the current user state.
SELECT id, email, role, status, email_verified
FROM "User"
WHERE email = $1;

-- If an admin role change is required, perform it through the approved provisioning path
-- rather than a repository script so that audits and approvals remain intact.