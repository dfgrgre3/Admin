"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import { Flag, AlertTriangle, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Report {
  id: string;
  type: "spam" | "harassment" | "inappropriate_content" | "fraud" | "other";
  subject: string;
  description: string;
  status: "pending" | "reviewing" | "resolved" | "dismissed";
  priority: "low" | "medium" | "high" | "critical";
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  reportedBy?: string;
  moderatorNotes?: string;
}

interface UserReportsTabProps {
  userId: string;
}

export function UserReportsTab({ userId: _userId }: UserReportsTabProps) {
  const [reports] = React.useState<Report[]>([]);
  const [loading] = React.useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline"; icon: LucideIcon }> = {
      pending: { label: "معلق", variant: "secondary", icon: Clock },
      reviewing: { label: "قيد المراجعة", variant: "default", icon: Eye },
      resolved: { label: "تم الحل", variant: "default", icon: CheckCircle },
      dismissed: { label: "مرفوض", variant: "outline", icon: XCircle },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config?.icon || Clock;
    return (
      <Badge variant={config?.variant ?? "secondary"} className="gap-1">
        <Icon className="h-3 w-3" />
        {config?.label ?? "معلق"}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig: Record<string, { label: string; color: string }> = {
      spam: { label: "بريد مزعج", color: "bg-gray-500/10 text-gray-500" },
      harassment: { label: "تحرش", color: "bg-red-500/10 text-red-500" },
      inappropriate_content: { label: "محتوى غير لائق", color: "bg-orange-500/10 text-orange-500" },
      fraud: { label: "احتيال", color: "bg-purple-500/10 text-purple-500" },
      other: { label: "أخرى", color: "bg-blue-500/10 text-blue-500" },
    };
    const safeConfig = typeConfig[type] ?? typeConfig.other!;
    return <Badge variant="outline" className={safeConfig.color}>{safeConfig.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { label: string; color: string }> = {
      low: { label: "منخفضة", color: "bg-gray-500/10 text-gray-500" },
      medium: { label: "متوسطة", color: "bg-blue-500/10 text-blue-500" },
      high: { label: "عالية", color: "bg-orange-500/10 text-orange-500" },
      critical: { label: "حرجة", color: "bg-red-500/10 text-red-500" },
    };
    const safeConfig = priorityConfig[priority] ?? priorityConfig.medium!;
    return <Badge variant="outline" className={safeConfig.color}>{safeConfig.label}</Badge>;
  };

  if (loading) {
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

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
              <Flag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">إجمالي البلاغات</p>
              <p className="text-2xl font-black">{reports.length}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">معلقة</p>
              <p className="text-2xl font-black">
                {reports.filter((r) => r.status === "pending" || r.status === "reviewing").length}
              </p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">تم الحل</p>
              <p className="text-2xl font-black">
                {reports.filter((r) => r.status === "resolved").length}
              </p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">حرجة</p>
              <p className="text-2xl font-black">
                {reports.filter((r) => r.priority === "critical").length}
              </p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Reports List */}
      <AdminCard variant="glass" className="p-6">
        <h3 className="text-xl font-black mb-4">البلاغات</h3>
        {reports.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">لا توجد بلاغات</p>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-start justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
                    <Flag className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-white">{report.subject}</p>
                      {getTypeBadge(report.type)}
                      {getPriorityBadge(report.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {report.description}
                    </p>
                    {report.moderatorNotes && (
                      <div className="p-2 rounded-lg bg-white/5 border border-white/10 mb-2">
                        <p className="text-xs text-muted-foreground font-bold mb-1">ملاحظات المشرف:</p>
                        <p className="text-sm text-white">{report.moderatorNotes}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>تاريخ البلاغ: {formatDate(report.createdAt)}</span>
                      {report.reportedBy && <span>• بلّغ عنه: {report.reportedBy}</span>}
                      {report.resolvedAt && <span>• تم الحل: {formatDate(report.resolvedAt)}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  {getStatusBadge(report.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}