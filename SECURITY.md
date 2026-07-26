# Security Operations

## Administrative audit trail

Administrative audit events are server-authoritative. The Go backend records
requests to `/api/admin/*` with `NewAdminAuditLogger` and persists them in the
`AuditLog` database table. The frontend must never write audit records to
`localStorage`, accept a client-supplied audit event, or expose a delete/clear
operation. Read the feed through the authenticated `GET /api/admin/audit-logs`
endpoint only.

## CSRF cookie

The `_csrf` cookie intentionally is **not** `HttpOnly`: the application uses a
Double Submit Cookie design, so browser JavaScript must copy its value into the
`X-CSRF-Token` header. This is not an authentication cookie and must never be
used as one. The backend also uses `SameSite=Lax`, HTTPS `Secure` cookies in
production, constant-time token comparison, and Origin/Referer validation.
The API proxy preserves Origin and Referer; it must not strip them to make a
request pass.

For stronger XSS defense, maintain a strict Content Security Policy and output
encoding. Switching `_csrf` to `HttpOnly` requires a different CSRF design
(for example a server-rendered token or a synchronizer-token endpoint), not
just changing the flag while retaining the current client-readable flow.

## Cache safety

`FLUSHALL` is disabled in the application because it is process-wide and can
destroy unrelated data. Invalidate only an explicitly scoped key/pattern after
authorization at the calling admin endpoint. Any operational emergency flush
must be performed by an authenticated operator using a separately protected
Redis administration channel.

## Secret exposure and rotation runbook

If a secret was ever committed, treat it as compromised even after the commit
is deleted. Rotate/revoke all affected credentials in the provider, update the
deployment secret store, restart all services, invalidate sessions/tokens where
applicable, and verify the old values no longer work. Then remove the values
from reachable Git history using the repository's approved history-rewrite
process and force-update protected remotes only with maintainer approval.

Do not paste secret values into tickets, logs, or chat. The following names
require rotation review when their history contains a credential: JWT signing
keys, session/refresh secrets, database URLs/passwords, Redis URLs/passwords,
S3 access keys/secrets, OAuth client secrets, webhook signing secrets, and API
keys. Use a secret scanner in CI and keep only placeholders in `.env.example`.
# Security Policy

## 🔴 Critical: Secrets Management

This repository **must never** contain:
- Database connection strings with passwords
- API keys, tokens, or secrets
- Service role keys (Supabase, etc.)
- JWT secrets
- Hardcoded credentials of any kind
- User PII (email, passwords, etc.)

All secrets must be injected via environment variables at runtime.

## 🚨 Immediate Actions Required

### 1. Rotate All Compromised Credentials

The following secrets were exposed in git history and must be considered **fully compromised**:

| Secret | Location (git history) | Action Required |
|--------|----------------------|-----------------|
| PostgreSQL connection string with password | historical provisioning script | Rotate DB password immediately |
| Supabase Service Role Key | historical provisioning script | Rotate service role key in Supabase dashboard |
| User credentials/PII | historical provisioning script | Reset affected account and review access |
| JWT Secret | Potentially in `.env` history | Rotate JWT secret |
| OpenRouter API Key | Potentially in `.env` history | Rotate API key |
| Redis Password | Potentially in `.env` history | Rotate Redis password |

### 2. Purge Secrets from Git History

```bash
# Install git-filter-repo first:
#   pip install git-filter-repo
# or
#   choco install git-filter-repo

# Then run:
git filter-repo --path fix-admin-access.ps1 --invert-paths
git filter-repo --path fix-user-role.js --invert-paths
git filter-repo --path fix-user-role.sql --invert-paths
git filter-repo --path fix-admin-mfa.ps1 --invert-paths
git filter-repo --path fix-admin-mfa.sql --invert-paths
git filter-repo --path test-login.ps1 --invert-paths
git filter-repo --path test-admin-login.ps1 --invert-paths
git filter-repo --path test-proxy.ps1 --invert-paths
git filter-repo --path update-envs.ps1 --invert-paths
git filter-repo --path .env --invert-paths
```

**After purging, force-push to rewrite history:**
```bash
git push origin --force --all
```

> **⚠️ WARNING:** This rewrites git history. All collaborators must clone a fresh copy after this is done.

### 3. Audit for Unauthorized Access

- Review Supabase/PostgreSQL audit logs for any suspicious queries
- Check for unauthorized API calls using the leaked service role key
- Review authentication logs for the compromised user account
- Check GitHub access logs for who has forked/cloned the repo
- Review Vercel deployment logs for any unauthorized access

### 4. Make Repository Private

If this is a private project, change the repository visibility to **Private** immediately in GitHub settings:
```
Settings → General → Danger Zone → Change visibility
```

## ✅ Approved Security Practices

### Environment Variables
```bash
# NEVER commit .env files
# Use .env.example with placeholder values instead
DATABASE_URL=postgresql://user:password@host:port/db
SUPABASE_SERVICE_ROLE_KEY=your-key-here
JWT_SECRET=your-secret-here
```

### Admin Provisioning
- **NEVER** use direct database scripts to grant admin roles
- **NEVER** use service role keys outside of a secure backend
- All admin role changes must go through the **audited internal admin provisioning workflow**
- All admin actions must be logged with: who, what, when, and approval trail

### Script Guidelines
- All `.ps1`, `.sql`, and `.js` scripts in this repo must:
  - Read credentials from environment variables only
  - Never hardcode user emails, passwords, or connection strings
  - Never perform DML (UPDATE/DELETE/INSERT) operations directly
  - Include a warning header about not hardcoding secrets

### TypeScript Safety
- TypeScript errors must be resolved before merging to main
- `tsc --noEmit` must pass in CI
- Avoid `any` types; use proper type definitions

## 🚫 Prohibited Patterns

| Pattern | Risk | Alternative |
|---------|------|-------------|
| Hardcoded DB connection strings | Full DB compromise | Environment variables |
| Service role key in client scripts | Root data access | Backend API with RLS |
| Direct SQL UPDATE for roles | Privilege escalation | Admin provisioning API |
| Hardcoded passwords in test scripts | Credential leak | Env vars or vault |
| `.env` files in repository | Mass secret leak | `.env.example` only |
| Scripts bypassing RLS | Data exfiltration | Proper authorization |
| PowerShell reading `.env` and pushing to Vercel | Secret propagation | Vercel dashboard or CLI with manual review |

## 📋 Compliance Checklist

- [ ] **Immediate (P0):** Rotate PostgreSQL password in Supabase dashboard
- [ ] **Immediate (P0):** Rotate Supabase service role key
- [ ] **Immediate (P0):** Reset passwords for all accounts affected by the historical leak
- [ ] **Immediate (P0):** Rotate JWT secret
- [ ] **Immediate (P0):** Rotate OpenRouter API key
- [ ] **Immediate (P0):** Rotate Redis password
- [ ] **Immediate (P0):** Terminate all active sessions
- [ ] **Short-term:** Purge secrets from git history using `git filter-repo`
- [ ] **Short-term:** Force-push to rewrite remote history
- [ ] **Short-term:** Make repository private
- [ ] **Short-term:** Review audit logs for suspicious activity
- [ ] **Short-term:** Fix 55 TypeScript errors from `tsc-output.txt`
- [ ] **Medium-term:** Set up CI pipeline that enforces `tsc --noEmit`
- [ ] **Medium-term:** Set up secrets scanning in CI (e.g., `truffleHog`, `git-secrets`)
- [ ] **Medium-term:** Create `.env.example` with placeholder values
- [ ] **Mid-term:** Address missing backend in docker-compose configuration
- [ ] **Ongoing:** Brief all team members on security policy

## 🔧 Technical Debt: TypeScript Errors

The file `tsc-output.txt` documents **55 TypeScript errors** across multiple files:

| File | Error Count |
|------|-------------|
| `src/app/(admin)/admin/courses/[id]/workflow/page.tsx` | 16 |
| `src/app/(admin)/admin/instructors/[id]/edit/page.tsx` | 4 |
| `src/app/(admin)/admin/instructors/create/page.tsx` | 6 |
| `src/app/(admin)/admin/instructors/[id]/page.tsx` | 2 |
| `src/app/(admin)/admin/page.tsx` | 4 |
| `src/app/api/admin/auth/*/route.ts` (6 files) | 6 |
| `src/app/api/admin/admin-invitations/send/route.ts` | 1 |
| `src/app/(admin)/admin/books/page.tsx` | 2 |
| `src/__tests__/lib/dashboard-data.test.ts` | 1 |

## 🔧 Technical Debt: Missing Backend

`docker-compose.yml` references:
```
./backend/Dockerfile.backend
```
But no `backend/` directory exists in this repository. The backend code is in a separate repository at `d:\backend` (remote: `https://github.com/dfgrgre3/backend.git`). This must be resolved for a complete deployment.

---

**Last Updated:** 2026-07-23
**Severity:** CRITICAL — Immediate action required