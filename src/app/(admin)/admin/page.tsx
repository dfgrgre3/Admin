"use client";

import dynamic from "next/dynamic";
import { DashboardSkeleton } from "@/components/admin/ui/loading-skeleton";
import { DraggableDashboard } from "@/components/admin/dashboard/draggable-dashboard";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { DashboardHeader } from "@/components/admin/dashboard/dashboard-header";
import { DashboardErrorBanner } from "@/components/admin/dashboard/dashboard-error-banner";
import { useDashboardData } from "@/hooks/use-dashboard-data";

const BroadcastModal = dynamic(() => import("@/components/admin/broadcast/broadcast-modal").then(mod => ({ default: mod.BroadcastModal })), {
  ssr: false,
  loading: () => null,
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
    handleRefresh,
  } = useDashboardData();

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-12 pb-20" dir="rtl">
      <PermissionGuard permission={PERMISSIONS.DASHBOARD_VIEW} fallback={
        <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-10 text-center text-red-200" role="alert">
          لا تملك صلاحية عرض لوحة التحكم.
        </div>
      }>
        <DashboardHeader
          userName={user?.name ?? undefined}
          userRole={user?.role ? String(user.role) : undefined}
          wsConnected={wsConnected}
          isFetching={isFetching}
          lastUpdated={lastUpdated}
          onExport={handleExport}
          onRefresh={handleRefresh}
        />

        {isError && (
          <DashboardErrorBanner
            errorCount={errors.length}
            isFetching={isFetching}
            onRefresh={handleRefresh}
          />
        )}

        <DraggableDashboard onOrderChange={() => {}}>{sections}</DraggableDashboard>
      </PermissionGuard>

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
