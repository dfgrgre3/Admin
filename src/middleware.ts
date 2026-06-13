import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/coupons(.*)",
  "/revenue(.*)",
  "/subjects(.*)",
  "/api/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = new URL(req.url);

  // If user is authenticated and on login page, redirect to admin dashboard
  if (userId && url.pathname === "/admin-login") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (isProtectedRoute(req)) {
    if (!userId) {
      // Return 401 for API routes, redirect to login page for pages
      if (url.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
      const loginUrl = new URL("/admin-login", req.url);
      loginUrl.searchParams.set("redirect", url.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API and RPC routes
    "/(api|trpc)(.*)",
  ],
};
