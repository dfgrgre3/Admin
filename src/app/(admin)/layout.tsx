"use client";

import { AdminLayout } from "@/components/admin/layout/admin-layout";
import { useAuth } from "@/contexts/auth-context";
import { isStaffAdminPanelRole } from "@/lib/auth/admin-panel-roles";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Guard component that redirects unauthenticated or non‑admin users to the
 * appropriate page. This is kept inside the layout so every admin page is
 * protected automatically.
 */
function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (isLoading || hasRedirected.current) return;

    if (!isAuthenticated) {
      hasRedirected.current = true;
      router.replace("/admin-login");
    } else if (isAuthenticated && !isStaffAdminPanelRole(user?.role)) {
      hasRedirected.current = true;
      // Redirect to admin-login with error param to prevent looping back
      router.replace("/admin-login?error=unauthorized_role");
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Reset the redirect guard if deps change substantially
  useEffect(() => {
    hasRedirected.current = false;
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-bold text-muted-foreground">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isStaffAdminPanelRole(user?.role)) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Root layout for the entire admin section. All files inside `app/(admin)`
 * automatically inherit this layout, giving them the sidebar, header and
 * access‑gate behaviour.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  );
}