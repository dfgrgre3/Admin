"use client";

import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout/admin-layout";
import { useAuth } from "@/contexts/auth-context";
import { isStaffAdminPanelRole } from "@/lib/auth/admin-panel-roles";
import { getRequiredPermissionForAdminPath } from "@/lib/admin-panel-route-access";
import { hasPermission } from "@/lib/permissions";
import {
  adminDashboardQueryKey,
  fetchAdminDashboard,
} from "@/hooks/dashboard/use-admin-dashboard-query";
import { PERFORMANCE_DEFAULTS } from "@/lib/performance-config";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);
  const queryClient = useQueryClient();

  // Warm the dashboard cache in parallel with the profile request (`/me`).
  // Previously the page could only mount AFTER auth resolved, and only then
  // fired its own data fetch — two serial round-trips on every cold load.
  // Prefetching here collapses them into one: when the page mounts, react-query
  // serves the warmed entry (staleTime keeps it fresh) and paints immediately.
  // An unauthorized user simply produces a silent 403 from this prefetch —
  // the API remains the permission authority and nothing renders from it.
  useEffect(() => {
    const warmKey = adminDashboardQueryKey("today");
    if (queryClient.getQueryData(warmKey)) return;
    void queryClient.prefetchQuery({
      queryKey: warmKey,
      queryFn: () => fetchAdminDashboard("today"),
      staleTime: PERFORMANCE_DEFAULTS.queryStaleTimeMs,
      gcTime: PERFORMANCE_DEFAULTS.queryGcTimeMs,
    });
  }, [queryClient]);

  useEffect(() => {
    if (isLoading) return;
    if (hasRedirected.current) return;

    if (!isAuthenticated) {
      hasRedirected.current = true;
      router.replace("/admin-login");
      return;
    }

    if (isAuthenticated && !isStaffAdminPanelRole(user?.role)) {
      hasRedirected.current = true;
      router.replace("/admin-login?error=unauthorized_role");
    }
  }, [isLoading, isAuthenticated, user?.role, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background" dir="rtl" role="status" aria-label="جاري التحقق من الصلاحيات">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" aria-hidden="true" />
          <p className="text-sm font-bold text-muted-foreground">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isStaffAdminPanelRole(user?.role)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background" dir="rtl" role="status" aria-label="جاري التوجيه">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" aria-hidden="true" />
          <p className="text-sm font-bold text-muted-foreground">يتم توجيهك إلى صفحة الإدارة...</p>
        </div>
      </div>
    );
  }

  const requiredPermission = pathname ? getRequiredPermissionForAdminPath(pathname) : null;
  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return (
      <main className="flex h-screen items-center justify-center bg-background p-6 text-center" dir="rtl">
        <div role="alert">
          <h1 className="text-xl font-bold">غير مصرح لك بالوصول إلى هذه الصفحة</h1>
          <p className="mt-2 text-sm text-muted-foreground">تم تطبيق صلاحيات حسابك الحالية.</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  );
}
