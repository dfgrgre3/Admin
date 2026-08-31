"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminUsersApi } from "@/lib/api/admin-users-api";
import { useAdaptiveDebounce } from "@/hooks/use-adaptive-debounce";
import { logger } from "@/lib/logger";
import { useUserListPermissions } from "./_hooks/use-user-list-permissions";
import { useUserListFilters } from "./_hooks/use-user-list-filters";
import { useUserListDialogs } from "./_hooks/use-user-list-dialogs";
import { useUserListQuery } from "./_hooks/use-user-list-query";
import { useUserListActions } from "./_hooks/use-user-list-actions";
import { fetchExportRows, useUserListImport } from "./_hooks/use-user-list-export";
import { adminAudit } from "@/lib/admin-audit";
import { getUserActionBlockReason } from "@/lib/user-action-guards";
import type { AdminUserListItem } from "@/lib/api/admin-users-api";

export function useUserListData() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const perms = useUserListPermissions();
  const filters = useUserListFilters();
  const dialogs = useUserListDialogs();
  const { query, queryKey, isConnected } = useUserListQuery({
    page: filters.page,
    limit: filters.limit,
    querySearch: filters.querySearch,
    role: filters.role,
    status: filters.status,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    country: filters.country,
    city: filters.city,
    gender: filters.gender,
    verified: filters.verified,
    subscriptionStatus: filters.subscriptionStatus,
    online: filters.online,
    createdFrom: filters.createdFrom,
    createdTo: filters.createdTo,
    walletMin: filters.walletMin,
    walletMax: filters.walletMax,
    includeDeleted: filters.includeDeleted,
  });
  const actions = useUserListActions();
  const handleImport = useUserListImport(perms.canImportUsers);

  const { debouncedCallback: updateQuerySearchDebounced } = useAdaptiveDebounce(
    (value: unknown) => filters.setQuerySearch(String(value)),
    { minDelay: 300, maxDelay: 500, initialDelay: 350 },
  );

  const exportAbortControllerRef = React.useRef<AbortController | null>(null);
  const allSelectedIdsRef = React.useRef<string[]>([]);

  React.useEffect(() => {
    exportAbortControllerRef.current = new AbortController();
    return () => {
      exportAbortControllerRef.current?.abort();
    };
  }, []);

  const refreshWithOptimistic = async (ids: string[], changes: Partial<AdminUserListItem>) => {
    queryClient.setQueryData(queryKey, (old: unknown) => {
      const data = old as { users: AdminUserListItem[] } | undefined;
      if (!data) return old;
      return {
        ...data,
        users: data.users.map(item => (ids.includes(item.id) ? { ...item, ...changes } : item)),
      };
    });
    await query.refetch();
  };

  const handleDelete = async (ids: string[]) => {
    dialogs.setActionLoadingId("bulk-delete");
    try {
      if (!perms.canDeleteUsers) throw new Error("غير مصرح بتنفيذ الإجراء");
      const targets = (query.data?.users || []).filter(item => ids.includes(item.id));
      const allowed = targets.filter(target => !getUserActionBlockReason(perms.currentUser, target, "delete"));
      const blockedCount = targets.length - allowed.length;
      const result = await adminUsersApi.bulkRemove(allowed.map(t => t.id));
      if (result.deleted) {
        toast.success(`تم حذف ${result.deleted} مستخدم بنجاح`);
        adminAudit.record("users.bulk_delete", { ids: allowed.map(t => t.id), deleted: result.deleted });
      }
      if (blockedCount) toast.warning(`تم استبعاد ${blockedCount} حساب محمي`);
      if (result.failed) toast.error(`فشل حذف ${result.failed} مستخدم`);
      await query.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطأ في الاتصال بالخادم");
      logger.error("Bulk delete failed", err);
    } finally {
      dialogs.setDeleteDialog({ open: false, ids: [] });
      dialogs.setActionLoadingId(null);
    }
  };

  return {
    router,
    isConnected,
    ...perms,
    ...filters,
    updateQuerySearch: (v: string) => {
      filters.setSearch(v);
      updateQuerySearchDebounced(v);
    },
    ...dialogs,
    allSelectedIdsRef,
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    handleDelete,
    handleRestore: actions.handleRestore,
    handleSuspend: actions.handleSuspend,
    handleActivate: actions.handleActivate,
    handleResetPassword: actions.handleResetPassword,
    handleVerify: actions.handleVerify,
    handleAssignRole: actions.handleAssignRole,
    handleImpersonate: actions.handleImpersonate,
    handleTerminateAllSessions: actions.handleTerminateAllSessions,
    handleSendActivationLink: actions.handleSendActivationLink,
    fetchExportRows: () => fetchExportRows({
      querySearch: filters.querySearch,
      role: filters.role,
      status: filters.status,
      country: filters.country,
      city: filters.city,
      gender: filters.gender,
      verified: filters.verified,
      subscriptionStatus: filters.subscriptionStatus,
      online: filters.online,
      createdFrom: filters.createdFrom,
      createdTo: filters.createdTo,
      walletMin: filters.walletMin,
      walletMax: filters.walletMax,
      includeDeleted: filters.includeDeleted,
    }, exportAbortControllerRef.current ?? new AbortController()),
    handleImport,
    refreshWithOptimistic,
  };
}