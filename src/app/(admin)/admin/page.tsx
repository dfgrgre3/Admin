"use client";

import dynamic from "next/dynamic";
import { WifiOff, Clock } from "lucide-react";
import { DashboardSkeleton } from "@/components/admin/ui/loading-skeleton";
import { DraggableDashboard } from "@/components/admin/dashboard/draggable-dashboard";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { DashboardHeader } from "@/components/admin/dashboard/dashboard-header";
import { DashboardErrorBanner } from "@/components/admin/dashboard/dashboard-error-banner";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useNetworkStatus } from "@/hooks/use-network-status";

const BroadcastModal = dynamic(() => import("@/components/admin/broadcast/broadcast-modal").then(mod => ({ default: mod.BroadcastModal })), {
  ssr: false,
  loading: () => null,
});

const TIME_FORMATTER = new Intl.DateTimeFormat("ar-EG", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export default function AdminDashboardPage() {
  const {
    user,
    wsConnected,
    isBroadcastOpen,
    setIsBroadcastOpen,
    lastUpdated,
    broadcastUsers,
    segments,
    selectedSegment,
    usersLoading,
    selectSegment,
    setSearch,
    isLoading,
    isFetching,
    isError,
    errors,
    sections,
    handleExport,
    isExporting,
    handleRefresh,
  } = useDashboardData();

  const isOnline = useNetworkStatus();

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="dashboard-home-shell pb-20" dir="rtl">
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="fixed right-4 top-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-lg transition-transform transform translate-y-[-100%] focus:translate-y-0"
      >
        تجاوز إلى المحتوى الرئيسي
      </a>

      <PermissionGuard permission={PERMISSIONS.DASHBOARD_VIEW} fallback={
        <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-10 text-center text-red-200" role="alert" aria-labelledby="permission-error-title">
          <h2 id="permission-error-title" className="text-xl font-bold mb-2">لا تملك الصلاحية المطلوبة</h2>
          <p className="text-sm">عذراً، لا تملك صلاحية عرض لوحة التحكم. يرجى الاتصال بالمسؤول.</p>
        </div>
      }>

        {/* Main Content Area */}
        <main id="main-content" aria-label="لوحة التحكم الرئيسية">
          <DashboardHeader
            userName={user?.name ?? undefined}
            userRole={user?.role ? String(user.role) : undefined}
            wsConnected={wsConnected && isOnline}
            isFetching={isFetching && isOnline}
            lastUpdated={lastUpdated}
            onExport={handleExport}
            onRefresh={handleRefresh}
            refreshDisabled={!isOnline}
            isExporting={isExporting}
          />

          {/* Offline Warning Banner */}
          {!isOnline && (
            <div
              className="flex items-center gap-4 rounded-[2rem] border border-amber-500/30 bg-amber-500/10 px-6 py-4 text-amber-300 mb-6"
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20" aria-hidden="true">
                <WifiOff className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm text-amber-200">انقطع الاتصال بالإنترنت</p>
                <p className="text-xs text-amber-400 mt-0.5">
                  البيانات المعروضة آخر نسخة محفوظة
                  {lastUpdated && (
                    <span className="inline-flex items-center gap-1 mr-2">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {TIME_FORMATTER.format(lastUpdated)}
                    </span>
                  )}
                  — ستُستأنف التحديثات تلقائياً عند استعادة الاتصال.
                </p>
              </div>
            </div>
          )}

          {isError && (
            <DashboardErrorBanner
              errorCount={errors.length}
              isFetching={isFetching && isOnline}
              onRefresh={handleRefresh}
            />
          )}

          <DraggableDashboard onOrderChange={() => {}}>{sections}</DraggableDashboard>
        </main>
      </PermissionGuard>

      {/* Broadcast Modal */}
      <BroadcastModal
        open={isBroadcastOpen}
        onOpenChange={setIsBroadcastOpen}
        users={broadcastUsers}
        segments={segments}
        selectedSegment={selectedSegment}
        onSelectSegment={selectSegment}
        onSearch={setSearch}
        isLoading={usersLoading}
      />
    </div>
  );
}
