"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Clock,
  User,
  Shield,
  Edit2,
  Trash2,
  Eye,
  Settings,
  Plus,
  LogIn,
  LogOut,
  AlertTriangle,
  ServerCrash,
  RefreshCw,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { adminFetch } from "@/lib/api/admin-api";
import { logger } from "@/lib/logger";

// ─── Types ───────────────────────────────────────────────────────────────────

type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "view"
  | "login"
  | "logout"
  | "impersonate"
  | "permission_change"
  | "status_change";

type AuditSeverity = "info" | "warning" | "critical";
type SeverityVariant = "outline" | "secondary" | "destructive";

interface AuditLog {
  id: string;
  action: AuditAction;
  entity: "user" | "payment" | "course" | "certificate" | "ticket" | "note" | "settings";
  description: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  performedBy: string;
  severity: AuditSeverity;
}

interface UserAuditLogTabProps {
  userId: string;
}

// ─── Pure helpers (lifted out to avoid re-creation on every render) ───────────

function getActionIcon(action: AuditAction) {
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
}

const SEVERITY_CONFIG: Record<AuditSeverity, { label: string; variant: SeverityVariant }> = {
  info:     { label: "معلومات", variant: "outline" },
  warning:  { label: "تحذير",   variant: "secondary" },
  critical: { label: "حرج",     variant: "destructive" },
};

function getSeverityBadge(severity: AuditSeverity) {
  const config = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.info;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

const ACTION_LABELS: Record<string, string> = {
  create:           "إنشاء",
  update:           "تعديل",
  delete:           "حذف",
  view:             "عرض",
  login:            "تسجيل دخول",
  logout:           "تسجيل خروج",
  impersonate:      "تبديل هوية",
  permission_change:"تغيير صلاحيات",
  status_change:    "تغيير حالة",
};

function getActionBadge(action: string) {
  return <Badge variant="outline">{ACTION_LABELS[action] ?? action}</Badge>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UserAuditLogTab({ userId }: UserAuditLogTabProps) {
  const [logs, setLogs] = React.useState<AuditLog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchLogs = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: replace with the actual audit-log endpoint once available,
      // e.g. /admin/users/:userId/audit-logs
      const response = await adminFetch(`/admin/users/${userId}/audit-logs`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data: AuditLog[] = await response.json();
      setLogs(data);
    } catch (err) {
      logger.error("Error fetching audit logs:", err);
      setError("تعذّر تحميل سجل التدقيق. يُرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // ── Loading skeleton ──────────────────────────────────────────────────────

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

  // ── Error state ───────────────────────────────────────────────────────────

  if (error) {
    return (
      <AdminCard variant="glass" className="p-6">
        <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
          <div className="p-4 rounded-full bg-red-500/10 text-red-500">
            <ServerCrash className="h-8 w-8" />
          </div>
          <div>
            <p className="font-bold text-red-500">{error}</p>
            <p className="text-sm text-muted-foreground mt-1">تحقق من الاتصال بالشبكة أو حاول لاحقاً.</p>
          </div>
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <RefreshCw className="h-4 w-4" />
            إعادة المحاولة
          </button>
        </div>
      </AdminCard>
    );
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  const criticalCount        = logs.filter((l) => l.severity === "critical").length;
  const permissionChangeCount = logs.filter((l) => l.action === "permission_change").length;
  const impersonateCount     = logs.filter((l) => l.action === "impersonate").length;

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
              <p className="text-2xl font-black">{criticalCount}</p>
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
              <p className="text-2xl font-black">{permissionChangeCount}</p>
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
              <p className="text-2xl font-black">{impersonateCount}</p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Audit Log Timeline */}
      <AdminCard variant="glass" className="p-6">
        <h3 className="text-xl font-black mb-4">سجل التدقيق</h3>
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="p-4 rounded-full bg-muted/30 text-muted-foreground">
              <FileText className="h-8 w-8" />
            </div>
            <p className="text-muted-foreground">لا يوجد سجل تدقيق لهذا المستخدم حتى الآن.</p>
          </div>
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