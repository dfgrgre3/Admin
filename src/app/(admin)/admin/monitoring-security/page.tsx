"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
  MonitorSmartphone,
  Globe,
  AlertTriangle,
  RefreshCw,
  Ban,
  Unlock,
  XCircle,
  LogIn,
  Fingerprint,
  Eye,
  Smartphone,
  Laptop,
  Tablet,
  CheckCircle2,
  KeyRound,
  MoreHorizontal,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { type ColumnDef } from "@tanstack/react-table";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import {
  securityApi,
  getEventTypeLabel,
  getEventTypeColor,
  getDeviceTypeLabel,
  getSessionStatusLabel,
  getSessionStatusColor,
  formatRelativeTime,
  type SecuritySession,
  type SessionStats,
  type SecurityLogEntry,
  type DeviceFingerprint,
  type IPWhitelistEntry,
  type IPWhitelistSettings,
  type BlockedIPAttempt,
  type RolePermissionInfo,
} from "@/lib/api/security-api";
import { exportToCSV, type ExportColumn } from "@/lib/export-utils";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const SECURITY_LEVEL_STYLES = {
  secure: "border-emerald-500/30 bg-emerald-500/5",
  warning: "border-amber-500/30 bg-amber-500/5",
  danger: "border-red-500/30 bg-red-500/5",
} as const;

// ─────────────────────────────────────────────
// Sub-Components
// ─────────────────────────────────────────────

function SessionTypeIcon({ deviceType, className }: { deviceType?: string; className?: string }) {
  const dt = (deviceType || "").toLowerCase();
  if (dt.includes("mobile") || dt.includes("phone") || dt.includes("ios") || dt.includes("android")) {
    return <Smartphone className={className} />;
  }
  if (dt.includes("tablet") || dt.includes("ipad")) {
    return <Tablet className={className} />;
  }
  return <Laptop className={className} />;
}

// ─────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────

export default function AdminSecurityHubPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const { subscribe, isConnected } = useAdminRealtime();

  const canManageIPWhitelist = hasPermission(PERMISSIONS.ADMIN_BYPASS);

  // ── State ──
  const [activeTab, setActiveTab] = React.useState("overview");
  const [refreshing, setRefreshing] = React.useState(false);

  // ── Real-time subscription ──
  React.useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    const events = ["user_login", "user_logout", "user_suspended", "user_activated"] as const;
    events.forEach((type) => {
      const unsub = subscribe(type, () => {
        queryClient.invalidateQueries({ queryKey: ["admin", "security"] });
      });
      unsubscribers.push(unsub);
    });

    return () => unsubscribers.forEach((fn) => fn());
  }, [subscribe, queryClient]);

  // ── Queries ──
  const sessionsQuery = useQuery({
    queryKey: ["admin", "security", "sessions"],
    queryFn: () => securityApi.getSessions(),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const sessionStatsQuery = useQuery({
    queryKey: ["admin", "security", "session-stats"],
    queryFn: () => securityApi.getSessionStats(),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const logsQuery = useQuery({
    queryKey: ["admin", "security", "logs"],
    queryFn: () => securityApi.getSecurityLogs(100),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const devicesQuery = useQuery({
    queryKey: ["admin", "security", "devices"],
    queryFn: () => securityApi.getDeviceFingerprints(),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const whitelistQuery = useQuery({
    queryKey: ["admin", "security", "ip-whitelist"],
    queryFn: () => securityApi.getIPWhitelist(),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    enabled: canManageIPWhitelist,
  });

  const whitelistSettingsQuery = useQuery({
    queryKey: ["admin", "security", "ip-whitelist-settings"],
    queryFn: () => securityApi.getIPWhitelistSettings(),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    enabled: canManageIPWhitelist,
  });

  const blockedAttemptsQuery = useQuery({
    queryKey: ["admin", "security", "blocked-attempts"],
    queryFn: () => securityApi.getBlockedAttempts(),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    enabled: canManageIPWhitelist,
  });

  const rolesQuery = useQuery({
    queryKey: ["admin", "security", "roles"],
    queryFn: () => securityApi.getRolePermissions(),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  // ── Derived Data ──
  const sessions = sessionsQuery.data || [];
  const activeSessions = sessions.filter((s) => s.isActive && s.status === "active");
  const sessionStats = sessionStatsQuery.data || { totalActive: 0, totalExpired: 0, uniqueDevices: 0 };
  const logs = logsQuery.data || [];
  const devices = devicesQuery.data || [];
  const whitelist = whitelistQuery.data || [];
  const whitelistSettings = whitelistSettingsQuery.data;
  const blockedAttempts = blockedAttemptsQuery.data || [];
  const roles = rolesQuery.data || [];

  const recentLogs = logs.slice(0, 20);
  const failedLogs = logs.filter((l) => l.eventType.includes("FAILED"));
  const suspiciousLogs = logs.filter((l) => l.eventType === "SUSPICIOUS_ACTIVITY");
  const highRiskLogs = logs.filter((l) => l.eventType.includes("FAILED") || l.eventType.includes("SUSPICIOUS"));

  const blockedDevices = devices.filter((d) => d.isBlocked);
  const securityScore = React.useMemo(() => {
    let score = 100;
    if (failedLogs.length > 0) score -= Math.min(40, failedLogs.length * 5);
    if (suspiciousLogs.length > 0) score -= Math.min(30, suspiciousLogs.length * 10);
    if (blockedDevices.length > 0) score -= Math.min(15, blockedDevices.length * 5);
    if (blockedAttempts.length > 0) score -= Math.min(10, blockedAttempts.length * 2);
    return Math.max(0, score);
  }, [failedLogs.length, suspiciousLogs.length, blockedDevices.length, blockedAttempts.length]);

  const securityLevel = securityScore >= 80 ? "secure" : securityScore >= 50 ? "warning" : "danger";
  const securityLevelText = securityScore >= 80 ? "آمن" : securityScore >= 50 ? "يتطلب انتباهاً" : "خطير";

  // ── Actions ──
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        sessionsQuery.refetch(),
        sessionStatsQuery.refetch(),
        logsQuery.refetch(),
        devicesQuery.refetch(),
        whitelistQuery.refetch(),
        blockedAttemptsQuery.refetch(),
        rolesQuery.refetch(),
      ]);
      toast.success("تم تحديث بيانات الأمان");
    } catch {
      toast.error("فشل تحديث البيانات");
    } finally {
      setRefreshing(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await securityApi.revokeSession(sessionId);
      toast.success("تم إلغاء الجلسة بنجاح");
      sessionsQuery.refetch();
      sessionStatsQuery.refetch();
    } catch {
      toast.error("فشل إلغاء الجلسة");
    }
  };

  const handleBlockDevice = async (deviceId: string) => {
    try {
      await securityApi.blockDevice(deviceId, "Blocked by admin");
      toast.success("تم حظر الجهاز بنجاح");
      devicesQuery.refetch();
    } catch {
      toast.error("فشل حظر الجهاز");
    }
  };

  const handleUnblockDevice = async (deviceId: string) => {
    try {
      await securityApi.unblockDevice(deviceId);
      toast.success("تم إلغاء حظر الجهاز");
      devicesQuery.refetch();
    } catch {
      toast.error("فشل إلغاء حظر الجهاز");
    }
  };

  const handleExportSessions = () => {
    if (!sessions.length) { toast.error("لا توجد بيانات"); return; }
    const cols: ExportColumn<SecuritySession>[] = [
      { header: "المستخدم", accessor: (s) => s.userId },
      { header: "عنوان IP", accessor: (s) => s.ip },
      { header: "المتصفح", accessor: (s) => s.browser || "-" },
      { header: "نظام التشغيل", accessor: (s) => s.os || "-" },
      { header: "الحالة", accessor: (s) => getSessionStatusLabel(s.status) },
      { header: "آخر نشاط", accessor: (s) => s.lastAccessed ? formatRelativeTime(s.lastAccessed) : "-" },
    ];
    exportToCSV(sessions, cols, "security-sessions");
    toast.success("تم تصدير الجلسات");
  };

  const handleExportLogs = () => {
    if (!logs.length) { toast.error("لا توجد بيانات"); return; }
    const cols: ExportColumn<SecurityLogEntry>[] = [
      { header: "الحدث", accessor: (l) => getEventTypeLabel(l.eventType) },
      { header: "المستخدم", accessor: (l) => l.user?.name || l.user?.email || "-" },
      { header: "عنوان IP", accessor: (l) => l.ip },
      { header: "الموقع", accessor: (l) => l.location || "-" },
      { header: "الوقت", accessor: (l) => new Date(l.createdAt).toLocaleString("ar-EG") },
    ];
    exportToCSV(logs, cols, "security-logs");
    toast.success("تم تصدير السجلات");
  };

  // ── Table Columns ──
  const sessionColumns: ColumnDef<SecuritySession>[] = [
    {
      accessorKey: "userId",
      header: "المستخدم",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <SessionTypeIcon deviceType={row.original.deviceType} className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-black">{row.original.userId.slice(0, 8)}</p>
            <p className="text-[10px] text-muted-foreground">{row.original.ip}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "ip",
      header: "عنوان IP",
      cell: ({ row }) => <span className="font-mono text-xs font-bold">{row.original.ip}</span>,
    },
    {
      accessorKey: "os",
      header: "الجهاز",
      cell: ({ row }) => (
        <span className="text-xs font-bold">
          {row.original.os || "-"} / {row.original.browser || "-"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => {
        const label = getSessionStatusLabel(row.original.status);
        const color = getSessionStatusColor(row.original.status);
        return <Badge variant="outline" className={`font-black text-[10px] ${color}`}>{label}</Badge>;
      },
    },
    {
      accessorKey: "lastAccessed",
      header: "آخر نشاط",
      cell: ({ row }) => (
        <span className="text-xs font-bold text-muted-foreground">
          {row.original.lastAccessed ? formatRelativeTime(row.original.lastAccessed) : "-"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "إجراءات",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <AdminButton variant="ghost" size="icon-sm">
              <MoreHorizontal className="h-4 w-4" />
            </AdminButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem onClick={() => router.push(`/admin/users/${row.original.userId}`)}>
              <Eye className="h-4 w-4 ml-2" />
              عرض المستخدم
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-amber-500"
              onClick={() => handleRevokeSession(row.original.id)}
              disabled={!row.original.isActive}
            >
              <XCircle className="h-4 w-4 ml-2" />
              إلغاء الجلسة
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const devicesColumns: ColumnDef<DeviceFingerprint>[] = [
    {
      accessorKey: "userName",
      header: "المستخدم",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
            <Fingerprint className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-black">{row.original.userName}</p>
            <p className="text-[10px] text-muted-foreground">{row.original.userId.slice(0, 8)}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "deviceType",
      header: "نوع الجهاز",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <SessionTypeIcon deviceType={row.original.deviceType} className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-bold">{getDeviceTypeLabel(row.original.deviceType)}</span>
        </div>
      ),
    },
    {
      accessorKey: "ip",
      header: "عنوان IP",
      cell: ({ row }) => <span className="font-mono text-xs font-bold">{row.original.ip}</span>,
    },
    {
      accessorKey: "loginCount",
      header: "عدد الدخول",
      cell: ({ row }) => <span className="text-xs font-black">{row.original.loginCount}</span>,
    },
    {
      accessorKey: "lastSeen",
      header: "آخر ظهور",
      cell: ({ row }) => (
        <span className="text-xs font-bold text-muted-foreground">
          {row.original.lastSeen ? formatRelativeTime(row.original.lastSeen) : "-"}
        </span>
      ),
    },
    {
      accessorKey: "isBlocked",
      header: "الحالة",
      cell: ({ row }) => (
        row.original.isBlocked ? (
          <Badge variant="outline" className="font-black text-[10px] bg-red-500/10 text-red-500 border-red-500/20">
            محظور
          </Badge>
        ) : (
          <Badge variant="outline" className="font-black text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            نشط
          </Badge>
        )
      ),
    },
    {
      id: "actions",
      header: "إجراءات",
      cell: ({ row }) => (
        row.original.isBlocked ? (
          <AdminButton variant="ghost" size="sm" onClick={() => handleUnblockDevice(row.original.id)}>
            <Unlock className="h-3.5 w-3.5 ml-1" />
            إلغاء الحظر
          </AdminButton>
        ) : (
          <AdminButton variant="ghost" size="sm" className="text-red-500" onClick={() => handleBlockDevice(row.original.id)}>
            <Ban className="h-3.5 w-3.5 ml-1" />
            حظر
          </AdminButton>
        )
      ),
    },
  ];

  // ── Stats Cards ──
  const statsCards = [
    { title: "الجلسات النشطة", value: sessionStats.totalActive, icon: Activity, color: "blue" as const, description: "جلسة نشطة" },
    { title: "الأجهزة الفريدة", value: sessionStats.uniqueDevices, icon: MonitorSmartphone, color: "violet" as const, description: "جهاز مميز" },
    { title: "الأجهزة المحظورة", value: blockedDevices.length, icon: Ban, color: "red" as const, description: "جهاز محظور" },
    { title: "محاولات فاشلة", value: failedLogs.length, icon: AlertTriangle, color: "amber" as const, description: "محاولة فاشلة" },
    { title: "عناوين IP البيضاء", value: whitelist.length, icon: Globe, color: "green" as const, description: "عنوان مسموح" },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader
        title="مركز المراقبة والأمان 🛡️"
        description="لوحة تحكم شاملة لمراقبة الجلسات، الأجهزة، محاولات الدخول، القائمة البيضاء للعناوين، وسجل الأحداث الأمني."
        eyebrow="مركز الأمان"
        badge="Security Hub"
      >
        <div className="flex items-center gap-3">
          {isConnected && (
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              <span className="relative flex h-2 w-2 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              مباشر
            </Badge>
          )}
          <AdminButton variant="outline" onClick={handleRefresh} loading={refreshing}>
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث الكل
          </AdminButton>
        </div>
      </PageHeader>

      {/* Security Score Banner */}
      <div className={`relative overflow-hidden rounded-[2rem] border p-6 sm:p-8 ${SECURITY_LEVEL_STYLES[securityLevel]}`}>
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full blur-3xl opacity-20 bg-current" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`flex h-20 w-20 items-center justify-center rounded-3xl border border-border bg-card shadow-lg ${
              securityLevel === "secure" ? "text-emerald-500" : securityLevel === "warning" ? "text-amber-500" : "text-red-500"
            }`}>
              {securityLevel === "secure" ? (
                <ShieldCheck className="h-10 w-10" />
              ) : securityLevel === "warning" ? (
                <ShieldAlert className="h-10 w-10" />
              ) : (
                <Shield className="h-10 w-10" />
              )}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">مؤشر الأمان</p>
              <h2 className="text-4xl font-black tracking-tight mt-1">{securityScore}%</h2>
              <p className="text-sm font-bold text-muted-foreground mt-1">
                مستوى الأمان: <span className={
                  securityLevel === "secure" ? "text-emerald-500" : securityLevel === "warning" ? "text-amber-500" : "text-red-500"
                }>{securityLevelText}</span>
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-border bg-card/80 px-4 py-3 text-center">
              <p className="text-2xl font-black text-emerald-500">{activeSessions.length}</p>
              <p className="text-[10px] font-bold text-muted-foreground mt-0.5">جلسة نشطة</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/80 px-4 py-3 text-center">
              <p className="text-2xl font-black text-amber-500">{failedLogs.length}</p>
              <p className="text-[10px] font-bold text-muted-foreground mt-0.5">محاولات فاشلة</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/80 px-4 py-3 text-center">
              <p className="text-2xl font-black text-red-500">{blockedDevices.length}</p>
              <p className="text-[10px] font-bold text-muted-foreground mt-0.5">جهاز محظور</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/80 px-4 py-3 text-center">
              <p className="text-2xl font-black text-violet-500">{blockedAttempts.length}</p>
              <p className="text-[10px] font-bold text-muted-foreground mt-0.5">محاولة محظورة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statsCards.map((card) => (
          <AdminStatsCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            description={card.description}
          />
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:grid-cols-5 h-auto p-1.5 gap-1 bg-muted/50 rounded-2xl">
          <TabsTrigger value="overview" className="rounded-xl py-2.5 text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="sessions" className="rounded-xl py-2.5 text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            الجلسات ({sessions.length})
          </TabsTrigger>
          <TabsTrigger value="devices" className="rounded-xl py-2.5 text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            الأجهزة ({devices.length})
          </TabsTrigger>
          <TabsTrigger value="whitelist" className="rounded-xl py-2.5 text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            القائمة البيضاء ({whitelist.length})
          </TabsTrigger>
          <TabsTrigger value="logs" className="rounded-xl py-2.5 text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            السجلات ({logs.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ── */}
        <TabsContent value="overview" className="space-y-8 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Security Logs */}
            <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-lg">أحدث الأحداث الأمنية</h3>
                  <p className="text-sm text-muted-foreground">آخر 20 حدثاً أمنياً</p>
                </div>
                <AdminButton variant="ghost" size="sm" onClick={handleExportLogs}>
                  <Download className="h-3.5 w-3.5 ml-1" />
                  تصدير
                </AdminButton>
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pe-1">
                {recentLogs.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <ShieldCheck className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p className="font-bold">لا توجد أحداث أمنية</p>
                  </div>
                )}
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/30 p-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${getEventTypeColor(log.eventType)}`}>
                      {log.eventType.includes("FAILED") || log.eventType.includes("SUSPICIOUS") ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : log.eventType.includes("LOGIN") ? (
                        <LogIn className="h-4 w-4" />
                      ) : log.eventType.includes("2FA") ? (
                        <KeyRound className="h-4 w-4" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-black truncate">{getEventTypeLabel(log.eventType)}</p>
                        <span className="text-[10px] font-bold text-muted-foreground shrink-0">{formatRelativeTime(log.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-muted-foreground">
                        <span className="font-mono">{log.ip}</span>
                        {log.user?.name && <span>• {log.user.name}</span>}
                        {log.location && <span>• {log.location}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Security Alerts */}
              <div className="rounded-3xl border border-border bg-card p-6">
                <h3 className="font-black text-lg mb-4">تنبيهات أمنية</h3>
                <div className="space-y-3">
                  {highRiskLogs.length > 0 && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-3">
                      <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                      <div>
                        <p className="text-xs font-black text-red-500">محاولات فاشلة متكررة</p>
                        <p className="text-[10px] font-bold text-muted-foreground mt-0.5">
                          {highRiskLogs.length} محاولة فاشلة خلال آخر 100 حدث
                        </p>
                      </div>
                    </div>
                  )}
                  {blockedAttempts.length > 0 && (
                    <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3">
                      <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
                      <div>
                        <p className="text-xs font-black text-amber-500">عناوين محظورة</p>
                        <p className="text-[10px] font-bold text-muted-foreground mt-0.5">
                          {blockedAttempts.length} عنوان محظور
                        </p>
                      </div>
                    </div>
                  )}
                  {blockedDevices.length > 0 && (
                    <div className="flex items-start gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-3">
                      <Ban className="h-5 w-5 text-violet-500 shrink-0" />
                      <div>
                        <p className="text-xs font-black text-violet-500">أجهزة محظورة</p>
                        <p className="text-[10px] font-bold text-muted-foreground mt-0.5">
                          {blockedDevices.length} جهاز محظور
                        </p>
                      </div>
                    </div>
                  )}
                  {highRiskLogs.length === 0 && blockedAttempts.length === 0 && blockedDevices.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShieldCheck className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p className="font-bold text-sm">لا توجد تنبيهات أمنية</p>
                      <p className="text-xs mt-1">النظام في حالة آمنة</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Roles Overview */}
              <div className="rounded-3xl border border-border bg-card p-6">
                <h3 className="font-black text-lg mb-4">الأدوار والصلاحيات</h3>
                <div className="space-y-3">
                  {roles.map((role) => (
                    <div key={role.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="text-xs font-black">{role.name}</span>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground">{role.userCount || 0} مستخدم</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Sessions Tab ── */}
        <TabsContent value="sessions" className="space-y-6 pt-6">
          <div className="rounded-[2.5rem] border border-border bg-card p-1 overflow-hidden shadow-xl">
            <AdminDataTable
              columns={sessionColumns}
              data={sessions}
              loading={sessionsQuery.isLoading}
              searchKey="ip"
              searchPlaceholder="بحث بالعنوان أو المستخدم..."
              actions={{ onRefresh: () => sessionsQuery.refetch(), onExport: handleExportSessions }}
              emptyMessage={{ title: "لا توجد جلسات", description: "لم يتم العثور على أي جلسات." }}
              virtualized
            />
          </div>
        </TabsContent>

        {/* ── Devices Tab ── */}
        <TabsContent value="devices" className="space-y-6 pt-6">
          <div className="rounded-[2.5rem] border border-border bg-card p-1 overflow-hidden shadow-xl">
            <AdminDataTable
              columns={devicesColumns}
              data={devices}
              loading={devicesQuery.isLoading}
              searchKey="userName"
              searchPlaceholder="بحث بالاسم أو الجهاز..."
              actions={{ onRefresh: () => devicesQuery.refetch() }}
              emptyMessage={{ title: "لا توجد أجهزة", description: "لم يتم العثور على أي أجهزة." }}
              virtualized
            />
          </div>
        </TabsContent>

        {/* ── Whitelist Tab ── */}
        <TabsContent value="whitelist" className="space-y-6 pt-6">
          <WhitelistSection
            entries={whitelist}
            settings={whitelistSettings}
            blockedAttempts={blockedAttempts}
            isLoading={whitelistQuery.isLoading}
            onRefresh={() => whitelistQuery.refetch()}
            onAdd={async (entry) => {
              try {
                await securityApi.addIPToWhitelist(entry);
                toast.success("تمت إضافة العنوان للقائمة البيضاء");
                whitelistQuery.refetch();
              } catch {
                toast.error("فشل إضافة العنوان");
              }
            }}
            onRemove={async (id) => {
              try {
                await securityApi.removeIPFromWhitelist(id);
                toast.success("تم حذف العنوان من القائمة البيضاء");
                whitelistQuery.refetch();
              } catch {
                toast.error("فشل حذف العنوان");
              }
            }}
            onToggleStatus={async (id, status) => {
              try {
                await securityApi.updateIPWhitelistEntry(id, { status });
                toast.success("تم تحديث حالة العنوان");
                whitelistQuery.refetch();
              } catch {
                toast.error("فشل تحديث الحالة");
              }
            }}
            onUpdateSettings={async (settings) => {
              try {
                await securityApi.updateIPWhitelistSettings(settings);
                toast.success("تم حفظ إعدادات القائمة البيضاء");
                whitelistSettingsQuery.refetch();
              } catch {
                toast.error("فشل حفظ الإعدادات");
              }
            }}
          />
        </TabsContent>

        {/* ── Logs Tab ── */}
        <TabsContent value="logs" className="space-y-6 pt-6">
          <LogsSection
            logs={logs}
            isLoading={logsQuery.isLoading}
            onRefresh={() => logsQuery.refetch()}
            onExport={handleExportLogs}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─────────────────────────────────────────────
// Whitelist Section
// ─────────────────────────────────────────────

interface WhitelistSectionProps {
  entries: IPWhitelistEntry[];
  settings?: IPWhitelistSettings;
  blockedAttempts: BlockedIPAttempt[];
  isLoading: boolean;
  onRefresh: () => void;
  onAdd: (entry: { ipAddress: string; description?: string; type: "admin" | "api" | "webhook"; expiresAt?: string }) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onToggleStatus: (id: string, status: string) => Promise<void>;
  onUpdateSettings: (settings: Partial<IPWhitelistSettings>) => Promise<void>;
}

function WhitelistSection({
  entries,
  settings,
  blockedAttempts,
  isLoading,
  onRefresh,
  onAdd,
  onRemove,
  onToggleStatus,
  onUpdateSettings,
}: WhitelistSectionProps) {
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [newIP, setNewIP] = React.useState("");
  const [newDescription, setNewDescription] = React.useState("");
  const [newType, setNewType] = React.useState<"admin" | "api" | "webhook">("admin");
  const [isSaving, setIsSaving] = React.useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = React.useState<string | null>(null);
  const [isRemoving, setIsRemoving] = React.useState(false);

  const handleAdd = async () => {
    if (!newIP.trim()) { toast.error("أدخل عنوان IP"); return; }
    setIsSaving(true);
    try {
      await onAdd({ ipAddress: newIP.trim(), description: newDescription.trim() || undefined, type: newType });
      setNewIP("");
      setNewDescription("");
      setIsAddOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const typeLabel = { admin: "مدير", api: "واجهة برمجية", webhook: "ويب هوك" } as const;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* IP List */}
      <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-lg">القائمة البيضاء للعناوين</h3>
            <p className="text-sm text-muted-foreground">{entries.length} عنوان مسموح</p>
          </div>
          <div className="flex items-center gap-2">
            <AdminButton variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-3.5 w-3.5 ml-1" />
              تحديث
            </AdminButton>
            <AdminButton size="sm" onClick={() => setIsAddOpen(true)}>
              <Globe className="h-3.5 w-3.5 ml-1" />
              إضافة عنوان
            </AdminButton>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted/40" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p className="font-bold">لا توجد عناوين في القائمة البيضاء</p>
            <p className="text-sm mt-1">أضف عنوان IP للسماح بالوصول</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/30 p-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                    entry.status === "active"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                  }`}>
                    <Globe className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black">{entry.ipAddress}</span>
                      {entry.cidr && <span className="font-mono text-[10px] text-muted-foreground">/ {entry.cidr}</span>}
                      {entry.isTemporary && entry.expiresAt && (
                        <Badge variant="outline" className="text-[9px] font-bold text-amber-500 border-amber-500/20">
                          ينتهي {formatRelativeTime(entry.expiresAt)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-muted-foreground">
                      <span>{typeLabel[entry.type]}</span>
                      {entry.description && <span>• {entry.description}</span>}
                      {entry.country && <span>• {entry.country}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className={`font-black text-[10px] ${
                    entry.status === "active"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                  }`}>
                    {entry.status === "active" ? "نشط" : "معطل"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <AdminButton variant="ghost" size="icon-sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </AdminButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onClick={() => onToggleStatus(entry.id, entry.status === "active" ? "disabled" : "active")}>
                        {entry.status === "active" ? <Ban className="h-4 w-4 ml-2" /> : <Unlock className="h-4 w-4 ml-2" />}
                        {entry.status === "active" ? "تعطيل" : "تفعيل"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() => setConfirmRemoveId(entry.id)}
                      >
                        <XCircle className="h-4 w-4 ml-2" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Confirm Remove Dialog */}
        <AdminConfirm
          open={!!confirmRemoveId}
          onOpenChange={(open) => { if (!open) setConfirmRemoveId(null); }}
          title="حذف العنوان"
          description={`هل أنت متأكد من حذف ${confirmRemoveId ? entries.find((e) => e.id === confirmRemoveId)?.ipAddress || "" : ""} من القائمة البيضاء؟`}
          confirmText="حذف"
          cancelText="إلغاء"
          variant="destructive"
          loading={isRemoving}
          onConfirm={async () => {
            if (!confirmRemoveId) return;
            setIsRemoving(true);
            try {
              await onRemove(confirmRemoveId);
              setConfirmRemoveId(null);
            } finally {
              setIsRemoving(false);
            }
          }}
        />

        {/* Add Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">إضافة عنوان إلى القائمة البيضاء</DialogTitle>
              <DialogDescription>أدخل عنوان IP للسماح بالوصول إلى لوحة التحكم.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold">عنوان IP</Label>
                <Input
                  value={newIP}
                  onChange={(e) => setNewIP(e.target.value)}
                  placeholder="192.168.1.1"
                  dir="ltr"
                  className="font-mono text-left"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">النوع</Label>
                <Select value={newType} onValueChange={(v) => setNewType(v as "admin" | "api" | "webhook")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">مدير</SelectItem>
                    <SelectItem value="api">واجهة برمجية</SelectItem>
                    <SelectItem value="webhook">ويب هوك</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">الوصف (اختياري)</Label>
                <Input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="مكتب الشركة"
                />
              </div>
            </div>
            <DialogFooter>
              <AdminButton variant="outline" onClick={() => setIsAddOpen(false)}>إلغاء</AdminButton>
              <AdminButton onClick={handleAdd} loading={isSaving}>
                <Globe className="h-4 w-4 ml-2" />
                إضافة
              </AdminButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Right Column: Settings + Blocked */}
      <div className="space-y-6">
        {settings && (
          <WhitelistSettingsCard settings={settings} onSave={onUpdateSettings} />
        )}

        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-lg">محاولات محظورة</h3>
              <p className="text-sm text-muted-foreground">آخر محاولات الوصول المرفوضة</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          {blockedAttempts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShieldCheck className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="font-bold text-sm">لا توجد محاولات محظورة</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pe-1">
              {blockedAttempts.slice(0, 10).map((attempt) => (
                <div key={attempt.id} className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black">{attempt.ipAddress}</span>
                    <span className="text-[9px] font-bold text-muted-foreground">{formatRelativeTime(attempt.attemptedAt)}</span>
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground mt-1">{attempt.reason}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[9px] font-bold bg-red-500/10 text-red-500 border-red-500/20">{attempt.count}×</Badge>
                    <span className="text-[9px] font-bold text-muted-foreground font-mono">{attempt.method}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Whitelist Settings Card
// ─────────────────────────────────────────────

interface WhitelistSettingsCardProps {
  settings: IPWhitelistSettings;
  onSave: (settings: Partial<IPWhitelistSettings>) => Promise<void>;
}

function WhitelistSettingsCard({ settings, onSave }: WhitelistSettingsCardProps) {
  const [isEnabled, setIsEnabled] = React.useState(settings.isEnabled);
  const [enforceForAdmins, setEnforceForAdmins] = React.useState(settings.enforceForAdmins);
  const [enforceForAPI, setEnforceForAPI] = React.useState(settings.enforceForAPI);
  const [defaultAction, setDefaultAction] = React.useState<"allow" | "deny">(settings.defaultAction);
  const [allowInternalIPs, setAllowInternalIPs] = React.useState(settings.allowInternalIPs);
  const [logBlockedAttempts, setLogBlockedAttempts] = React.useState(settings.logBlockedAttempts);
  const [notifyOnViolation, setNotifyOnViolation] = React.useState(settings.notifyOnViolation);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setIsEnabled(settings.isEnabled);
    setEnforceForAdmins(settings.enforceForAdmins);
    setEnforceForAPI(settings.enforceForAPI);
    setDefaultAction(settings.defaultAction);
    setAllowInternalIPs(settings.allowInternalIPs);
    setLogBlockedAttempts(settings.logBlockedAttempts);
    setNotifyOnViolation(settings.notifyOnViolation);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        isEnabled,
        enforceForAdmins,
        enforceForAPI,
        defaultAction,
        allowInternalIPs,
        logBlockedAttempts,
        notifyOnViolation,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <h3 className="font-black text-lg mb-4">إعدادات القائمة البيضاء</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black">تفعيل القائمة البيضاء</p>
            <p className="text-[10px] font-bold text-muted-foreground">حظر الوصول من العناوين غير المسموحة</p>
          </div>
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`relative h-6 w-11 rounded-full transition-colors ${isEnabled ? "bg-emerald-500" : "bg-muted"}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${isEnabled ? "right-0.5" : "right-[22px]"}`} />
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-black">الإجراء الافتراضي</p>
          <Select value={defaultAction} onValueChange={(v) => setDefaultAction(v as "allow" | "deny")}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="allow">السماح</SelectItem>
              <SelectItem value="deny">الحظر</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {[
            { label: "تطبيق على المدراء", desc: "تقيد وصول المدراء أيضاً", checked: enforceForAdmins, set: setEnforceForAdmins },
            { label: "تطبيق على API", desc: "تقيد وصول الواجهة البرمجية", checked: enforceForAPI, set: setEnforceForAPI },
            { label: "السماح بالعناوين الداخلية", desc: "تجاهل العناوين الداخلية (RFC 1918)", checked: allowInternalIPs, set: setAllowInternalIPs },
            { label: "تسجيل المحاولات المحظورة", desc: "حفظ محاولات الوصول المرفوضة", checked: logBlockedAttempts, set: setLogBlockedAttempts },
            { label: "إشعار عند المخالفة", desc: "إرسال تنبيه عند محاولة غير مصرح بها", checked: notifyOnViolation, set: setNotifyOnViolation },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black">{item.label}</p>
                <p className="text-[9px] font-bold text-muted-foreground">{item.desc}</p>
              </div>
              <button
                onClick={() => item.set(!item.checked)}
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${item.checked ? "bg-emerald-500" : "bg-muted"}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${item.checked ? "right-0.5" : "right-[18px]"}`} />
              </button>
            </div>
          ))}
        </div>

        <AdminButton className="w-full" onClick={handleSave} loading={saving}>
          <CheckCircle2 className="h-4 w-4 ml-2" />
          حفظ الإعدادات
        </AdminButton>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Logs Section
// ─────────────────────────────────────────────

interface LogsSectionProps {
  logs: SecurityLogEntry[];
  isLoading: boolean;
  onRefresh: () => void;
  onExport: () => void;
}

function LogsSection({ logs, isLoading, onRefresh, onExport }: LogsSectionProps) {
  const [filter, setFilter] = React.useState<"all" | "success" | "failed" | "suspicious">("all");

  const filteredLogs = React.useMemo(() => {
    if (filter === "success") return logs.filter((l) => l.eventType.includes("SUCCESS") || l.eventType.includes("VERIFIED"));
    if (filter === "failed") return logs.filter((l) => l.eventType.includes("FAILED"));
    if (filter === "suspicious") return logs.filter((l) => l.eventType === "SUSPICIOUS_ACTIVITY");
    return logs;
  }, [logs, filter]);

  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-black text-lg">سجل الأحداث الأمنية</h3>
          <p className="text-sm text-muted-foreground">آخر {filteredLogs.length} حدث من أصل {logs.length}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl bg-muted/50 p-1">
            {([
              { value: "all", label: "الكل" },
              { value: "success", label: "ناجحة" },
              { value: "failed", label: "فاشلة" },
              { value: "suspicious", label: "مشبوهة" },
            ] as const).map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`rounded-lg px-3 py-1.5 text-[10px] font-black transition-colors ${
                  filter === tab.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <AdminButton variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-3.5 w-3.5 ml-1" />
          </AdminButton>
          <AdminButton variant="outline" size="sm" onClick={onExport}>
            <Download className="h-3.5 w-3.5 ml-1" />
            تصدير
          </AdminButton>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl bg-muted/40" />
          ))}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ShieldCheck className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p className="font-bold">لا توجد سجلات مطابقة</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto pe-1">
          {filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/30 p-3 hover:bg-muted/50 transition-colors">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${getEventTypeColor(log.eventType)}`}>
                {log.eventType.includes("FAILED") || log.eventType.includes("SUSPICIOUS") ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : log.eventType.includes("LOGIN") ? (
                  <LogIn className="h-4 w-4" />
                ) : log.eventType.includes("2FA") ? (
                  <KeyRound className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black">{getEventTypeLabel(log.eventType)}</span>
                    <Badge variant="outline" className={`text-[9px] font-bold ${getEventTypeColor(log.eventType)}`}>
                      {log.eventType}
                    </Badge>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground shrink-0">
                    {format(new Date(log.createdAt), "dd MMM yyyy - HH:mm", { locale: ar })}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] font-bold text-muted-foreground flex-wrap">
                  <span className="font-mono bg-muted/50 rounded-md px-2 py-0.5">{log.ip}</span>
                  {log.user && <span>• {log.user.name || log.user.email || "مستخدم"}</span>}
                  {log.location && <span>• {log.location}</span>}
                  {log.userAgent && <span className="truncate max-w-[200px]">• {log.userAgent}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}