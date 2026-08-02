"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Plus, ShieldCheck, Users, KeyRound, Monitor, FileText, Activity as ActivityIcon, Sparkles, Send, Shield, Lock, XCircle, Search, Filter } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminBadge } from "@/components/admin/ui/admin-badge";
import { adminUsersApi } from "@/lib/api/admin-users-api";
import { adminFetch } from "@/lib/api/admin-api";
import { UserRole, UserStatus } from "@/types/enums";
import { AdminsStats } from "./admins-stats";
import { AdminsToolbar } from "./admins-toolbar";
import { AdminsTable, type AdminStaffRow } from "./admins-table";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export function AdminsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<"all" | UserRole>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [roleDraft, setRoleDraft] = useState<UserRole>(UserRole.ADMIN);
  const [permissionDraft, setPermissionDraft] = useState<string[]>([]);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditFilter, setAuditFilter] = useState("all");
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; actor: string; action: string; target: string; createdAt: string; ip: string; details: string }>>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-staff", search, selectedRole],
    queryFn: async () => {
      const params = new URLSearchParams({ page: "1", limit: "100", sortBy: "lastLogin", sortOrder: "desc" });
      if (search.trim()) params.set("search", search.trim());
      if (selectedRole !== "all") params.set("role", selectedRole);
      const response = await adminFetch(`/api/admin/admins?${params.toString()}`);
      if (!response.ok) {
        const failure = await response.json().catch(() => null) as { error?: string; message?: string } | null;
        throw new Error(failure?.error || failure?.message || `Failed to fetch administrators (${response.status})`);
      }
      const payload = await response.json();
      const result = payload?.data ?? payload;
      const mapped: AdminStaffRow[] = (result?.admins ?? []).map((user: Record<string, unknown>) => ({
        id: String(user.id),
        name: typeof user.name === "string" ? user.name : null,
        email: String(user.email ?? ""),
        role: user.role as UserRole,
        status: user.status as UserStatus,
        lastLogin: typeof user.lastLogin === "string" ? user.lastLogin : null,
        permissions: Array.isArray(user.permissions) ? user.permissions.filter((value): value is string => typeof value === "string") : [],
        createdAt: typeof user.createdAt === "string" ? user.createdAt : null,
      }));
      const summary = result?.statistics ?? {};
      return {
        users: mapped,
        stats: {
          total: Number(summary.total ?? 0),
          active: Number(summary.active ?? 0),
          pending: 0,
          critical: Number(summary.suspended ?? 0) + Number(summary.blocked ?? 0),
          online: Number(summary.online ?? 0),
        },
      };
    },
    staleTime: 30000,
  });

  const stats = data?.stats ?? { total: 0, active: 0, pending: 0, critical: 0, online: 0 };
  const users = data?.users ?? [];
  const headerBadge = useMemo(() => `${stats.total} عضو`, [stats.total]);

  const { data: backendSessions = [], isLoading: sessionsLoading, refetch: refetchSessions } = useQuery({
    queryKey: ["admin", "sessions", "admins-page"],
    queryFn: async () => {
      const response = await adminFetch("/api/admin/security/sessions");
      if (!response.ok) throw new Error("Failed to fetch admin sessions");
      const payload = await response.json();
      return ((payload?.data?.sessions || payload?.sessions || []) as Array<Record<string, unknown>>).map((session) => {
        const user = session.user as Record<string, unknown> | undefined;
        return {
        id: String(session.id ?? ""),
        userId: String(session.userId ?? session.user_id ?? ""),
        userName: String(session.userName ?? session.user_name ?? user?.name ?? ""),
        userEmail: String(session.userEmail ?? session.user_email ?? user?.email ?? ""),
        deviceName: String(session.deviceName ?? session.device_name ?? "الجهاز"),
        browser: String(session.browser ?? "-"),
        os: String(session.os ?? "-"),
        status: String(session.status ?? "active"),
        };
      });
    },
    enabled: false,
  });

  const refreshAdminData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-staff"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "sessions"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "session-stats"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "sessions", "admins-page"] }),
    ]);
    await refetchSessions();
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const handleBulkActivate = async () => {
    if (!selectedIds.length) return toast.error("يرجى اختيار مشرفين أولًا");
    try {
      await Promise.all(selectedIds.map((id) => adminUsersApi.updateStatus(id, UserStatus.ACTIVE)));
      await refreshAdminData();
      toast.success("تم تفعيل المشرفين المختارين");
      setSelectedIds([]);
    } catch {
      toast.error("فشل تفعيل المشرفين المختارين");
    }
  };

  const handleBulkSuspend = async () => {
    if (!selectedIds.length) return toast.error("يرجى اختيار مشرفين أولًا");
    try {
      await Promise.all(selectedIds.map((id) => adminUsersApi.updateStatus(id, UserStatus.SUSPENDED)));
      await refreshAdminData();
      toast.success("تم إيقاف المشرفين المختارين");
      setSelectedIds([]);
    } catch {
      toast.error("فشل إيقاف المشرفين المختارين");
    }
  };

  const handleBulkNotify = async () => {
    if (!selectedIds.length) return toast.error("يرجى اختيار مشرفين أولًا");
    try {
      await Promise.all(selectedIds.map((id) => adminUsersApi.sendNotification(id, {
        title: "تنبيه إداري",
        body: "تمت مخاطبتك من إدارة المشرفين",
        channels: ["IN_APP"],
      })));
      await refreshAdminData();
      toast.success("تم إرسال الإشعارات للمشرفين المختارين");
      setSelectedIds([]);
    } catch {
      toast.error("فشل إرسال الإشعارات");
    }
  };

  const recentSessions = backendSessions.slice(0, 5);
  const recentActivity = users.slice(0, 4);

  const loadAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const response = await adminFetch("/api/admin/audit-logs?limit=100");
      if (!response.ok) throw new Error("Failed to load audit logs");
      const payload = await response.json();
      const data = (payload?.data ?? payload) as Record<string, unknown> | unknown[] | null;
      const items = Array.isArray(data)
        ? data
        : Array.isArray((data as Record<string, unknown>)?.items)
          ? ((data as Record<string, unknown>).items as unknown[])
          : Array.isArray((data as Record<string, unknown>)?.logs)
            ? ((data as Record<string, unknown>).logs as unknown[])
            : [];

      setAuditLogs(items.map((item: any) => ({
        id: item.id || `${item.createdAt || Date.now()}-${Math.random()}`,
        actor: item.user?.name || item.user?.email || item.actor?.name || item.actor?.email || "نظام",
        action: item.eventType || item.action || "إجراء",
        target: item.resource || item.resourceId || item.targetName || "إدارة",
        createdAt: item.createdAt || item.timestamp || "",
        ip: item.ip || item.ipAddress || item.IP || "-",
        details: item.metadata || item.changes || item.details || item.description || "-",
      })));
    } catch {
      toast.error("تعذر تحميل سجلات التدقيق");
    } finally {
      setAuditLoading(false);
    }
  };

  const openAdminEditor = (adminId: string) => {
    const admin = users.find((item) => item.id === adminId);
    if (!admin) return;
    setSelectedAdminId(adminId);
    setRoleDraft(admin.role as UserRole);
    setPermissionDraft(admin.permissions ?? []);
    setActiveTab("roles");
  };

  const saveAdminDraft = async () => {
    if (!selectedAdminId) return;
    try {
      const currentAdmin = users.find((item) => item.id === selectedAdminId);
      const roleChanged = currentAdmin?.role !== roleDraft;
      const permissionsChanged = JSON.stringify(currentAdmin?.permissions ?? []) !== JSON.stringify(permissionDraft);

      if (roleChanged || permissionsChanged) {
        const operations: Promise<unknown>[] = [];
        if (roleChanged) {
          operations.push(adminUsersApi.changeRole(selectedAdminId, { role: roleDraft }));
        }
        if (permissionsChanged) {
          operations.push(adminUsersApi.update(selectedAdminId, { permissions: permissionDraft } as any));
        }

        await Promise.all(operations);
        await refreshAdminData();
        toast.success("تم حفظ الدور والصلاحيات");
      } else {
        toast.info("لم يحدث أي تغيير في الدور أو الصلاحيات");
      }

      setSelectedAdminId(null);
    } catch {
      toast.error("فشل حفظ الدور والصلاحيات");
    }
  };

  const revokeSelectedSession = async (sessionId: string) => {
    try {
      const response = await adminFetch(`/api/admin/security/sessions/${sessionId}/revoke`, { method: "POST" });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Failed to revoke session");
      }
      await refreshAdminData();
      toast.success("تم إنهاء الجلسة بنجاح");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل إنهاء الجلسة");
    }
  };

  const filteredAuditLogs = auditLogs.filter((entry) => {
    const query = auditSearch.toLowerCase();
    const matchesSearch = !query || [entry.actor, entry.action, entry.target, entry.details, entry.ip].join(" ").toLowerCase().includes(query);
    const matchesFilter = auditFilter === "all" || entry.action.toLowerCase().includes(auditFilter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    if (activeTab === "activity") {
      loadAuditLogs();
    }
    if (activeTab === "sessions") {
      void refetchSessions();
    }
  }, [activeTab, refetchSessions]);

  return (
    <div className="space-y-6 pb-10" dir="rtl">
      <PageHeader
        title="إدارة المشرفين"
        description="إدارة حسابات المشرفين والصلاحيات والمهام اليومية ضمن لوحة التحكم المركزية."
        eyebrow="المستخدمون"
        badge={headerBadge}
        meta={
          <>
            <AdminBadge variant="outline" status="success" dot>
              نشط
            </AdminBadge>
            <AdminBadge variant="outline" status="info" dot>
              {stats.pending} قيد المراجعة
            </AdminBadge>
          </>
        }
      >
        <AdminButton variant="outline" icon={Bell} className="rounded-xl">
          التنبيهات
        </AdminButton>
        <AdminButton variant="gradient" icon={Plus} className="rounded-xl" onClick={() => router.push("/admin/users/create?role=ADMIN")}>
          إضافة مشرف
        </AdminButton>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-6">
          <AdminsStats {...stats} />

          <div className="flex flex-wrap gap-2 rounded-[2rem] border border-border/70 bg-card/70 p-3 shadow-sm backdrop-blur-xl">
            <AdminButton variant="outline" onClick={handleBulkActivate} className="rounded-xl">تفعيل المحدد</AdminButton>
            <AdminButton variant="outline" onClick={handleBulkSuspend} className="rounded-xl">إيقاف المحدد</AdminButton>
            <AdminButton variant="outline" onClick={handleBulkNotify} icon={Send} className="rounded-xl">إرسال إشعارات</AdminButton>
          </div>

          <AdminsToolbar
            search={search}
            selectedRole={selectedRole}
            onSearchChange={setSearch}
            onRoleChange={setSelectedRole}
            onAddAdmin={() => router.push("/admin/users/create?role=ADMIN")}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 rounded-2xl">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="roles">الأدوار والصلاحيات</TabsTrigger>
              <TabsTrigger value="sessions">الجلسات والأجهزة</TabsTrigger>
              <TabsTrigger value="activity">السجل</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              {isError ? (
                <div className="rounded-[2rem] border border-red-500/30 bg-red-500/5 p-6 text-red-600">
                  فشل تحميل بيانات المشرفين: {error instanceof Error ? error.message : "خطأ غير معروف"}
                </div>
              ) : (
                <AdminsTable
                  users={users}
                  loading={isLoading}
                  onViewAdmin={(id) => router.push(`/admin/users/${id}`)}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelected}
                />
              )}
            </TabsContent>

            <TabsContent value="roles" className="mt-4 space-y-4">
              <Card className="rounded-[2rem] border-border/70 bg-card/70 shadow-sm backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg"><KeyRound className="h-5 w-5" /> إدارة الأدوار والصلاحيات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    {Object.values(UserRole).filter((role) => role !== UserRole.STUDENT && role !== UserRole.PARENT && role !== UserRole.TEACHER).map((role) => (
                      <div key={role} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{role}</span>
                          <Badge variant="outline">دور إداري</Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">يمكن إدارة هذا الدور مباشرة من صفحة المستخدم أو من قسم الصلاحيات العامة.</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-black">تحرير الدور والصلاحيات</h3>
                        <p className="text-sm text-muted-foreground">اختر مشرفًا من الجدول لفتح محرر مباشر.</p>
                      </div>
                      <AdminButton variant="outline" onClick={() => selectedAdminId && saveAdminDraft()} disabled={!selectedAdminId}>حفظ</AdminButton>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-bold">الدور</label>
                        <Select value={roleDraft} onValueChange={(value) => setRoleDraft(value as UserRole)}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="اختر الدور" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(UserRole).filter((role) => role !== UserRole.STUDENT && role !== UserRole.PARENT && role !== UserRole.TEACHER).map((role) => (
                              <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold">الصلاحيات الإضافية</label>
                        <Input value={permissionDraft.join(", ")} onChange={(event) => setPermissionDraft(event.target.value.split(",").map((value) => value.trim()).filter(Boolean))} placeholder="users:view, users:manage" />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {users.filter((user) => selectedAdminId === user.id).map((user) => (
                        <button key={user.id} className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-bold" onClick={() => openAdminEditor(user.id)}>
                          {user.name || user.email}
                        </button>
                      ))}
                      {users.map((user) => (
                        <button key={user.id} className="rounded-full border border-border/70 px-3 py-1 text-sm" onClick={() => openAdminEditor(user.id)}>
                          {user.name || user.email}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 text-sm text-muted-foreground">
                    يتم ربط التغييرات عبر المستخدمين الحاليين والـ Backend، مع الالتزام بجميع قيض RBAC والتدقيق.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sessions" className="mt-4 space-y-4">
              <Card className="rounded-[2rem] border-border/70 bg-card/70 shadow-sm backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg"><Monitor className="h-5 w-5" /> الجلسات والأجهزة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sessionsLoading ? (
                    <p className="text-sm text-muted-foreground">جاري تحميل الجلسات من الباكند...</p>
                  ) : recentSessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">لا توجد جلسات نشطة حاليًا.</p>
                  ) : recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 p-3">
                      <div>
                        <p className="font-semibold">{session.userName || session.userEmail}</p>
                        <p className="text-sm text-muted-foreground">{session.deviceName} • {session.browser} • {session.os}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{session.status}</Badge>
                        <AdminButton variant="ghost" icon={XCircle} size="sm" onClick={() => revokeSelectedSession(session.id)}>إنهاء</AdminButton>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-4 space-y-4">
              <Card className="rounded-[2rem] border-border/70 bg-card/70 shadow-sm backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg"><FileText className="h-5 w-5" /> سجل النشاط والتدقيق</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-3 md:flex-row">
                    <div className="flex-1 rounded-2xl border border-border/70 bg-background/70 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input value={auditSearch} onChange={(event) => setAuditSearch(event.target.value)} placeholder="بحث في السجل" className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" />
                      </div>
                    </div>
                    <div className="w-full md:w-48">
                      <Select value={auditFilter} onValueChange={setAuditFilter}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="الكل" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">الكل</SelectItem>
                          <SelectItem value="role">تغيير الدور</SelectItem>
                          <SelectItem value="permission">الصلاحيات</SelectItem>
                          <SelectItem value="login">تسجيل الدخول</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {auditLoading ? (
                    <div className="text-sm text-muted-foreground">جاري تحميل السجلات...</div>
                  ) : filteredAuditLogs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">لا توجد سجلات تدقيق تطابق البحث الحالي.</p>
                  ) : filteredAuditLogs.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-border/70 bg-background/70 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold">{entry.actor}</p>
                          <p className="text-sm text-muted-foreground">{entry.action} • {entry.target}</p>
                        </div>
                        <Badge variant="outline">{entry.createdAt}</Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span>IP: {entry.ip}</span>
                        <span>{entry.details}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">مراقبة الأمان</p>
                <h3 className="text-lg font-black">نظرة سريعة</h3>
              </div>
            </div>

            <div className="space-y-3">
              {[
                ["المشرفون النشطون", `${stats.active}/${stats.total}`],
                ["الحالات الحرجة", String(stats.critical)],
                ["قيد المراجعة", String(stats.pending)],
                ["متصلون الآن", String(stats.online)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl bg-muted/40 px-3 py-2.5">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-base font-black text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-dashed border-primary/30 bg-primary/5 p-5">
            <p className="text-sm text-muted-foreground">إجراءات سريعة</p>
            <ul className="mt-4 space-y-2 text-sm text-foreground">
              <li>• مراجعة صلاحيات المشرفين</li>
              <li>• حذف الوصول من الحسابات القديمة</li>
              <li>• تفعيل المصادقة الثنائية</li>
            </ul>
          </div>

          <div className="rounded-[2rem] border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-base font-black">إجراءات جماعية</h3>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Checkbox checked={selectedIds.length > 0} onCheckedChange={() => setSelectedIds(selectedIds.length ? [] : users.map((user) => user.id))} /> تحديد الكل</div>
              <div className="rounded-2xl bg-muted/40 p-3">المحدد حاليًا: {selectedIds.length} مشرف</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
