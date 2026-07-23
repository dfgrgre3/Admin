"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, User, Shield, Edit2, Trash2, Eye, Settings, Plus, LogIn, LogOut, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AuditLog {
  id: string;
  action: "create" | "update" | "delete" | "view" | "login" | "logout" | "impersonate" | "permission_change" | "status_change";
  entity: "user" | "payment" | "course" | "certificate" | "ticket" | "note" | "settings";
  description: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  performedBy: string;
  severity: "info" | "warning" | "critical";
}

interface UserAuditLogTabProps {
  userId: string;
}

export function UserAuditLogTab({ userId }: UserAuditLogTabProps) {
  const [logs] = React.useState<AuditLog[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // TODO: Fetch audit logs from API
    setLoading(false);
  }, [userId]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create":
        return <Plus className="h-4 w-4 text-green-500" />;
      case "update":
        return <Edit2 className="h-4 w-4 text-blue-500" />;
      case "delete":
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case "view":
        return <Eye className="h-4 w-4 text-gray-500" />;
      case "login":
        return <LogIn className="h-4 w-4 text-green-500" />;
      case "logout":
        return <LogOut className="h-4 w-4 text-gray-500" />;
      case "impersonate":
        return <User className="h-4 w-4 text-purple-500" />;
      case "permission_change":
        return <Shield className="h-4 w-4 text-yellow-500" />;
      case "status_change":
        return <Settings className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig: Record<string, { label: string; variant: any }> = {
      info: { label: "معلومات", variant: "outline" },
      warning: { label: "تحذير", variant: "secondary" },
      critical: { label: "حرج", variant: "destructive" },
    };
    const config = severityConfig[severity] ?? severityConfig.info!;
    return <Badge variant={config.variant}>{config.label}</Badge>;

  };

  const getActionBadge = (action: string) => {
    const actionLabels: Record<string, string> = {
      create: "إنشاء",
      update: "تعديل",
      delete: "حذف",
      view: "عرض",
      login: "تسجيل دخول",
      logout: "تسجيل خروج",
      impersonate: "تبديل هوية",
      permission_change: "تغيير صلاحيات",
      status_change: "تغيير حالة",
    };
    return <Badge variant="outline">{actionLabels[action] || action}</Badge>;
  };

  if (loading) {
    return (
      <AdminCard variant="glass" className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-white/5 rounded-xl"></div>
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
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">إجمالي السجلات</p>
              <p className="text-2xl font-black">{logs.length}</p>
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
              {logs.filter((log: AuditLog) => log.severity === "critical").length}
              </p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">تغييرات صلاحيات</p>
              <p className="text-2xl font-black">
              {logs.filter((log: AuditLog) => log.action === "permission_change").length}
              </p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">تبديل هوية</p>
              <p className="text-2xl font-black">
              {logs.filter((log: AuditLog) => log.action === "impersonate").length}
              </p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Audit Log Timeline */}
      <AdminCard variant="glass" className="p-6">
        <h3 className="text-xl font-black mb-4">سجل التدقيق</h3>
        {logs.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">لا يوجد سجل تدقيق</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all"
              >
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getActionBadge(log.action)}
                        {getSeverityBadge(log.severity)}
                      </div>
                      <p className="font-bold text-white">{log.description}</p>
                      {log.oldValue && log.newValue && (
                        <div className="flex items-center gap-2 mt-1 text-sm">
                          <span className="text-red-500 line-through">{log.oldValue}</span>
                          <span className="text-gray-500">→</span>
                          <span className="text-green-500">{log.newValue}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.performedBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(log.createdAt)}
                        </span>
                        <span>• {log.ipAddress}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}