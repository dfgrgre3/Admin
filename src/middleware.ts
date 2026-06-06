import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

// Match routes under (admin) group: /admin, /coupons, /revenue, /subjects
export const config = {
  matcher: [
    "/admin/:path*",
    "/coupons/:path*",
    "/revenue/:path*",
    "/subjects/:path*",
  ],
};

const JWT_SECRET = process.env.JWT_SECRET || "fallback-jwt-secret-for-dev-only";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin-login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    const role = payload.role as string | undefined;
    if (role !== "ADMIN" && role !== "MODERATOR") {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("JWT verification failed in Admin Middleware:", error);
    const url = request.nextUrl.clone();
    url.pathname = "/admin-login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    
    // Clear cookies so they don't get stuck in redirect loop
    const response = NextResponse.redirect(url);
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }
}
