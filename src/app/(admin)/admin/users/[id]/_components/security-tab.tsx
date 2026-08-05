"use client";

import * as React from "react";
import type { UserDetails } from "./types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Search,
  Clock,
  Eye,
  FileText,
  RefreshCw,
  UserX,
  UserCheck,
  Ban,
  Lock,
  Unlock,
  Loader2,
  Monitor,
  Smartphone,
  Laptop,
  LogOut,
  KeyRound,
  MailCheck,
  MessageSquareCheck,
  Send,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { adminUsersApi } from "@/lib/api/admin-users-api";
import { adminFetch } from "@/lib/api/admin-api";
import { UserStatus } from "@/types/enums";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import { useAdmin2FAManagement } from "@/hooks/use-2fa";
import { useSessionManagement } from "@/hooks/use-session-management";

interface SecurityLog {
  id: string;
  action: string;
  actorName?: string;
  targetName?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: string;
}

interface SecurityTabProps {
  user: UserDetails;
  onUserChange: (user: UserDetails) => void;
  actionBlockReason?: string | null;
}

  const actionIcons: Record<string, React.ElementType> = {
    LOGIN: Activity,
    LOGOUT: AlertTriangle,
    PASSWORD_CHANGE: Lock,
    ROLE_CHANGE: Shield,
    STATUS_CHANGE: Ban,
    SUSPEND: UserX,
    UNSUSPEND: UserCheck,
    BAN: Ban,
    UNBAN: Unlock,
    DELETE: UserX,
    PROFILE_UPDATE: Eye,
    PERMISSION_CHANGE: ShieldCheck,
    IMPERSONATE: Eye,
  };

  const actionColors: Record<string, string> = {
    LOGIN: "text-blue-500 bg-blue-500/10",
    LOGOUT: "text-orange-500 bg-orange-500/10",
    PASSWORD_CHANGE: "text-purple-500 bg-purple-500/10",
    ROLE_CHANGE: "text-yellow-500 bg-yellow-500/10",
    STATUS_CHANGE: "text-red-500 bg-red-500/10",
    SUSPEND: "text-red-500 bg-red-500/10",
    UNSUSPEND: "text-green-500 bg-green-500/10",
    BAN: "text-red-600 bg-red-600/10",
    UNBAN: "text-green-600 bg-green-600/10",
    DELETE: "text-red-500 bg-red-500/10",
    PROFILE_UPDATE: "text-blue-500 bg-blue-500/10",
    PERMISSION_CHANGE: "text-amber-500 bg-amber-500/10",
    IMPERSONATE: "text-cyan-500 bg-cyan-500/10",
  };

  const actionLabels: Record<string, string> = {
    LOGIN: "تسجيل دخول",
    LOGOUT: "تسجيل خروج",
    PASSWORD_CHANGE: "تغيير كلمة المرور",
    ROLE_CHANGE: "تغيير الدور",
    STATUS_CHANGE: "تغيير الحالة",
    SUSPEND: "إيقاف الحساب",
    UNSUSPEND: "إلغاء الإيقاف",
    BAN: "حظر المستخدم",
    UNBAN: "إلغاء الحظر",
    DELETE: "حذف المستخدم",
    PROFILE_UPDATE: "تحديث الملف الشخصي",
    PERMISSION_CHANGE: "تغيير الصلاحيات",
    IMPERSONATE: "دخول بهوية المستخدم",
  };

type SecurityLogApiItem = Partial<SecurityLog> & {
  eventType?: unknown;
  ip?: unknown;
  metadata?: unknown;
  user?: {
    name?: unknown;
    email?: unknown;
  } | null;
};

const toOptionalString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value : undefined;

const normalizeSecurityLog = (rawLog: SecurityLogApiItem | null | undefined, index: number): SecurityLog => {
  const log = rawLog || {};
  const action = toOptionalString(log.action) || toOptionalString(log.eventType) || "UNKNOWN";
  const actorName =
    toOptionalString(log.actorName) ||
    toOptionalString(log.user?.name) ||
    toOptionalString(log.user?.email);

  return {
    id: toOptionalString(log.id) || `${action}-${log.createdAt || index}`,
    action,
    actorName,
    targetName: toOptionalString(log.targetName),
    details: toOptionalString(log.details) || toOptionalString(log.metadata),
    ipAddress: toOptionalString(log.ipAddress) || toOptionalString(log.ip),
    userAgent: toOptionalString(log.userAgent),
    createdAt: toOptionalString(log.createdAt),
  };
};
export function SecurityTab({ user, onUserChange, actionBlockReason }: SecurityTabProps) {
  const [logs, setLogs] = React.useState<SecurityLog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [logsError, setLogsError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [suspendDialogOpen, setSuspendDialogOpen] = React.useState(false);
  const [banDialogOpen, setBanDialogOpen] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [statusReason, setStatusReason] = React.useState("");
  const [statusExpiresAt, setStatusExpiresAt] = React.useState("");
  const [revokeAllOpen, setRevokeAllOpen] = React.useState(false);
  const [reset2FAOpen, setReset2FAOpen] = React.useState(false);
  const [verificationLoading, setVerificationLoading] = React.useState<string | null>(null);
  const sessionManager = useSessionManagement();
  const twoFactorManager = useAdmin2FAManagement();
  const userSessions = sessionManager.sessions.filter((session) => session.userId === user.id);

  const handleVerificationAction = async (action: "verify-email" | "verify-phone" | "send-activation-link") => {
    if (actionBlockReason) return toast.error(actionBlockReason);
    setVerificationLoading(action);
    try {
      switch (action) {
        case "verify-email": {
          const updated = await adminUsersApi.verifyEmail(user.id);
          onUserChange({ ...user, ...updated, emailVerified: true });
          toast.success("تم توثيق البريد الإلكتروني للمستخدم");
          break;
        }
        case "verify-phone": {
          const updated = await adminUsersApi.verifyPhone(user.id);
          onUserChange({ ...user, ...updated, phoneVerified: true });
          toast.success("تم توثيق رقم الهاتف للمستخدم");
          break;
        }
        case "send-activation-link": {
          await adminUsersApi.sendActivationLink(user.id);
          toast.success("تم إرسال رابط التفعيل إلى بريد المستخدم");
          break;
        }
      }
      fetchSecurityLogs();
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : "فشل تنفيذ الإجراء");
    } finally {
      setVerificationLoading(null);
    }
  };

  const handleRevokeAllSessions = () => {
    if (actionBlockReason) return toast.error(actionBlockReason);
    sessionManager.revokeUserSessions(user.id, {
      onSuccess: () => {
        setRevokeAllOpen(false);
        fetchSecurityLogs();
      },
    });
  };

  const handleEnforce2FA = () => {
    if (actionBlockReason) return toast.error(actionBlockReason);
    twoFactorManager.enforce2FA({ userId: user.id, enforce: true }, {
      onSuccess: () => {
        onUserChange({ ...user, twoFactorEnforced: true });
        fetchSecurityLogs();
      },
    });
  };

  const handleReset2FA = () => {
    if (actionBlockReason) return toast.error(actionBlockReason);
    twoFactorManager.resetUser2FA(user.id, {
      onSuccess: () => {
        setReset2FAOpen(false);
        onUserChange({ ...user, twoFactorEnabled: false, twoFactorEnforced: false });
        fetchSecurityLogs();
      },
    });
  };

  const fetchSecurityLogs = React.useCallback(async () => {
    setLogsError(null);
    try {
      const response = await adminFetch(`/admin/security/logs/users/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch audit logs");
      const data = await response.json();
      const rawLogs = data.data?.logs || data.logs || data || [];
      setLogs(Array.isArray(rawLogs) ? rawLogs.map(normalizeSecurityLog) : []);
    } catch (error) {
      console.error("Failed to fetch security logs:", error);
      setLogsError("تعذر تحميل سجل التدقيق. تحقق من الصلاحيات أو أعد المحاولة.");
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  React.useEffect(() => {
    fetchSecurityLogs();
  }, [fetchSecurityLogs]);

  const handleStatusAction = async (action: "suspend" | "unsuspend" | "ban" | "unban") => {
    if (actionBlockReason) {
      toast.error(actionBlockReason);
      return;
    }
    if ((action === "suspend" || action === "ban") && statusReason.trim().length < 5) {
      toast.error("سبب الإيقاف أو الحظر إلزامي ويجب أن يكون واضحًا");
      return;
    }
    setActionLoading(true);
    try {
      const statusMap: Record<typeof action, UserStatus> = {
        suspend: UserStatus.SUSPENDED,
        unsuspend: UserStatus.ACTIVE,
        ban: UserStatus.BANNED,
        unban: UserStatus.ACTIVE,
      };
      const updatedUser = await adminUsersApi.updateStatus(user.id, statusMap[action], {
        reason: action === "suspend" || action === "ban" ? statusReason.trim() : undefined,
        expiresAt: statusExpiresAt ? new Date(statusExpiresAt).toISOString() : null,
      });
      onUserChange({ ...user, ...updatedUser, status: statusMap[action], statusReason: statusReason.trim() || null, statusExpiresAt: statusExpiresAt || null });
      setStatusReason("");
      setStatusExpiresAt("");
      const actionMessages: Record<string, string> = {
        suspend: "تم إيقاف حساب المستخدم بنجاح",
        unsuspend: "تم إلغاء إيقاف حساب المستخدم بنجاح",
        ban: "تم حظر المستخدم بنجاح",
        unban: "تم إلغاء حظر المستخدم بنجاح",
      };
      toast.success(actionMessages[action]);
      fetchSecurityLogs();
      setSuspendDialogOpen(false);
      setBanDialogOpen(false);
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setActionLoading(false);
    }
  };

  const normalizedSearchQuery = searchQuery.toLowerCase();
  const filteredLogs = logs.filter((log) =>
    log.action.toLowerCase().includes(normalizedSearchQuery) ||
    log.details?.toLowerCase().includes(normalizedSearchQuery) ||
    log.actorName?.toLowerCase().includes(normalizedSearchQuery)
  );

  const isSuspended = user.status === "SUSPENDED";
  const isBanned = user.status === "BANNED";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* User Status Management */}
      <Card className="border-none shadow-lg overflow-hidden">
        <div className={`h-1.5 ${isBanned ? 'bg-danger' : isSuspended ? 'bg-warning' : 'bg-success'}`} />
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            إدارة حالة المستخدم
          </CardTitle>
          <CardDescription>
            التحكم بحالة حساب المستخدم في المنصة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {!isSuspended && !isBanned && (
              <>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-1 rounded-2xl border-warning/20 hover:bg-warning/10 hover:border-warning/30"
                  onClick={() => setSuspendDialogOpen(true)}
                  disabled={actionLoading || !!actionBlockReason}
                  title={actionBlockReason || undefined}
                >
                  <UserX className="h-5 w-5 text-warning" />
                  <span className="text-xs font-bold">إيقاف الحساب</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-1 rounded-2xl border-danger/20 hover:bg-danger/10 hover:border-danger/30"
                  onClick={() => setBanDialogOpen(true)}
                  disabled={actionLoading || !!actionBlockReason}
                  title={actionBlockReason || undefined}
                >
                  <Ban className="h-5 w-5 text-danger" />
                  <span className="text-xs font-bold">حظر المستخدم</span>
                </Button>
              </>
            )}
            {isSuspended && (
              <Button
                variant="outline"
                className="h-20 flex-col gap-1 rounded-2xl border-success/20 hover:bg-success/10 hover:border-success/30 col-span-full md:col-span-2 lg:col-span-4"
                onClick={() => handleStatusAction("unsuspend")}
                disabled={actionLoading || !!actionBlockReason}
                title={actionBlockReason || undefined}
              >
                {actionLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <UserCheck className="h-5 w-5 text-success" />
                )}
                <span className="text-xs font-bold">إلغاء إيقاف الحساب</span>
              </Button>
            )}
            {isBanned && (
              <Button
                variant="outline"
                className="h-20 flex-col gap-1 rounded-2xl border-success/20 hover:bg-success/10 hover:border-success/30 col-span-full md:col-span-2 lg:col-span-4"
                onClick={() => handleStatusAction("unban")}
                disabled={actionLoading || !!actionBlockReason}
                title={actionBlockReason || undefined}
              >
                {actionLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Unlock className="h-5 w-5 text-success" />
                )}
                <span className="text-xs font-bold">إلغاء حظر المستخدم</span>
              </Button>
            )}
          </div>

          {(isSuspended || isBanned) && (
            <div className={`mt-4 p-4 rounded-2xl ${isBanned ? 'bg-danger/5 border border-danger/20' : 'bg-warning/5 border border-warning/20'}`}>
              <div className="flex items-center gap-3">
                <AlertTriangle className={`h-5 w-5 ${isBanned ? 'text-danger' : 'text-warning'}`} />
                <div>
                  <p className="text-sm font-bold">
                    {isBanned ? "هذا المستخدم محظور" : "هذا الحساب موقوف حالياً"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isBanned
                      ? "المستخدم المحظور لا يمكنه تسجيل الدخول إلى المنصة."
                      : "الحساب الموقوف لا يمكنه استخدام المنصة حتى يتم إلغاء الإيقاف."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sessions */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                الجلسات والأجهزة
              </CardTitle>
              <CardDescription>الأجهزة التي استخدمت حساب هذا المستخدم وحالة كل جلسة</CardDescription>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-xl"
              disabled={!userSessions.length || sessionManager.isRevokingUser || !!actionBlockReason}
              title={actionBlockReason || undefined}
              onClick={() => setRevokeAllOpen(true)}
            >
              <LogOut className="h-4 w-4 ml-2" />
              إنهاء كل الجلسات
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!isSuspended && !isBanned && <div className="mb-5 grid gap-3 md:grid-cols-2">
            <Input value={statusReason} onChange={(e) => setStatusReason(e.target.value)} placeholder="سبب الإيقاف أو الحظر (إلزامي)" />
            <Input type="datetime-local" value={statusExpiresAt} onChange={(e) => setStatusExpiresAt(e.target.value)} aria-label="تاريخ انتهاء الإجراء" />
          </div>}
          {sessionManager.isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
          ) : userSessions.length ? (
            <div className="space-y-3">
              {userSessions.map((session) => {
                const DeviceIcon = session.deviceType === "mobile" ? Smartphone : session.deviceType === "desktop" ? Laptop : Monitor;
                return (
                  <div key={session.id} className="flex items-center gap-4 rounded-2xl border bg-muted/20 p-4 hover:border-primary/20 transition-colors">
                    <div className="rounded-xl bg-primary/10 p-2 text-primary"><DeviceIcon className="h-5 w-5" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-sm">{session.deviceName || `${session.browser} - ${session.os}`}</p>
                        <Badge variant="outline" className="text-[10px]">{session.status}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground" dir="ltr">
                        {session.ipAddress} · {session.location || "موقع غير معروف"}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        آخر نشاط: {isValid(new Date(session.lastActiveAt)) ? format(new Date(session.lastActiveAt), "d MMM yyyy HH:mm", { locale: ar }) : "-"}
                      </p>
                    </div>
                    {session.status === "active" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={sessionManager.isRevoking || !!actionBlockReason}
                        title={actionBlockReason || undefined}
                        onClick={() => sessionManager.revokeSession(session.id)}
                        className="hover:bg-danger/10 hover:text-danger"
                      >
                        <LogOut className="h-4 w-4 ml-1" />
                        إنهاء
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">لا توجد جلسات مسجلة لهذا المستخدم</p>
          )}
        </CardContent>
      </Card>

      {/* Two-factor authentication */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            المصادقة الثنائية 2FA
          </CardTitle>
          <CardDescription>فرض المصادقة الثنائية أو إعادة ضبط إعداداتها للمستخدم</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Badge className={user.twoFactorEnabled ? "bg-success text-white" : "bg-muted text-muted-foreground"}>
              {user.twoFactorEnabled ? "مفعلة" : "غير مفعلة"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {user.twoFactorEnforced ? "مطلوبة عند تسجيل الدخول" : "غير مفروضة إداريًا"}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={twoFactorManager.isEnforcing || !!actionBlockReason}
              title={actionBlockReason || undefined}
              onClick={handleEnforce2FA}
            >فرض 2FA</Button>
            <Button
              variant="destructive"
              disabled={!user.twoFactorEnabled || twoFactorManager.isResetting || !!actionBlockReason}
              title={actionBlockReason || undefined}
              onClick={() => setReset2FAOpen(true)}
            >إعادة ضبط 2FA</Button>
          </div>
        </CardContent>
      </Card>

      {/* Verification & Activation */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MailCheck className="h-5 w-5 text-primary" />
            التوثيق والتفعيل
          </CardTitle>
          <CardDescription>توثيق البريد أو الهاتف يدويًا أو إعادة إرسال رابط التفعيل</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button
              variant="outline"
              className="h-20 flex-col gap-1 rounded-2xl border-primary/20 hover:bg-primary/5 hover:border-primary/30"
              disabled={!!user.emailVerified || verificationLoading !== null || !!actionBlockReason}
              title={user.emailVerified ? "البريد موثق بالفعل" : actionBlockReason || undefined}
              onClick={() => handleVerificationAction("verify-email")}
            >
              {verificationLoading === "verify-email" ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <MailCheck className="h-5 w-5 text-primary" />
              )}
              <span className="text-xs font-bold">{user.emailVerified ? "البريد موثق" : "توثيق البريد"}</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-1 rounded-2xl border-success/20 hover:bg-success/5 hover:border-success/30"
              disabled={!user.phone || !!user.phoneVerified || verificationLoading !== null || !!actionBlockReason}
              title={!user.phone ? "لا يوجد رقم هاتف مسجل" : user.phoneVerified ? "الهاتف موثق بالفعل" : actionBlockReason || undefined}
              onClick={() => handleVerificationAction("verify-phone")}
            >
              {verificationLoading === "verify-phone" ? (
                <Loader2 className="h-5 w-5 animate-spin text-success" />
              ) : (
                <MessageSquareCheck className="h-5 w-5 text-success" />
              )}
              <span className="text-xs font-bold">{user.phoneVerified ? "الهاتف موثق" : "توثيق الهاتف"}</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-1 rounded-2xl border-amber-500/20 hover:bg-amber-500/5 hover:border-amber-500/30"
              disabled={verificationLoading !== null || !!actionBlockReason}
              title={actionBlockReason || undefined}
              onClick={() => handleVerificationAction("send-activation-link")}
            >
              {verificationLoading === "send-activation-link" ? (
                <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
              ) : (
                <Send className="h-5 w-5 text-amber-600" />
              )}
              <span className="text-xs font-bold">إرسال رابط التفعيل</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Logs */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                سجل الأمان
              </CardTitle>
              <CardDescription>جميع الأحداث الأمنية المتعلقة بهذا المستخدم</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => {
                setLoading(true);
                fetchSecurityLogs();
              }}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ml-1 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث في سجل الأمان..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 rounded-xl h-11"
            />
          </div>

          {/* Logs List */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground font-medium">جاري تحميل سجل الأمان...</p>
              </div>
            </div>
          ) : logsError ? (
            <div className="rounded-2xl border border-danger/20 bg-danger/5 p-8 text-center">
              <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-danger" />
              <p className="text-sm font-bold text-danger">{logsError}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={fetchSecurityLogs}>إعادة المحاولة</Button>
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredLogs.map((log) => {
                const Icon = actionIcons[log.action] || Shield;
                const colorClass = actionColors[log.action] || "text-muted-foreground bg-muted/50";
                const label = actionLabels[log.action] || log.action;

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-muted/20 border border-transparent hover:bg-muted/40 hover:border-border/50 transition-all"
                  >
                    <div className={`p-2 rounded-xl ${colorClass} shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{label}</span>
                          {log.actorName && (
                            <span className="text-xs text-muted-foreground">
                              بواسطة {log.actorName}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                          <Clock className="h-3 w-3" />
                          {log.createdAt && isValid(new Date(log.createdAt))
                            ? format(new Date(log.createdAt), "d MMM yyyy HH:mm", { locale: ar })
                            : "-"}
                        </span>
                      </div>
                      {log.details && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{log.details}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                        {log.ipAddress && (
                          <span className="font-mono">IP: {log.ipAddress}</span>
                        )}
                        {log.userAgent && (
                          <span className="truncate max-w-[200px]">{log.userAgent}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="font-medium text-muted-foreground">
                {searchQuery ? "لا توجد نتائج للبحث" : "لا توجد أحداث أمنية مسجلة لهذا المستخدم"}
              </p>
                  <p className="text-xs text-muted-foreground mt-1">
                {!searchQuery && "عند حدوث أي نشاط أمني، سيظهر هنا"}
                  </p>
                  {user.statusReason && <p className="mt-2 text-xs font-bold">السبب: {user.statusReason}</p>}
                  {user.statusExpiresAt && <p className="mt-1 text-xs">ينتهي: {new Date(user.statusExpiresAt).toLocaleString("ar-EG")}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suspend Confirmation Dialog */}
      <AdminConfirm
        open={revokeAllOpen}
        onOpenChange={setRevokeAllOpen}
        title="إنهاء جميع جلسات المستخدم؟"
        description="سيتم تسجيل خروج المستخدم من جميع الأجهزة، وسيحتاج إلى تسجيل الدخول مرة أخرى."
        confirmText="إنهاء الجلسات"
        variant="destructive"
        loading={sessionManager.isRevokingUser}
        onConfirm={handleRevokeAllSessions}
      />

      <AdminConfirm
        open={reset2FAOpen}
        onOpenChange={setReset2FAOpen}
        title="إعادة ضبط المصادقة الثنائية؟"
        description="ستُلغى إعدادات المصادقة الثنائية الحالية والرموز الاحتياطية، وسيحتاج المستخدم إلى إعدادها مجددًا."
        confirmText="إعادة ضبط 2FA"
        variant="destructive"
        loading={twoFactorManager.isResetting}
        onConfirm={handleReset2FA}
      />

      <AdminConfirm
        open={suspendDialogOpen}
        onOpenChange={setSuspendDialogOpen}
        title="إيقاف حساب المستخدم؟"
        description={`هل أنت متأكد من إيقاف حساب ${user.name || user.email}؟ المستخدم لن يتمكن من تسجيل الدخول أو استخدام المنصة حتى يتم إلغاء الإيقاف.`}
        confirmText="تأكيد الإيقاف"
        variant="warning"
        onConfirm={() => handleStatusAction("suspend")}
        loading={actionLoading}
      />

      {/* Ban Confirmation Dialog */}
      <AdminConfirm
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
        title="حظر المستخدم؟"
        description={`تحذير: أنت على وشك حظر المستخدم ${user.name || user.email}. هذا الإجراء لا يمكن التراجع عنه بسهولة. المستخدم المحظور لا يمكنه الوصول إلى المنصة أبداً.`}
        confirmText="تأكيد الحظر"
        variant="destructive"
        onConfirm={() => handleStatusAction("ban")}
        loading={actionLoading}
      />
    </div>
  );
}
