"use client";

import * as React from "react";
import { adminFetch } from "@/lib/api/admin-api";
import { logger } from "@/lib/logger";
import type { AuditLog, AuditLogsResponse } from "./_audit-types";

interface UseAuditLogsResult {
  logs: AuditLog[];
  pagination: AuditLogsResponse["pagination"] | null;
  page: number;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  fetchLogs: (targetPage: number, append: boolean) => Promise<void>;
}

export function useAuditLogs(userId: string): UseAuditLogsResult {
  const [logs, setLogs] = React.useState<AuditLog[]>([]);
  const [pagination, setPagination] = React.useState<AuditLogsResponse["pagination"] | null>(null);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchLogs = React.useCallback(async (targetPage: number, append: boolean) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);
    try {
      const response = await adminFetch(`/admin/users/${userId}/audit-logs?page=${targetPage}&limit=20`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const json = await response.json();
      const data: AuditLogsResponse = json?.data ?? json;
      setLogs((prev) => (append ? [...prev, ...(data.items || [])] : data.items || []));
      setPagination(data.pagination ?? null);
      setPage(targetPage);
    } catch (err) {
      logger.error("Error fetching audit logs:", err);
      setError("تعذّر تحميل سجل التدقيق. يُرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [userId]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => void fetchLogs(1, false), 0);
    return () => window.clearTimeout(timer);
  }, [fetchLogs]);

  const hasMore = pagination ? page < pagination.totalPages : false;
  return { logs, pagination, page, loading, loadingMore, error, hasMore, fetchLogs };
}