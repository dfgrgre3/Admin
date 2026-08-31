"use client";

import { LazySection } from "@/components/admin/ui/lazy-section";
import { AnalyticsSection } from "./_components/analytics-section";
import { useUserListColumns } from "./_components/use-user-list-columns";
import { useUserListData } from "./_components/use-user-list-data";
import { useUserExport } from "./_components/use-export-handlers";
import { UserListHeader } from "./_components/user-list-header";
import { UserListStatsCards } from "./_components/user-list-stats-cards";
import { useBulkActionOptions } from "./_components/use-bulk-action-options";
import { PageAccessDenied } from "./_components/page-access-denied";
import { PageBreadcrumb } from "./_components/page-breadcrumb";
import { PageErrorBanner } from "./_components/page-error-banner";
import { PageRoleTabs } from "./_components/page-role-tabs";
import { PageStatusTabs } from "./_components/page-status-tabs";
import { PageDialogs } from "./_components/page-dialogs";
import { PageFiltersPanel } from "./_components/page-filters-panel";
import { UsersDataTable } from "./_components/page-data-table";

export default function AdminUsersPage() {
  const s = useUserListData();
  const { handleExportCSV, handleExportJSON } = useUserExport(s);
  const columns = useUserListColumns({
    currentUser: s.currentUser,
    actionLoadingId: s.actionLoadingId,
    canUpdateUsers: s.canUpdateUsers,
    canManageVerification: s.canManageVerification,
    canSuspendUsers: s.canSuspendUsers,
    canManagePassword: s.canManagePassword,
    canAssignRoles: s.canAssignRoles,
    canViewSessions: s.canViewSessions,
    canTerminateSessions: s.canTerminateSessions,
    canViewActivity: s.canViewActivity,
    canViewAudit: s.canViewAudit,
    canViewOrders: s.canViewOrders,
    canViewFinancial: s.canViewFinancial,
    canViewCertificates: s.canViewCertificates,
    canViewSupport: s.canViewSupport,
    canSendNotifications: s.canSendNotifications,
    canManageUsers: s.canManageUsers,
    canAssignPermissions: s.canAssignPermissions,
    canRestoreUsers: s.canRestoreUsers,
    canDeleteUsers: s.canDeleteUsers,
    setVerifyDialog: s.setVerifyDialog,
    onSendActivationLink: (user) => void s.handleSendActivationLink(user.id),
    setSuspendDialog: s.setSuspendDialog,
    setActivateDialog: s.setActivateDialog,
    setPasswordDialog: s.setPasswordDialog,
    setRoleDialog: s.setRoleDialog,
    onTerminateAllSessions: (user) => void s.handleTerminateAllSessions(user.id),
    setMessageDialog: s.setMessageDialog,
    setImpersonateDialog: s.setImpersonateDialog,
    setRestoreDialog: s.setRestoreDialog,
    setDeleteDialog: s.setDeleteDialog,
  });

  const bulkActions = useBulkActionOptions(s);

  if (!s.canViewUsers) {
    return <PageAccessDenied onBack={() => s.router.push("/admin")} />;
  }

  return (
    <div className="space-y-8 pb-20 max-w-[1600px] mx-auto px-4 md:px-6" dir="rtl">
      <PageBreadcrumb router={s.router} isConnected={s.isConnected} />

      <UserListHeader
        totalUsers={s.data?.pagination?.total}
        onlineNow={s.data?.summary?.onlineNow}
        canExportUsers={s.canExportUsers}
        canImportUsers={s.canImportUsers}
        canCreateUsers={s.canCreateUsers}
        exporting={s.exporting}
        exportingJson={s.exportingJson}
        handleExportCSV={handleExportCSV}
        handleExportJSON={handleExportJSON}
        onImportClick={() => s.setImportDialogOpen(true)}
        onCreateClick={() => s.router.push("/admin/users/create")}
      />

      <UserListStatsCards summary={s.data?.summary} />

      <LazySection minHeight={320} rootMargin="250px">
        <AnalyticsSection />
      </LazySection>

      <PageRoleTabs
        value={s.role}
        onChange={(val) => {
          s.setRole(val as typeof s.role);
          s.setPage(1);
        }}
      />

      <PageStatusTabs
        value={s.status}
        onChange={(val) => {
          s.setStatus(val as typeof s.status);
          s.setPage(1);
        }}
      />

      {s.isError ? <PageErrorBanner error={s.error} onRetry={() => void s.refetch()} /> : null}

      <PageFiltersPanel
        open={s.advancedFiltersOpen}
        onToggle={() => s.setAdvancedFiltersOpen(!s.advancedFiltersOpen)}
        hasActiveFilters={s.hasActiveFilters}
        onClearAll={s.clearAllFilters}
        canViewFinancial={s.canViewFinancial}
        filters={s}
        onResetPage={() => s.setPage(1)}
      />

      <UsersDataTable
        columns={columns}
        users={s.data?.users || []}
        isLoading={s.isLoading}
        isError={s.isError}
        hasActiveFilters={s.hasActiveFilters}
        page={s.page}
        limit={s.limit}
        total={s.data?.pagination?.total || 0}
        totalPages={s.data?.pagination?.totalPages || 1}
        search={s.search}
        advancedFiltersOpen={s.advancedFiltersOpen}
        bulkActions={bulkActions}
        onSetPage={s.setPage}
        onSetLimit={s.setLimit}
        onSetSortBy={s.setSortBy}
        onSetSortOrder={s.setSortOrder}
        onSetSearch={s.setSearch}
        onUpdateQuerySearch={s.updateQuerySearch}
        onToggleAdvancedFilters={() => s.setAdvancedFiltersOpen(!s.advancedFiltersOpen)}
        onClearFilters={s.clearAllFilters}
        onResetPage={() => s.setPage(1)}
        onRefetch={() => s.refetch()}
        onSelectAllPages={(ids) => {
          s.allSelectedIdsRef.current = ids;
        }}
        fetchExportRows={s.fetchExportRows}
        allSelectedIdsRef={s.allSelectedIdsRef}
      />

      <PageDialogs state={s} />
    </div>
  );
}