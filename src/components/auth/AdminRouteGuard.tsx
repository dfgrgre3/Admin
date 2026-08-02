"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { usePermission } from "@/components/auth/PermissionGuard";
import { getRequiredPermissionForAdminPath } from "@/lib/admin-panel-route-access";
import { hasPermission } from "@/lib/permissions";
import { logger } from "@/lib/logger";

interface AdminRouteGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Client-side guard for admin routes. Checks if the current user has the
 * required permission for the current pathname. Redirects to /admin if not.
 * 
 * This is a defense-in-depth layer in addition to backend middleware.
 */
export function AdminRouteGuard({ children, fallback }: AdminRouteGuardProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { hasPermission: checkPermission } = usePermission();

  React.useEffect(() => {
    if (isLoading || !user) return;

    // Only guard admin paths
    if (!window.location.pathname.startsWith("/admin")) return;

    const requiredPermission = getRequiredPermissionForAdminPath(window.location.pathname);
    if (!requiredPermission) return;

    const hasAccess = checkPermission(requiredPermission);
    if (!hasAccess) {
      logger.warn(`[AdminRouteGuard] Access denied to ${window.location.pathname}. Required: ${requiredPermission}`);
      router.replace("/admin");
    }
  }, [isLoading, user, router, checkPermission]);

  // Show nothing while loading
  if (isLoading) {
    return fallback || null;
  }

  // If no user, let the parent layout handle redirect
  if (!user) {
    return <>{children}</>;
  }

  // Check permission synchronously for immediate UI feedback
  const requiredPermission = getRequiredPermissionForAdminPath(window.location.pathname);
  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    // Show fallback while redirect happens
    return fallback || (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-bold text-muted-foreground">جاري التحويل...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}