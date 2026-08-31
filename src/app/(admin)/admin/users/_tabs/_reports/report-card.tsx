"use client";

import { Flag } from "lucide-react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { formatDate } from "@/lib/utils";
import type { Report } from "./report-types";
import { PriorityBadge, StatusBadge, TypeBadge } from "./report-badges";

interface ReportCardProps {
  report: Report;
}

export function ReportCard({ report }: ReportCardProps) {
  return (
    <div className="flex items-start justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
          <Flag className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold text-white">{report.subject}</p>
            <TypeBadge type={report.type} />
            <PriorityBadge priority={report.priority} />
          </div>
          <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
          {report.moderatorNotes ? (
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 mb-2">
              <p className="text-xs text-muted-foreground font-bold mb-1">ملاحظات المشرف:</p>
              <p className="text-sm text-white">{report.moderatorNotes}</p>
            </div>
          ) : null}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>تاريخ البلاغ: {formatDate(report.createdAt)}</span>
            {report.reportedBy ? <span>• بلّغ عنه: {report.reportedBy}</span> : null}
            {report.resolvedAt ? <span>• تم الحل: {formatDate(report.resolvedAt)}</span> : null}
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <StatusBadge status={report.status} />
      </div>
    </div>
  );
}

export function ReportsLoadingState() {
  return (
    <AdminCard variant="glass" className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-white/5 rounded w-1/3"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    </AdminCard>
  );
}

export function ReportsEmptyState() {
  return (
    <AdminCard variant="glass" className="p-6">
      <h3 className="text-xl font-black mb-4">البلاغات</h3>
      <p className="text-muted-foreground text-center py-8">لا توجد بلاغات</p>
    </AdminCard>
  );
}