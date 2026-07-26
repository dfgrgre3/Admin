# CSRF Token Validation Fix

## Problem
Users were getting "CSRF token validation failed" errors when making state-changing requests (POST, PUT, PATCH, DELETE) through the Next.js admin panel.

## Root Cause
The issue was caused by the `Origin` header being forwarded from the Next.js proxy to the Go backend:

1. **Browser sends**: `Origin: https://admin.example.com` (the Next.js app origin)
2. **Next.js proxy forwards**: The `Origin` header to the Go backend
3. **Go backend validates**: `validateOrigin()` checks if `Origin` matches the backend host (e.g., `api.example.com`)
4. **Mismatch occurs**: The origins don't match, causing `validateOrigin()` to return `false`
5. **Request rejected**: Backend returns 403 "CSRF token validation failed"

The Go backend's `validateOrigin()` function in `internal/middleware/csrf_protection.go` compares the `Origin` header against:
- The request's `Host` header
- The `CORS_ORIGINS` environment variable

When requests go through the Next.js proxy, the browser's `Origin` header reflects the Next.js app's origin, not the backend's origin, causing the validation to fail.

## Solution
Strip the `Origin` header in all Next.js API routes that proxy requests to the Go backend. This allows the backend to:
- Skip Origin validation (when Origin is absent, the backend falls back to Referer validation or accepts the request)
- Rely on the Next.js proxy as the security boundary
- Continue validating the CSRF token via the Double Submit Cookie pattern (`X-CSRF-Token` header + `_csrf` cookie)

## Files Modified

### 1. `src/app/api/[...path]/route.ts`
**Purpose**: Catch-all proxy for all `/api/*` routes

**Changes**:
- Added Origin header stripping in `buildProxyRequestOptions()`
- Logs when Origin header is stripped for debugging

### 2. `src/app/api/admin/_proxy.ts`
**Purpose**: Server-side proxy for admin-specific API routes

**Changes**:
- Added `headers.delete('origin')` before forwarding to Go backend
- Ensures all admin API requests don't fail CSRF validation

### 3. `src/app/api/auth/refresh/route.ts`
**Purpose**: Token refresh endpoint

**Changes**:
- Added Origin header stripping before proxying to `/api/auth/refresh`
- Critical for maintaining user sessions

### 4. `src/app/api/auth/login/route.ts`
**Purpose**: Login endpoint

**Changes**:
- Added Origin header stripping before proxying to `/api/auth/login`
- Ensures login requests don't fail CSRF validation

## How It Works

### Before Fix
```
Browser → Next.js Proxy → Go Backend
   Origin: https://admin.example.com
   ↓
   [Origin forwarded]
   ↓
Go Backend: validateOrigin() fails ❌
   ↓
403 CSRF token validation failed
```

### After Fix
```
Browser → Next.js Proxy → Go Backend
   Origin: https://admin.example.com
   ↓
   [Origin stripped]
   ↓
Go Backend: validateOrigin() skipped ✓
   ↓
CSRF validated via X-CSRF-Token + _csrf cookie ✓
   ↓
200 OK
```

## Security Considerations

1. **Proxy as Security Boundary**: The Next.js proxy itself provides security by:
   - Authenticating users via Next.js middleware
   - Enforcing admin permissions via `assertAdminApiPermission()`
   - Validating JWT tokens

2. **CSRF Protection Still Active**: The Go backend still validates:
   - `X-CSRF-Token` header matches `_csrf` cookie (Double Submit Cookie pattern)
   - Safe methods (GET, HEAD, OPTIONS) bypass CSRF
   - Auth endpoints are skipped (login, refresh, etc.)

3. **Origin Header Removal**: Safe because:
   - The proxy is the security boundary, not the backend
   - CORS is still enforced at the proxy level
   - Authentication/authorization happens before proxying

## Testing

To verify the fix:

1. **Check logs**: Look for `[API Proxy] Stripping Origin header` messages
2. **Test state-changing requests**: POST, PUT, PATCH, DELETE should work
3. **Verify CSRF still works**: The backend should still validate `X-CSRF-Token` header
4. **Check for 403 errors**: Should no longer see "CSRF token validation failed"

## Related Code

### Backend CSRF Middleware
- **File**: `internal/middleware/csrf_protection.go`
- **Key functions**:
  - `CSRFMiddleware()`: Main CSRF protection middleware
  - `validateOrigin()`: Validates Origin/Referer header
  - `validateCSRFToken()`: Validates X-CSRF-Token header matches _csrf cookie
  - `EnsureCSRFToken()`: Creates CSRF token if missing

### Frontend CSRF Handling
- **File**: `src/lib/api/api-client.ts`
- **Key functions**:
  - `ensureCsrfToken()`: Bootstraps CSRF token via `/api/auth/csrf`
  - `buildHeaders()`: Injects `X-CSRF-Token` header for write requests
  - `getCookie()`: Reads `_csrf` cookie

## Additional Notes

- The `/api/auth/csrf` endpoint exists in `internal/router/public_routes.go` and is used by the frontend to bootstrap CSRF tokens
- The `_csrf` cookie is NOT HttpOnly (by design) so JavaScript can read it and set the `X-CSRF-Token` header
- CSRF tokens expire after 24 hours
- The backend uses `subtle.ConstantTimeCompare` to prevent timing attacks on token comparison