import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getBackendOrigin } from "@/lib/api/config";

// =============================================================================
//  JWT signature verification (replaces unsafe base64-only decoding).
//
//  Previously the middleware only base64-decoded the token and trusted the
//  `role` claim without verifying the HS256 signature. A forged token could
//  therefore bypass the Edge role gate. We now verify the signature with the
//  shared HS256 secret (jose is Edge-runtime compatible), then enforce the
//  role claim. The Go backend remains the authoritative source of truth;
//  this is a defense-in-depth layer.
// =============================================================================

interface JwtPayload {
  userId?: string;
  role?: string;
  email?: string;
  exp?: number;
  iss?: string;
}

const JWT_SECRET = process.env.JWT_SECRET?.trim();
const JWT_ISSUER = process.env.JWT_ISSUER_URL || "";

let jwtSecretWarningLogged = false;

// Reuse a single CryptoKey-like SecretKey across requests.
const secretKey = JWT_SECRET && JWT_SECRET.length >= 32
  ? new TextEncoder().encode(JWT_SECRET)
  : null;

if (!secretKey) {
  // Failing closed is correct, but a missing secret must never be silent:
  // every protected request is being rejected until this is fixed.
  console.error(
    "[middleware] JWT_SECRET is missing or shorter than 32 characters — protected routes fail closed."
  );
}

/**
 * Verify the access token signature and claims.
 * Returns the decoded payload on success, or `{ expired: true }` when the only
 * failure is expiry (so the caller can attempt a silent refresh). Any other
 * failure (bad signature, malformed, claim mismatch) returns no payload — the
 * caller must reject it without attempting refresh.
 */
async function verifyAccessToken(
  token: string
): Promise<{ payload: JwtPayload | null; expired: boolean }> {
  if (!secretKey) {
    if (!jwtSecretWarningLogged) {
      console.error('[Admin Middleware] JWT_SECRET is missing. Authentication will fail closed.');
      jwtSecretWarningLogged = true;
    }
    return { payload: null, expired: false };
  }
  try {
    const { payload } = await jwtVerify(
      token,
      secretKey,
      JWT_ISSUER ? { issuer: JWT_ISSUER } : {}
    );
    return { payload: payload as unknown as JwtPayload, expired: false };
  } catch (err) {
    const code = (err as { code?: string })?.code;
    return { payload: null, expired: code === "ERR_JWT_EXPIRED" };
  }
}

// Match Go AdminOrModerator exactly (auth_guards.go): ADMIN, SUPER_ADMIN,
// MODERATOR, and SUPPORT. The Go backend remains the final authority.
const ALLOWED_ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "MODERATOR", "SUPPORT"];

const isProtectedRoute = (req: NextRequest): boolean => {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin-login" || pathname.startsWith("/admin-login/")) {
    return false;
  }

  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/coupons") ||
    pathname.startsWith("/revenue") ||
    pathname.startsWith("/subjects") ||
    pathname.startsWith("/api/admin")
  );
};

export async function middleware(req: NextRequest) {
  if (!isProtectedRoute(req)) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  // 1. Check for token presence
  if (!accessToken && !refreshToken) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const url = new URL("/admin-login", req.url);
    url.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  let payload: JwtPayload | null = null;
  let shouldRefresh = false;

  if (accessToken) {
    const result = await verifyAccessToken(accessToken);
    if (result.payload) {
      payload = result.payload;
    } else {
      // Only an authenticated-but-expired access token may trigger rotation.
      // A malformed or incorrectly signed token must never be rescued by a
      // refresh request; doing so creates unnecessary refresh races and widens
      // the replay window during token rotation.
      shouldRefresh = result.expired;
    }
  } else {
    shouldRefresh = true;
  }

  // 2. Perform silent token rotation if needed and refresh token is present
  let nextResponse = NextResponse.next();
  if (shouldRefresh && refreshToken) {
    const backendUrl = getBackendOrigin();
    try {
      const refreshRes = await fetch(`${backendUrl}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Cookie": `refresh_token=${refreshToken}`,
          "Content-Type": "application/json",
        },
      });

      if (refreshRes.ok) {
        // Parse cookies from backend refresh response and forward them to the client
        const setCookies = refreshRes.headers.getSetCookie();
        if (setCookies && setCookies.length > 0) {
          for (const setCookieHeader of setCookies) {
            nextResponse.headers.append("Set-Cookie", setCookieHeader);
          }

          // Verify the freshly issued access token to read trusted claims.
          // Extract the token from the Set-Cookie header (not body) to avoid
          // relying on token exposure in the response body.
          let newToken: string | null = null;
          for (const setCookieHeader of setCookies) {
            const match = setCookieHeader.match(/^access_token=([^;]+)/);
            if (match && match[1] != null) {
              newToken = decodeURIComponent(match[1]);
              break;
            }
          }
          if (!newToken) {
            // Fallback: read from body if cookie header didn't contain the token
            const data = await refreshRes.json();
            newToken = data?.data?.accessToken || data?.accessToken || null;
          }
          if (newToken) {
            const result = await verifyAccessToken(newToken);
            payload = result.payload;
          }
        } else {
          shouldRefresh = false;
        }
      } else {
        // If refresh fails, clear invalid tokens and redirect to login
        const url = new URL("/admin-login", req.url);
        url.searchParams.set("redirect", req.nextUrl.pathname);
        url.searchParams.set("error", "session_expired");
        const redirectRes = NextResponse.redirect(url);
        redirectRes.cookies.delete("access_token");
        redirectRes.cookies.delete("refresh_token");
        return redirectRes;
      }
    } catch (err) {
      // Network error during refresh, allow request to fail gracefully in UI or return error
      if (req.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Service unavailable during session verification" }, { status: 503 });
      }
      // A refresh network failure is not proof of authentication. Fail closed
      // instead of rendering a protected page with an unverifiable session.
      const url = new URL("/admin-login", req.url);
      url.searchParams.set("redirect", req.nextUrl.pathname);
      url.searchParams.set("error", "session_verification_unavailable");
      return NextResponse.redirect(url);
    }
  }

  // 3. Verify the (now signature-verified) claims and enforce role authorization
  if (!payload || !payload.role || !ALLOWED_ADMIN_ROLES.includes(payload.role)) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Access Denied: Insufficient Permissions" }, { status: 403 });
    }
    const url = new URL("/admin-login", req.url);
    url.searchParams.set("error", "insufficient_permissions");
    const redirectRes = NextResponse.redirect(url);
    // Clear cookies to prevent redirect loops
    redirectRes.cookies.delete("access_token");
    redirectRes.cookies.delete("refresh_token");
    return redirectRes;
  }

  // Return the response containing updated set-cookie headers (if rotated successfully)
  return nextResponse;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
