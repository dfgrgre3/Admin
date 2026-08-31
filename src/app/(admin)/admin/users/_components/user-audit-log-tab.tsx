"use client";

import { AdminCard } from "@/components/admin/ui/admin-card";
import { useAuditLogs } from "../_tabs/_audit/use-audit-logs";
import { AuditStats } from "../_tabs/_audit/audit-stats";
import { AuditLogCard } from "../_tabs/_audit/audit-log-card";
import { AuditLoadingState, AuditErrorState, AuditEmptyState } from "../_tabs/_audit/audit-feedback";
import { AuditLoadMore } from "../_tabs/_audit/audit-load-more";
import type { UserAuditLogTabProps } from "../_tabs/_audit/_audit-types";

export function UserAuditLogTab({ userId }: UserAuditLogTabProps) {
  const { logs, pagination, page, loading, loadingMore, error, hasMore, fetchLogs } = useAuditLogs(userId);

  if (loading) return <AuditLoadingState />;
  if (error) return <AuditErrorState error={error} onRetry={() => void fetchLogs(1, false)} />;

  const total = pagination?.total ?? logs.length;
  return (
    <div className="space-y-4">
      <AuditStats logs={logs} total={total} />
      <AdminCard variant="glass" className="p-6">
        <h3 className="text-xl font-black mb-4">سجل التدقيق</h3>
        {logs.length === 0 ? (
          <AuditEmptyState />
        ) : (
          <div className="space-y-3">
            {logs.map((log) => <AuditLogCard key={log.id} log={log} />)}
          </div>
        )}
        <AuditLoadMore hasMore={hasMore} loading={loadingMore} onLoadMore={() => void fetchLogs(page + 1, true)} />
      </AdminCard>
    </div>
  );
}