# Admin Access Guidance

This document no longer contains credentials, direct database connection strings, or scripts that grant admin privileges.

## What changed
- Secret values were removed from the repository.
- Privilege-escalation helpers were replaced with safe, non-executing guidance.
- Admin access changes should be handled through the approved internal provisioning workflow.

## Recommended path
1. Use the internal admin provisioning or approval process.
2. Store any required secrets in a vault or environment variables.
3. Keep access changes audited and reviewable.

## Notes
- Never embed database credentials, service-role keys, or user passwords in repository files.
- Prefer short-lived credentials and role-based access control over ad-hoc scripts.