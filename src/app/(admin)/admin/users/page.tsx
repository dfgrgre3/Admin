"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable, RowActions } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { RoleBadge, StatusBadge } from "@/components/admin/ui/admin-badge";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Download, Mail, Shield, Users, Zap, Search, Send, LogIn, Upload, AlertTriangle, RefreshCw } from "lucide-react";
import { useExport, ExportColumn } from '@/lib/export-utils';
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import dynamic from "next/dynamic";
import { CsvImportDialog } from "@/components/admin/ui/csv-import-dialog";

const MessageModal = dynamic(() => import("@/components/admin/broadcast/broadcast-modal").then(mod => ({ default: mod.BroadcastModal })), {
  ssr: false,
  loading: () => null,
});
import { Checkbox } from "@/components/ui/checkbox";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "@/lib/api/routes";
import { adminFetch } from "@/lib/api/admin-api";
import { adminUsersApi, type AdminUserListItem, type AdminUsersPage as AdminUsersPageData } from "@/lib/api/admin-users-api";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole, UserStatus } from "@/types/enums";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { getUserActionBlockReason } from "@/lib/user-action-guards";
import { useAdaptiveDebounce } from "@/hooks/use-adaptive-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { logger } from '@/lib/logger';
import { AnalyticsSection } from "./_components/analytics-section";


export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user: currentUser, hasPermission } = usePermission();
  const canManageUsers = hasPermission(PERMISSIONS.USERS_MANAGE);
  const [page, setPage] = React.useState(() => Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = React.useState(() => Number(searchParams.get("limit")) || 10);
  const [search, setSearch] = React.useState(() => searchParams.get("search") || "");
  const [querySearch, setQuerySearch] = React.useState(() => searchParams.get("search") || "");
  const [role, setRole] = React.useState<"all" | UserRole>(() => (searchParams.get("role") as UserRole) || "all");
  const [status, setStatus] = React.useState<string>(() => searchParams.get("status") || "all");
  const [sortBy, setSortBy] = React.useState(() => searchParams.get("sortBy") || "createdAt");
  const [sortOrder, setSortOrder] = React.useState(() => searchParams.get("sortOrder") || "desc");

  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; ids: string[] }>({
    open: false,
    ids: [],
  });
  const [messageDialog, setMessageDialog] = React.useState<{ open: boolean; users: AdminUserListItem[] }>({
    open: false,
    users: [],
  });
  const [impersonateDialog, setImpersonateDialog] = React.useState<{ open: boolean; user: AdminUserListItem | null }>({
    open: false,
    user: null,
  });
  const [impersonating, setImpersonating] = React.useState(false);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const { debouncedCallback: updateQuerySearch } = useAdaptiveDebounce(
    (value: unknown) => setQuerySearch(String(value)),
    { minDelay: 300, maxDelay: 500, initialDelay: 350 },
  );
  const { exportToCSV } = useExport();

  const exportAbortControllerRef = React.useRef<AbortController | null>(null);
  const queryAbortControllerRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    return () => {
      if (exportAbortControllerRef.current) {
        exportAbortControllerRef.current.abort();
        exportAbortControllerRef.current = null;
      }
      if (queryAbortControllerRef.current) {
        queryAbortControllerRef.current.abort();
        queryAbortControllerRef.current = null;
      }
    };
  }, []);

  const isMountedRef = React.useRef(false);
  React.useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    const params = new URLSearchParams();
    const values: Record<string, string> = {
      page: String(page),
      limit: String(limit),
      search: querySearch,
      role,
      status,
      sortBy,
      sortOrder,
    };
    Object.entries(values).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "false") params.set(key, value);
    });
    const url = `/admin/users?${params.toString()}`;
    if (typeof window !== "undefined") {
      window.history.replaceState(window.history.state, "", url);
    }
  }, [page, limit, querySearch, role, status, sortBy, sortOrder]);

  const clearAllFilters = () => {
    setSearch("");
    setQuerySearch("");
    setRole("all");
    setStatus("all");
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "users", page, limit, querySearch, role, status, sortBy, sortOrder],
    queryFn: async () => {
      return adminUsersApi.list({
        page,
        limit,
        search: querySearch,
        role: role === "all" ? undefined : role as UserRole,
        status: status === "all" ? undefined : status as UserStatus,
        sortBy: sortBy as "name" | "createdAt" | "lastLogin" | "totalXP" | "status",
        sortOrder: sortOrder as "asc" | "desc",
      });
    },
    placeholderData: keepPreviousData,
    retry: 1,
  });

  const runBulkUpdate = async (rows: AdminUserListItem[], changes: Partial<Pick<AdminUserListItem, "role" | "status">>) => {
    const allowed = rows.filter((target) => !getUserActionBlockReason(currentUser, target, "suspend"));
    if (!allowed.length) return toast.error("لا توجد حسابات مسموح بتعديلها");
    const results = await adminUsersApi.updateMany(allowed.map((item) => item.id), changes);
    const successIds = new Set(allowed.filter((_, index) => results[index]?.status === "fulfilled").map((item) => item.id));
    queryClient.setQueryData<AdminUsersPageData>(["admin", "users", page, limit, querySearch, role, status, sortBy, sortOrder], (old) => old ? {
      ...old,
      users: old.users.map((item) => successIds.has(item.id) ? { ...item, ...changes } : item),
    } : old);
    toast.success(`تم تحديث ${successIds.size} مستخدم`);
    if (successIds.size < allowed.length) toast.error(`فشل تحديث ${allowed.length - successIds.size} مستخدم`);
  };

  const handleDelete = async () => {
    if (!deleteDialog.ids.length) return;
    try {
      if (!canManageUsers) throw new Error("غير مصرح بتنفيذ الإجراء");
      const targets = (data?.users || []).filter((item) => deleteDialog.ids.includes(item.id));
      const allowed = targets.filter((target) => !getUserActionBlockReason(currentUser, target, "delete"));
      const blockedCount = targets.length - allowed.length;
      const result = await adminUsersApi.bulkRemove(allowed.map((target) => target.id));
      if (result.deleted) toast.success(`تم حذف ${result.deleted} مستخدم بنجاح`);
      if (blockedCount) toast.warning(`تم استبعاد ${blockedCount} حساب محمي`);
      if (result.failed) toast.error(`فشل حذف ${result.failed} مستخدم`);
      await refetch();
    } catch (err: unknown) {
      toast.error("خطأ في الاتصال بالخادم");
      console.error(err instanceof Error ? err.message : String(err));
    } finally {
      setDeleteDialog({ open: false, ids: [] });
    }
  };

  const handleImpersonate = async () => {
    if (!impersonateDialog.user) return;
    const blocked = getUserActionBlockReason(currentUser, impersonateDialog.user, "impersonate");
    if (!canManageUsers || blocked) {
      toast.error(blocked || "غير مصرح بتنفيذ الإجراء");
      return;
    }
    setImpersonating(true);
    try {
      const res = await adminFetch(apiRoutes.admin.impersonateById(impersonateDialog.user.id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
        credentials: 'include'
      });
      if (res.ok) {
        toast.success('تم تبديل الهوية، جاري التوجيه...');
        window.location.href = '/';
      } else {
        const data = await res.json();
        toast.error(data.error || 'فشل في تبديل الهوية');
      }
    } catch (error) {
      logger.error("فشل تبديل الهوية", error);
      toast.error('خطأ في الاتصال');
    } finally {
      setImpersonating(false);
      setImpersonateDialog({ open: false, user: null });
    }
  };

  const handleExportCSV = async () => {
    if (exportAbortControllerRef.current) {
      exportAbortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    exportAbortControllerRef.current = abortController;

    setExporting(true);
    try {
      const first = await adminUsersApi.list({
        page: 1,
        limit: 200,
        search: querySearch,
        role: role === "all" ? undefined : role as UserRole,
        status: status === "all" ? undefined : status as UserStatus,
        sortBy: sortBy as "name" | "createdAt" | "lastLogin" | "totalXP" | "status",
        sortOrder: sortOrder as "asc" | "desc",
      });

      if (abortController.signal.aborted) return;

      const remaining: AdminUsersPageData[] = [];
      for (let startPage = 2; startPage <= first.pagination.totalPages; startPage += 4) {
        if (abortController.signal.aborted) return;

        const batch = await Promise.all(
          Array.from({ length: Math.min(4, first.pagination.totalPages - startPage + 1) }, (_, index) =>
            adminUsersApi.list({
              page: startPage + index,
              limit: 200,
              search: querySearch,
              role: role === "all" ? undefined : role as UserRole,
              status: status === "all" ? undefined : status as UserStatus,
              sortBy: sortBy as "name" | "createdAt" | "lastLogin" | "totalXP" | "status",
              sortOrder: sortOrder as "asc" | "desc",
            })
          ),
        );
        remaining.push(...batch);
      }
      const users = [first, ...remaining].flatMap((result) => result.users);
      if (!users.length) {
        toast.error('لا توجد بيانات للتصدير');
        return;
      }
      const exportColumns: ExportColumn<AdminUserListItem>[] = [
        { header: 'الاسم', accessor: (u) => u.name || u.username || "بدون اسم" },
        { header: 'البريد الإلكتروني', accessor: 'email' },
        { header: 'الدور', accessor: 'role' },
        { header: 'النقاط', accessor: (u) => u.totalXP || 0 },
        { header: 'تاريخ الالتحاق', accessor: (u) => new Date(u.createdAt).toLocaleDateString('ar-EG') },
        { header: 'آخر دخول', accessor: (u) => u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('ar-EG') : 'لم يسجل دخول' },
      ];
      exportToCSV(users, exportColumns, 'users');
      toast.success(`تم تصدير ${users.length} مستخدم بنجاح`);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        toast.info("تم إلغاء عملية التصدير");
        return;
      }
      logger.error("فشل تصدير CSV", err);
      toast.error("فشل تصدير بيانات المستخدمين");
    } finally {
      setExporting(false);
      exportAbortControllerRef.current = null;
    }
  };

  const columns: ColumnDef<AdminUserListItem>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="تحديد الكل"
          className="translate-y-[2px] border-white/20"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="تحديد الصف"
          className="translate-y-[2px] border-white/20"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "المستخدم",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Avatar className="h-10 w-10 border-2 border-primary/20 transition-transform group-hover:scale-110">
                <AvatarImage src={user.avatar || ""} />
                <AvatarFallback className="font-bold bg-primary/10 text-primary">
                  {user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 border border-border shadow-sm">
                <div className="bg-primary text-[8px] font-black text-white px-1 rounded-full uppercase tracking-tighter">
                  LVL {user.level || 1}
                </div>
              </div>
            </div>
            <div>
              <p className="font-black text-sm tracking-tight">{user.name || user.username || "بدون اسم"}</p>
              <p className="text-[10px] text-muted-foreground font-bold opacity-60 italic">{user.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "الدور الوظيفي",
      cell: ({ row }) => <RoleBadge role={row.original.role} />,
    },
    {
      accessorKey: "totalXP",
      header: "نقاط التفاعل",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-black text-primary flex items-center gap-1">
            <Zap className="w-3 h-3 fill-primary" />
            {(row.original.totalXP || 0).toLocaleString()} نقطة
          </span>
          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
            {row.original._count?.tasks || 0} نشاط مكتمل
          </span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "تاريخ الانضمام",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-black">{new Date(row.original.createdAt).toLocaleDateString("ar-EG")}</span>
          <span className="text-[10px] text-muted-foreground font-bold italic">
            منذ {Math.floor((Date.now() - new Date(row.original.createdAt).getTime()) / (1000 * 60 * 60 * 24))} يوم
          </span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => <StatusBadge status={row.original.status === UserStatus.ACTIVE ? "active" : row.original.status === UserStatus.INACTIVE || row.original.status === UserStatus.DELETED ? "inactive" : "suspended"} />,
    },
    {
      id: "verification",
      header: "التوثيق والأمان",
      cell: ({ row }) => <div className="flex flex-wrap gap-1">
        <StatusBadge status={row.original.emailVerified ? "verified" : "unverified"} />
        <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${row.original.phoneVerified ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>الهاتف</span>
        <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${row.original.twoFactorEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>2FA</span>
      </div>,
    },
    {
      accessorKey: "lastLogin",
      header: "آخر دخول",
      cell: ({ row }) => row.original.lastLogin
        ? <div><p className="text-sm font-bold">{new Date(row.original.lastLogin).toLocaleDateString("ar-EG")}</p><p className="text-[10px] text-muted-foreground">{new Date(row.original.lastLogin).toLocaleTimeString("ar-EG")}</p></div>
        : <span className="text-xs text-muted-foreground">لم يسجل دخولًا</span>,
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => (
        (() => {
          const deleteBlock = getUserActionBlockReason(currentUser, row.original, "delete");
          const impersonateBlock = getUserActionBlockReason(currentUser, row.original, "impersonate");
          return (
            <RowActions
              row={row.original}
              onView={(u) => router.push(`/admin/users/${u.id}`)}
              onEdit={canManageUsers ? (u) => router.push(`/admin/users/${u.id}/edit`) : undefined}
              onDelete={canManageUsers && !deleteBlock ? (u) => setDeleteDialog({ open: true, ids: [u.id] }) : undefined}
              extraActions={[
                { icon: Mail, label: "إرسال رسالة", onClick: (u) => setMessageDialog({ open: true, users: [u] }) },
                ...(canManageUsers ? [{ icon: Shield, label: "إدارة الصلاحيات", onClick: (u: AdminUserListItem) => router.push(`/admin/users/${u.id}/permissions`) }] : []),
                {
                  icon: LogIn, label: "تسجيل الدخول كـ", onClick: (u) => setImpersonateDialog({ open: true, user: u }),
                  disabled: !canManageUsers || !!impersonateBlock,
                  disabledReason: impersonateBlock || undefined,
                },
              ]}
            />
          );
        })()
      ),
    },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader
        title="إدارة مستخدمي المنصة ⚙️"
        description="إدارة جميع مستخدمي المنصة، أدوارهم، وصلاحياتهم داخل النظام التعليمي."
      >
        <div className="flex flex-wrap items-center gap-3">
          <AdminButton variant="outline" icon={Download} onClick={handleExportCSV} loading={exporting} className="rounded-2xl border-white/10">
            تصدير البيانات CSV
          </AdminButton>
          <AdminButton variant="outline" icon={Upload} onClick={() => setImportDialogOpen(true)} className="rounded-2xl border-white/10">
            استيراد CSV
          </AdminButton>
          <AdminButton variant="premium" icon={UserPlus} onClick={() => router.push("/admin/users/create")} className="rounded-2xl shadow-xl">
            إضافة مستخدم جديد
          </AdminButton>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminStatsCard
          title="إجمالي المستخدمين"
          value={data?.summary?.totalUsers || 0}
          icon={Users}
          color="blue"
          description="مستخدم في المنصة"
        />
        <AdminStatsCard
          title="حسابات المسؤولين"
          value={data?.summary?.totalAdmins || 0}
          icon={Shield}
          color="yellow"
          description="حساب إداري فعال"
        />
        <AdminStatsCard
          title="المستخدمين النشطين"
          value={data?.summary?.powerUsers || 0}
          icon={Zap}
          color="green"
          description="تفاعل عالي هذا الأسبوع"
        />
      </div>

      {/* Analytics Charts Section */}
      <AnalyticsSection />

      <Tabs value={role} onValueChange={(val) => { setRole(val as "all" | UserRole); setPage(1); }} className="w-full">
        <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/10 h-12 flex gap-1 mb-6 w-full max-w-full justify-start overflow-x-auto sm:w-fit">
          <TabsTrigger value="all" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">كل المستخدمين</TabsTrigger>
          <TabsTrigger value="STUDENT" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">الطلاب</TabsTrigger>
          <TabsTrigger value="PARENT" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">أولياء الأمور</TabsTrigger>
          <TabsTrigger value="TEACHER" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">المعلمون</TabsTrigger>
          <TabsTrigger value="MODERATOR" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">المشرفون</TabsTrigger>
          <TabsTrigger value="ADMIN" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">المدراء</TabsTrigger>
        </TabsList>
      </Tabs>

      <Tabs value={status} onValueChange={(val) => { setStatus(val); setPage(1); }} className="w-full">
        <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/10 h-12 flex gap-1 mb-6 w-full max-w-full justify-start overflow-x-auto sm:w-fit">
          <TabsTrigger value="all" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">كل الحالات</TabsTrigger>
          <TabsTrigger value="ACTIVE" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg">نشط</TabsTrigger>
          <TabsTrigger value="SUSPENDED" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-yellow-500 data-[state=active]:text-white data-[state=active]:shadow-lg">موقوف</TabsTrigger>
          <TabsTrigger value="BANNED" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg">محظور</TabsTrigger>
        </TabsList>
      </Tabs>

      {isError && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="font-bold">تعذر تحميل المستخدمين</p>
              <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : "تحقق من الاتصال ثم أعد المحاولة."}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            <RefreshCw className="ml-2 h-4 w-4" />
            إعادة المحاولة
          </Button>
        </div>
      )}

      <div className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <AdminDataTable
          columns={columns}
          data={data?.users || []}
          loading={isLoading}
          serverSide
          selectable
          virtualized
          bulkActions={[
            { label: "إرسال رسالة جماعية", icon: Send, onClick: (rows) => setMessageDialog({ open: true, users: rows }) },
            { label: "تعليق الحسابات", icon: Shield, variant: "outline", disabled: !canManageUsers, onClick: (rows) => void runBulkUpdate(rows, { status: UserStatus.SUSPENDED }) },
            { label: "تفعيل الحسابات", icon: Zap, variant: "outline", disabled: !canManageUsers, onClick: (rows) => void runBulkUpdate(rows, { status: UserStatus.ACTIVE }) },
            { label: "تحويل إلى طلاب", icon: Users, variant: "outline", disabled: !canManageUsers, onClick: (rows) => void runBulkUpdate(rows, { role: UserRole.STUDENT }) },
            { label: "تصدير المحدد", icon: Download, variant: "outline", onClick: (rows) => { exportToCSV(rows, [{ header: "الاسم", accessor: (item) => item.name || item.username || "بدون اسم" }, { header: "البريد", accessor: "email" }, { header: "الدور", accessor: "role" }, { header: "الحالة", accessor: "status" }, { header: "XP", accessor: "totalXP" }], "selected-users"); } },
            { label: "حذف السجلات", icon: UserPlus, variant: "destructive", disabled: !canManageUsers, onClick: (rows) => setDeleteDialog({ open: true, ids: rows.map((item) => item.id) }) },
          ]}
          totalRows={data?.pagination?.total || 0}
          pageCount={data?.pagination?.totalPages || 1}
          currentPage={page}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
          pageSize={limit}
          actions={{ onRefresh: () => refetch() }}
          toolbar={
            <div className="flex items-center gap-2">
              <div className="relative group w-full sm:w-auto">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <input
                  type="text"
                  placeholder="فلترة السجلات..."
                  aria-label="فلترة سجلات المستخدمين"
                  className="bg-accent/10 border border-border rounded-xl h-10 px-10 text-sm focus:ring-1 ring-primary outline-none w-full sm:w-64 font-bold"
                  value={search}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearch(value);
                    setPage(1);
                    updateQuerySearch(value.trim());
                  }}
                />
              </div>
            </div>
          }
        />
      </div>

      <AdminConfirm
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, ids: [] })}
        title={deleteDialog.ids.length > 1 ? `حذف ${deleteDialog.ids.length} مستخدم؟` : "حذف حساب مستخدم؟"}
        description="سيتم حذف الحسابات المحددة، مع استبعاد حسابك الحالي وأي حساب أعلى من صلاحيتك. لا يمكن التراجع عن العملية."
        confirmText="تأكيد الحذف النهائي"
        variant="destructive"
        onConfirm={handleDelete}
      />
      <AdminConfirm
        open={impersonateDialog.open}
        onOpenChange={(open) => setImpersonateDialog({ open, user: null })}
        title="تبديل الهوية (Impersonate)"
        description={`أنت على وشك الدخول بهوية المستخدم ${impersonateDialog.user?.name || 'المختار'}. ستتمكن من رؤية المنصة تماماً كما يراها.`}
        confirmText="تأكيد الدخول"
        variant="premium"
        onConfirm={handleImpersonate}
        loading={impersonating}
      />
      <MessageModal
        open={messageDialog.open}
        onOpenChange={(open) => setMessageDialog({ open, users: open ? messageDialog.users : [] })}
        users={messageDialog.users}
      />
      <CsvImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        title="استيراد مستخدمين من CSV"
        description="قم برفع ملف CSV يحتوي على بيانات المستخدمين لإضافتهم دفعة واحدة."
        columns={[
          { key: "email", label: "البريد الإلكتروني", required: true },
          { key: "name", label: "الاسم", required: true },
          { key: "username", label: "اسم المستخدم", required: false },
          { key: "password", label: "كلمة المرور", required: true },
          { key: "role", label: "الدور", required: false },
        ]}
        templateFileName="users-template.csv"
        onImport={async (rows) => {
          try {
            const payload = rows.map(row => ({
              email: String(row.email),
              name: String(row.name),
              username: row.username || undefined,
              password: String(row.password),
              role: row.role || "STUDENT",
            }));
            const result = await adminUsersApi.bulkCreate(payload);
            if (result.created > 0) {
              toast.success(`تم استيراد ${result.created} مستخدم بنجاح دفعة واحدة`);
              refetch();
            }
            if (result.failed > 0) {
              toast.warning(`فشل في استيراد ${result.failed} مستخدم`);
            }
          } catch (err) {
            toast.error("حدث خطأ في الاتصال أثناء الاستيراد الجماعي");
          }
        }}
      />
    </div>
  );
}