"use client";

import { toast } from "sonner";
import { adminUsersApi } from "@/lib/api/admin-users-api";
import { UserRole, UserStatus } from "@/types/enums";
import { logger } from "@/lib/logger";

interface ExportFilters {
  querySearch: string;
  role: string;
  status: string;
  country: string;
  city: string;
  gender: string;
  verified: string;
  subscriptionStatus: string;
  online: string;
  createdFrom: string;
  createdTo: string;
  walletMin: string;
  walletMax: string;
  includeDeleted: boolean;
}

export function fetchExportRows(filters: ExportFilters, abortController: AbortController) {
  return (async () => {
    const first = await adminUsersApi.list({
      page: 1,
      limit: 200,
      search: filters.querySearch,
      role: filters.role === "all" ? undefined : (filters.role as UserRole),
      status: filters.status === "all" ? undefined : (filters.status as UserStatus),
      sortBy: "createdAt",
      sortOrder: "desc",
      country: filters.country || undefined,
      city: filters.city || undefined,
      gender: filters.gender === "all" ? undefined : filters.gender,
      emailVerified: filters.verified === "all" ? undefined : filters.verified === "verified",
      subscriptionStatus: filters.subscriptionStatus === "all" ? undefined : filters.subscriptionStatus,
      isOnline: filters.online === "all" ? undefined : filters.online === "online",
      createdFrom: filters.createdFrom || undefined,
      createdTo: filters.createdTo || undefined,
      walletMin: filters.walletMin ? Number(filters.walletMin) : undefined,
      walletMax: filters.walletMax ? Number(filters.walletMax) : undefined,
      includeDeleted: filters.includeDeleted || filters.status === UserStatus.DELETED || undefined,
      isNew: filters.status === "NEW" ? true : undefined,
    }, { signal: abortController.signal });

    const totalPages = first.pagination.totalPages;
    if (totalPages <= 1) return first.users;

    const remaining = [];
    for (let startPage = 2; startPage <= totalPages; startPage += 4) {
      if (abortController.signal.aborted) return [];
      const batch = await Promise.all(
        Array.from({ length: Math.min(4, totalPages - startPage + 1) }, (_, index) =>
          adminUsersApi.list({
            page: startPage + index,
            limit: 200,
            search: filters.querySearch,
            role: filters.role === "all" ? undefined : (filters.role as UserRole),
            status: filters.status === "all" ? undefined : (filters.status as UserStatus),
            sortBy: "createdAt",
            sortOrder: "desc",
            country: filters.country || undefined,
            city: filters.city || undefined,
            gender: filters.gender === "all" ? undefined : filters.gender,
            emailVerified: filters.verified === "all" ? undefined : filters.verified === "verified",
            subscriptionStatus: filters.subscriptionStatus === "all" ? undefined : filters.subscriptionStatus,
            isOnline: filters.online === "all" ? undefined : filters.online === "online",
            createdFrom: filters.createdFrom || undefined,
            createdTo: filters.createdTo || undefined,
            walletMin: filters.walletMin ? Number(filters.walletMin) : undefined,
            walletMax: filters.walletMax ? Number(filters.walletMax) : undefined,
            includeDeleted: filters.includeDeleted || filters.status === UserStatus.DELETED || undefined,
            isNew: filters.status === "NEW" ? true : undefined,
          }, { signal: abortController.signal }),
        ),
      );
      remaining.push(...batch);
    }
    return [first, ...remaining].flatMap(result => result.users);
  })();
}

export function useUserListImport(canImportUsers: boolean) {
  return async (rows: Record<string, unknown>[]) => {
    if (!canImportUsers) {
      toast.error("غير مصرح بالاستيراد");
      return;
    }
    try {
      const payload = rows.map(row => ({
        email: String(row.email),
        name: String(row.name),
        username: row.username ? String(row.username) : undefined,
        password: String(row.password),
        role: row.role ? String(row.role) : "STUDENT",
      }));
      const result = await adminUsersApi.bulkCreate(payload);
      if (result.created > 0) {
        toast.success(`تم استيراد ${result.created} مستخدم بنجاح دفعة واحدة`);
      }
      if (result.failed > 0) {
        toast.warning(`فشل في استيراد ${result.failed} مستخدم`);
      }
    } catch (err) {
      toast.error("حدث خطأ في الاتصال أثناء الاستيراد الجماعي");
      logger.error("Import failed", err);
    }
  };
}