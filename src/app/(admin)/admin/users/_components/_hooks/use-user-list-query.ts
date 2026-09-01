"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { adminUsersApi, type AdminUsersPage as AdminUsersPageData } from "@/lib/api/admin-users-api";
import { UserRole, UserStatus } from "@/types/enums";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";

export function useUserListQuery(params: {
  page: number;
  limit: number;
  querySearch: string;
  role: string;
  status: string;
  sortBy: string;
  sortOrder: string;
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
}) {
  const { isConnected } = useAdminRealtime();

  const queryKey = [
    "admin-users-list",
    params.page,
    params.limit,
    params.querySearch,
    params.role,
    params.status,
    params.sortBy,
    params.sortOrder,
    params.country,
    params.city,
    params.gender,
    params.verified,
    params.subscriptionStatus,
    params.online,
    params.createdFrom,
    params.createdTo,
    params.walletMin,
    params.walletMax,
    params.includeDeleted,
  ] as const;

  const query = useQuery<AdminUsersPageData>({
    queryKey,
    queryFn: () =>
      adminUsersApi.list({
        page: params.page,
        limit: params.limit,
        search: params.querySearch || undefined,
        role: params.role === "all" ? undefined : (params.role as UserRole),
        status: params.status === "all" ? undefined : (params.status as UserStatus),
        sortBy: params.sortBy as "name" | "createdAt" | "lastLogin" | "totalXP" | "status" | "walletBalance" | "coursesCount" | "ordersCount",
        sortOrder: params.sortOrder as "asc" | "desc",
        country: params.country || undefined,
        city: params.city || undefined,
        gender: params.gender === "all" ? undefined : params.gender,
        emailVerified: params.verified === "all" ? undefined : params.verified === "verified",
        subscriptionStatus: params.subscriptionStatus === "all" ? undefined : params.subscriptionStatus,
        isOnline: params.online === "all" ? undefined : params.online === "online",
        createdFrom: params.createdFrom || undefined,
        createdTo: params.createdTo || undefined,
        walletMin: params.walletMin ? Number(params.walletMin) : undefined,
        walletMax: params.walletMax ? Number(params.walletMax) : undefined,
        includeDeleted: params.includeDeleted || params.status === UserStatus.DELETED || undefined,
        isNew: params.status === "NEW" ? true : undefined,
      }),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return { query, queryKey, isConnected };
}