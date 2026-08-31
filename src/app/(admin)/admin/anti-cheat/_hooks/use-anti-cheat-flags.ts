"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/admin-api";
import { apiRoutes } from "@/lib/api/routes";
import { ANTI_CHEAT_QUERY_KEY, REFRESH_INTERVALS } from "../_lib/constants";
import type {
  AntiCheatEvent,
  AntiCheatEventsResponse,
  AntiCheatFlag,
  AntiCheatFlagDetail,
  AntiCheatFlagResponse,
} from "../_components/types";
import { buildQueryParams } from "../_lib/utils";

interface UseAntiCheatFlagsOptions {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  minRisk?: number | string;
  examId?: string;
  enabled?: boolean;
  refetchInterval?: number;
}

export function useAntiCheatFlags(options: UseAntiCheatFlagsOptions) {
  const {
    page,
    limit,
    search = "",
    status = "all",
    minRisk = "all",
    examId = "all",
    enabled = true,
    refetchInterval,
  } = options;

  return useQuery({
    queryKey: [
      ANTI_CHEAT_QUERY_KEY,
      "flags",
      page,
      limit,
      search,
      status,
      minRisk,
      examId,
    ],
    queryFn: async () => {
      const params = buildQueryParams({
        page,
        limit,
        search: search || undefined,
        status: status !== "all" ? status : undefined,
        minRisk: minRisk !== "all" ? minRisk : undefined,
        examId: examId !== "all" ? examId : undefined,
      });
      const response = await adminFetch(
        `${apiRoutes.admin.antiCheat}?${params.toString()}`
      );
      if (!response.ok) throw new Error("فشل في جلب حالات الغش");
      const json = await response.json();
      return (json.data || json) as AntiCheatFlagResponse;
    },
    enabled,
    placeholderData: (prev) => prev,
    refetchInterval,
    staleTime: 10_000,
  });
}

interface UseAntiCheatEventsOptions {
  page: number;
  limit: number;
  search?: string;
  type?: string;
  severity?: string;
  refetchInterval?: number;
}

export function useAntiCheatEvents(options: UseAntiCheatEventsOptions) {
  const {
    page,
    limit,
    search = "",
    type = "all",
    severity = "all",
    refetchInterval,
  } = options;

  return useQuery({
    queryKey: [ANTI_CHEAT_QUERY_KEY, "events", page, limit, search, type, severity],
    queryFn: async () => {
      const params = buildQueryParams({
        page,
        limit,
        search: search || undefined,
        type: type !== "all" ? type : undefined,
        severity: severity !== "all" ? severity : undefined,
      });
      const response = await adminFetch(
        `${apiRoutes.admin.antiCheatEvents}?${params.toString()}`
      );
      if (!response.ok) throw new Error("فشل في جلب أحداث المراقبة");
      const json = await response.json();
      return (json.data || json) as AntiCheatEventsResponse;
    },
    placeholderData: (prev) => prev,
    refetchInterval,
    staleTime: 10_000,
  });
}

export function useAntiCheatFlagDetail(flagId: string | null, enabled = true) {
  return useQuery({
    queryKey: [ANTI_CHEAT_QUERY_KEY, "flag", flagId],
    queryFn: async () => {
      const response = await adminFetch(
        apiRoutes.admin.antiCheatFlag(flagId as string)
      );
      if (!response.ok) throw new Error("فشل في جلب تفاصيل الحالة");
      const json = await response.json();
      return (json.data || json) as AntiCheatFlagDetail;
    },
    enabled: enabled && Boolean(flagId),
    staleTime: 5_000,
  });
}

export function useAntiCheatStats(refetchInterval = REFRESH_INTERVALS.NORMAL) {
  return useQuery({
    queryKey: [ANTI_CHEAT_QUERY_KEY, "stats"],
    queryFn: async () => {
      const response = await adminFetch(apiRoutes.admin.antiCheatStats);
      if (!response.ok) throw new Error("فشل في جلب الإحصاءات");
      const json = await response.json();
      return (json.data || json) as {
        summary: import("../_components/types").AntiCheatSummary;
      };
    },
    refetchInterval,
    staleTime: 15_000,
  });
}

export function useInvalidateAntiCheat() {
  const queryClient = useQueryClient();
  return React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [ANTI_CHEAT_QUERY_KEY] });
  }, [queryClient]);
}

export function usePrefetchAntiCheat() {
  const queryClient = useQueryClient();
  return React.useCallback(
    (id: string) => {
      queryClient.prefetchQuery({
        queryKey: [ANTI_CHEAT_QUERY_KEY, "flag", id],
        queryFn: async () => {
          const response = await adminFetch(apiRoutes.admin.antiCheatFlag(id));
          if (!response.ok) throw new Error("failed");
          const json = await response.json();
          return (json.data || json) as AntiCheatFlagDetail;
        },
      });
    },
    [queryClient]
  );
}

export type { AntiCheatEvent, AntiCheatFlag, AntiCheatFlagDetail };