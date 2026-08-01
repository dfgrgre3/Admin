"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Shield, AlertTriangle, XCircle, Activity, Ban, CheckCircle2, Globe2, Laptop, Plus, Trash2 } from "lucide-react";
import { AdminCard, AdminStatsCard } from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Switch } from "@/components/ui/switch";
import { adminApi } from "@/lib/api/admin-api";
import { cn } from "@/lib/utils";
import type { BlockedIPAttempt, IPWhitelistEntry, IPWhitelistSettings, IPWhitelistSettingsUpdate, SecurityHealth, SecuritySession, SecuritySessionStats } from "../_types/health";

function formatDate(value?: string | null) {
  if (!value) return "غير متاح";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "غير متاح" : date.toLocaleString("ar-EG");
}

function apiError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function unwrapData<T>(payload: T | { data: T }): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function responseItems<T>(payload: unknown, key: string): T[] {
  const data = unwrapData(payload as unknown as { data?: unknown });
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const value = (data as Record<string, unknown>)[key];
    return Array.isArray(value) ? value as T[] : [];
  }
  return [];
}

function settingsPayload(
  settings: IPWhitelistSettings,
  patch: Partial<IPWhitelistSettingsUpdate>
): IPWhitelistSettingsUpdate {
  return {
    isEnabled: settings.isEnabled,
    enforceForAdmins: settings.enforceForAdmins,
    enforceForAPI: settings.enforceForAPI,
    defaultAction: settings.defaultAction,
    allowInternalIPs: settings.allowInternalIPs,
    internalIPRanges: settings.internalIPRanges ?? [],
    logBlockedAttempts: settings.logBlockedAttempts,
    notifyOnViolation: settings.notifyOnViolation,
    notifyEmail: settings.notifyEmail ?? "",
    ...patch,
  };
}

interface SecurityStatsCardsProps {
  security: SecurityHealth | undefined;
}

export function SecurityStatsCards({ security }: SecurityStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <AdminCard
        variant="glass"
        className={cn(
          "border-2",
          security?.threatLevel === "low" && "border-green-500/30 bg-green-500/5",
          security?.threatLevel === "medium" && "border-yellow-500/30 bg-yellow-500/5",
          security?.threatLevel === "high" && "border-orange-500/30 bg-orange-500/5",
          security?.threatLevel === "critical" && "border-red-500/30 bg-red-500/5"
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-muted-foreground">مستوى التهديد</p>
            <h3 className="text-2xl font-black mt-1 capitalize">
              {security?.threatLevel ?? "—"}
            </h3>
          </div>
          <Shield className="w-8 h-8" />
        </div>
      </AdminCard>
      <AdminStatsCard
        title="تهديدات نشطة"
        value={security ? security.activeThreats.toLocaleString("ar-EG") : "—"}
        description="تحتاج مراجعة"
        icon={AlertTriangle}
        color="red"
      />
      <AdminStatsCard
        title="عناوين محظورة"
        value={security ? security.blockedIPs.toLocaleString("ar-EG") : "—"}
        description="في القائمة السوداء"
        icon={XCircle}
        color="red"
      />
      <AdminStatsCard
        title="أنشطة مشبوهة"
        value={security ? security.suspiciousActivities.toLocaleString("ar-EG") : "—"}
        description="خلال النطاق المحدد"
        icon={Activity}
        color="yellow"
      />
    </div>
  );
}

interface TwoFactorAuthProps {
  security: SecurityHealth | undefined;
}

export function TwoFactorAuth({ security }: TwoFactorAuthProps) {
  const enabled = security?.twoFactorEnabled || 0;
  const total = security?.twoFactorTotal || 0;
  const percentage = total > 0 ? Math.round((enabled / total) * 100) : 0;

  return (
    <AdminCard variant="glass">
      <h3 className="text-xl font-black mb-4">المصادقة الثنائية</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">المستخدمون المفعلون</span>
          <span className="text-lg font-black">
            {enabled} / {total}
          </span>
        </div>
        <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {percentage}% من المستخدمين
        </p>
      </div>
    </AdminCard>
  );
}

interface RecentIncidentsListProps {
  security: SecurityHealth | undefined;
}

export function RecentIncidentsList({ security }: RecentIncidentsListProps) {
  const incidents = security?.recentIncidents || [];

  if (incidents.length === 0) return null;

  return (
    <AdminCard variant="glass">
      <h3 className="text-xl font-black mb-4">الحوادث الأخيرة</h3>
      <div className="space-y-3">
        {incidents.map((incident, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
            <div>
              <p className="text-sm font-bold">{incident.type}</p>
              <p className="text-xs text-muted-foreground">{incident.count} حالة</p>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(incident.lastOccurrence).toLocaleString("ar-SA")}
            </span>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}

export function SecurityOperations() {
  const queryClient = useQueryClient();
  const [ipAddress, setIpAddress] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [type, setType] = React.useState<"admin" | "api" | "webhook">("admin");

  const sessionsQuery = useQuery<unknown>({
    queryKey: ["admin", "security", "sessions"],
    queryFn: () => adminApi.get("/api/admin/security/sessions", { limit: 100 }),
    staleTime: 10_000,
  });
  const sessionStatsQuery = useQuery<SecuritySessionStats>({
    queryKey: ["admin", "security", "session-stats"],
    queryFn: () => adminApi.get("/api/admin/security/sessions/stats"),
    staleTime: 10_000,
  });
  const whitelistQuery = useQuery<unknown>({
    queryKey: ["admin", "security", "ip-whitelist"],
    queryFn: () => adminApi.get("/api/admin/security/ip-whitelist"),
    staleTime: 10_000,
  });
  const settingsQuery = useQuery<IPWhitelistSettings>({
    queryKey: ["admin", "security", "ip-whitelist-settings"],
    queryFn: () => adminApi.get("/api/admin/security/ip-whitelist/settings"),
    staleTime: 30_000,
  });
  const blockedQuery = useQuery<unknown>({
    queryKey: ["admin", "security", "blocked-attempts"],
    queryFn: () => adminApi.get("/api/admin/security/ip-whitelist/blocked"),
    staleTime: 10_000,
  });

  const invalidateSecurity = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "security"] });
  };
  const actionMutation = useMutation({
    mutationFn: async ({ endpoint, method }: { endpoint: string; method: "POST" | "DELETE" }) => {
      const response = await adminApi.fetch(endpoint, { method });
      if (!response.ok) throw new Error(`فشل تنفيذ العملية (${response.status})`);
    },
    onSuccess: (_, variables) => {
      invalidateSecurity();
      toast.success(variables.method === "DELETE" ? "تم حذف العنوان" : "تم تحديث الجلسة");
    },
    onError: (error) => toast.error(apiError(error, "تعذر تنفيذ العملية")),
  });
  const addIPMutation = useMutation({
    mutationFn: () => adminApi.post("/api/admin/security/ip-whitelist", { ipAddress, description, type }),
    onSuccess: () => {
      setIpAddress("");
      setDescription("");
      invalidateSecurity();
      toast.success("تمت إضافة العنوان إلى القائمة المسموح بها");
    },
    onError: (error) => toast.error(apiError(error, "تعذر إضافة عنوان IP")),
  });
  const settingsMutation = useMutation({
    mutationFn: (next: IPWhitelistSettingsUpdate) => adminApi.post("/api/admin/security/ip-whitelist/settings", next),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "security", "ip-whitelist-settings"] });
      toast.success("تم حفظ إعدادات القائمة المسموح بها");
    },
    onError: (error) => toast.error(apiError(error, "تعذر حفظ الإعدادات")),
  });

  const sessions = responseItems<SecuritySession>(sessionsQuery.data, "sessions");
  const entries = responseItems<IPWhitelistEntry>(whitelistQuery.data, "entries");
  const attempts = responseItems<BlockedIPAttempt>(blockedQuery.data, "attempts");
  const settings = settingsQuery.data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStatsCard title="جلسات نشطة" value={sessionStatsQuery.data?.totalActive ?? 0} icon={Laptop} color="blue" description="متصلة الآن" />
        <AdminStatsCard title="أجهزة فريدة" value={sessionStatsQuery.data?.uniqueDevices ?? 0} icon={Globe2} color="purple" description="من الجلسات النشطة" />
        <AdminStatsCard title="محاولات محظورة" value={attempts.length} icon={Ban} color="red" description="آخر 200 محاولة" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard variant="glass">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><h3 className="text-xl font-black">الجلسات النشطة</h3><p className="text-xs text-muted-foreground">إدارة جلسات المستخدمين الحالية من الخادم</p></div>
            <AdminButton variant="outline" size="sm" onClick={invalidateSecurity} loading={sessionsQuery.isFetching}>تحديث</AdminButton>
          </div>
          {sessionsQuery.isError ? <p className="text-sm text-destructive">{apiError(sessionsQuery.error, "تعذر تحميل الجلسات")}</p> : sessionsQuery.isLoading ? <div className="h-32 animate-pulse rounded-xl bg-muted/30" /> : sessions.length === 0 ? <p className="rounded-xl bg-muted/20 p-5 text-sm text-muted-foreground">لا توجد جلسات نشطة.</p> : (
            <div className="max-h-[420px] space-y-3 overflow-auto pr-1">
              {sessions.map((session) => (
                <div key={session.id} className="rounded-xl border border-border/70 bg-background/40 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0"><p className="truncate text-sm font-black">{session.browser || session.deviceType || "جهاز غير معروف"}</p><p className="truncate text-xs text-muted-foreground">المستخدم: {session.userId}</p></div>
                    <span className={cn("rounded-full px-2 py-1 text-[10px] font-bold", session.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground")}>{session.status}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground"><span dir="ltr">{session.ipAddress || session.ip || "—"}</span><span>{session.location || session.country || "موقع غير متاح"}</span><span>آخر نشاط: {formatDate(session.lastActive || session.lastActivity)}</span><span>ينتهي: {formatDate(session.expiresAt)}</span></div>
                  <div className="mt-3 flex gap-2"><AdminButton size="sm" variant="outline" onClick={() => actionMutation.mutate({ endpoint: `/api/admin/security/sessions/${session.id}/revoke`, method: "POST" })} loading={actionMutation.isPending}>إلغاء الجلسة</AdminButton><AdminButton size="sm" variant="ghost" onClick={() => actionMutation.mutate({ endpoint: `/api/admin/security/sessions/${session.id}/suspend`, method: "POST" })} loading={actionMutation.isPending}>تعليق</AdminButton></div>
                </div>
              ))}
            </div>
          )}
        </AdminCard>

        <AdminCard variant="glass">
          <div className="mb-4"><h3 className="text-xl font-black">قائمة IP المسموح بها</h3><p className="text-xs text-muted-foreground">السياسات والعناوين محفوظة في قاعدة بيانات النظام</p></div>
          {settingsQuery.isLoading ? <div className="mb-4 h-28 animate-pulse rounded-xl bg-muted/30" /> : settingsQuery.isError ? <p className="mb-4 text-sm text-destructive">{apiError(settingsQuery.error, "تعذر تحميل سياسة عناوين IP")}</p> : settings && <div className="mb-4 space-y-3 rounded-xl border border-border/70 bg-background/40 p-3 text-sm"><label className="flex items-center justify-between gap-3"><span className="font-bold">تفعيل القائمة</span><Switch checked={settings.isEnabled} disabled={settingsMutation.isPending} onCheckedChange={(checked) => settingsMutation.mutate(settingsPayload(settings, { isEnabled: checked }))} /></label><label className="flex items-center justify-between gap-3"><span className="font-bold">فرضها على المشرفين</span><Switch checked={settings.enforceForAdmins} disabled={settingsMutation.isPending} onCheckedChange={(checked) => settingsMutation.mutate(settingsPayload(settings, { enforceForAdmins: checked }))} /></label><div className="flex items-center justify-between gap-3"><span className="font-bold">الإجراء الافتراضي</span><select value={settings.defaultAction} disabled={settingsMutation.isPending} onChange={(event) => settingsMutation.mutate(settingsPayload(settings, { defaultAction: event.target.value }))} className="rounded-lg border border-border bg-background px-2 py-1 text-xs"><option value="allow">السماح</option><option value="deny">الرفض</option></select></div></div>}
          <form onSubmit={(event) => { event.preventDefault(); if (ipAddress.trim()) addIPMutation.mutate(); }} className="mb-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
            <input required value={ipAddress} onChange={(event) => setIpAddress(event.target.value)} placeholder="عنوان IP" dir="ltr" className="h-10 rounded-lg border border-border bg-background px-3 text-sm" />
            <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="وصف اختياري" className="h-10 rounded-lg border border-border bg-background px-3 text-sm" />
            <select aria-label="نوع السماح" value={type} onChange={(event) => setType(event.target.value as typeof type)} className="h-10 rounded-lg border border-border bg-background px-2 text-sm"><option value="admin">إدارة</option><option value="api">API</option><option value="webhook">Webhook</option></select>
            <AdminButton type="submit" icon={Plus} loading={addIPMutation.isPending}>إضافة</AdminButton>
          </form>
          {whitelistQuery.isError ? <p className="text-sm text-destructive">{apiError(whitelistQuery.error, "تعذر تحميل القائمة")}</p> : whitelistQuery.isLoading ? <div className="h-28 animate-pulse rounded-xl bg-muted/30" /> : entries.length === 0 ? <p className="rounded-xl bg-muted/20 p-5 text-sm text-muted-foreground">لا توجد عناوين مسجلة.</p> : <div className="max-h-[300px] space-y-2 overflow-auto pr-1">{entries.map((entry) => <div key={entry.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/70 p-3"><div className="min-w-0"><p className="font-mono text-sm font-black" dir="ltr">{entry.ipAddress}{entry.cidr ? ` (${entry.cidr})` : ""}</p><p className="truncate text-xs text-muted-foreground">{entry.description || entry.type} · {entry.status}</p></div><AdminButton size="sm" variant="ghost" icon={Trash2} aria-label="حذف العنوان" onClick={() => { if (window.confirm("هل تريد حذف هذا العنوان؟")) actionMutation.mutate({ endpoint: `/api/admin/security/ip-whitelist/${entry.id}`, method: "DELETE" }); }} loading={actionMutation.isPending} /></div>)}</div>}
        </AdminCard>
      </div>

      <AdminCard variant="glass">
        <div className="mb-4 flex items-center gap-2"><Ban className="h-5 w-5 text-red-500" /><div><h3 className="text-xl font-black">محاولات الوصول المحظورة</h3><p className="text-xs text-muted-foreground">بيانات مباشرة من سجل الحماية، بدون بيانات تجريبية</p></div></div>
        {blockedQuery.isError ? <p className="text-sm text-destructive">{apiError(blockedQuery.error, "تعذر تحميل المحاولات المحظورة")}</p> : blockedQuery.isLoading ? <div className="h-24 animate-pulse rounded-xl bg-muted/30" /> : attempts.length === 0 ? <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" />لا توجد محاولات محظورة مسجلة.</div> : <div className="grid gap-2 md:grid-cols-2">{attempts.slice(0, 12).map((attempt) => <div key={attempt.id} className="rounded-xl border border-border/70 p-3"><div className="flex items-center justify-between gap-2"><span className="font-mono text-sm font-black" dir="ltr">{attempt.ipAddress}</span><span className="text-xs text-muted-foreground">{formatDate(attempt.attemptedAt)}</span></div><p className="mt-1 text-xs text-muted-foreground">{attempt.method} {attempt.endpoint} · {attempt.reason || "سبب غير محدد"} {attempt.count && attempt.count > 1 ? `· ${attempt.count} مرات` : ""}</p></div>)}</div>}
      </AdminCard>
    </div>
  );
}