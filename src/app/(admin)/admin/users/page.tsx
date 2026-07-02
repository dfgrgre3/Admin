"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable, RowActions } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { RoleBadge, StatusBadge } from "@/components/admin/ui/admin-badge";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Download, Mail, Shield, Users, Zap, Search, Send, LogIn, Upload, AlertTriangle, RefreshCw, FilterX, Filter } from "lucide-react";
import { exportToCSV, ExportColumn } from '@/lib/export-utils';
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import { BroadcastModal as MessageModal } from "@/components/admin/broadcast/broadcast-modal";
import { CsvImportDialog } from "@/components/admin/ui/csv-import-dialog";
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

interface AdvancedFiltersState {
  emailVerified: string;
  phoneVerified: string;
  twoFactorEnabled: string;
  country: string;
  gradeLevel: string;
  subscriptionStatus: string;
  createdFrom: string;
  createdTo: string;
  lastLoginFrom: string;
  lastLoginTo: string;
  subscriptionExpiresTo: string;
  includeDeleted: boolean;
}

const DEFAULT_ADVANCED: AdvancedFiltersState = {
  emailVerified: "all",
  phoneVerified: "all",
  twoFactorEnabled: "all",
  country: "",
  gradeLevel: "",
  subscriptionStatus: "all",
  createdFrom: "",
  createdTo: "",
  lastLoginFrom: "",
  lastLoginTo: "",
  subscriptionExpiresTo: "",
  includeDeleted: false,
};

function parseAdvancedFromParams(searchParams: URLSearchParams): AdvancedFiltersState {
  return {
    emailVerified: searchParams.get("emailVerified") || "all",
    phoneVerified: searchParams.get("phoneVerified") || "all",
    twoFactorEnabled: searchParams.get("twoFactorEnabled") || "all",
    country: searchParams.get("country") || "",
    gradeLevel: searchParams.get("gradeLevel") || "",
    subscriptionStatus: searchParams.get("subscriptionStatus") || "all",
    createdFrom: searchParams.get("createdFrom") || "",
    createdTo: searchParams.get("createdTo") || "",
    lastLoginFrom: searchParams.get("lastLoginFrom") || "",
    lastLoginTo: searchParams.get("lastLoginTo") || "",
    subscriptionExpiresTo: searchParams.get("subscriptionExpiresTo") || "",
    includeDeleted: searchParams.get("includeDeleted") === "true",
  };
}

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
  const [role, setRole] = React.useState<string>(() => searchParams.get("role") || "all");
  const [status, setStatus] = React.useState<string>(() => searchParams.get("status") || "all");
  const [sortBy, setSortBy] = React.useState(() => searchParams.get("sortBy") || "createdAt");
  const [sortOrder, setSortOrder] = React.useState(() => searchParams.get("sortOrder") || "desc");

  // Local (draft) advanced filters - only applied when user clicks "تطبيق الفلاتر"
  const [localAdvanced, setLocalAdvanced] = React.useState<AdvancedFiltersState>(
    () => parseAdvancedFromParams(searchParams)
  );
  // Applied advanced filters - the ones actually used in queries
  const [advanced, setAdvanced] = React.useState<AdvancedFiltersState>(
    () => parseAdvancedFromParams(searchParams)
  );

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
  const [savedViews, setSavedViews] = React.useState<Array<{ name: string; url: string }>>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("admin-user-views") || "[]"); } catch { return []; }
  });
  const { debouncedCallback: updateQuerySearch } = useAdaptiveDebounce(
    (value: unknown) => setQuerySearch(String(value)),
    { minDelay: 300, maxDelay: 500, initialDelay: 350 },
  );

  // AbortController ref for export & long-running operations
  const exportAbortControllerRef = React.useRef<AbortController | null>(null);
  // Generic query abort controller ref – auto-cancels on unmount or filter change
  const queryAbortControllerRef = React.useRef<AbortController | null>(null);

  // Cleanup all pending abort controllers on unmount
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

  // Sync URL with applied filters (not local draft)
  // Use a flag to prevent URL updates on initial mount (avoids extra navigation)
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
      ...Object.fromEntries(
        Object.entries(advanced).map(([key, value]) => [key, String(value)])
      ),
    };
    Object.entries(values).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "false") params.set(key, value);
    });
    router.replace(`/admin/users?${params.toString()}`, { scroll: false });
  }, [page, limit, querySearch, role, status, sortBy, sortOrder, advanced, router]);

  // Apply advanced filters
  const applyAdvancedFilters = React.useCallback(() => {
    setAdvanced({ ...localAdvanced });
    setPage(1);
  }, [localAdvanced]);

  const saveCurrentView = () => {
    const name = window.prompt("اسم العرض المحفوظ");
    if (!name?.trim()) return;
    const next = [...savedViews.filter((view) => view.name !== name.trim()), { name: name.trim(), url: window.location.href }];
    setSavedViews(next);
    localStorage.setItem("admin-user-views", JSON.stringify(next));
    toast.success("تم حفظ العرض");
  };

  const clearAllFilters = () => {
    setSearch("");
    setQuerySearch("");
    setRole("all");
    setStatus("all");
    setLocalAdvanced({ ...DEFAULT_ADVANCED });
    setAdvanced({ ...DEFAULT_ADVANCED });
    setPage(1);
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "users", page, limit, querySearch, role, status, sortBy, sortOrder, advanced],
    queryFn: async () => {
      return adminUsersApi.list({
        page,
        limit,
        search: querySearch,
        role: role === "all" ? undefined : role as UserRole,
        status: status === "all" ? undefined : status as UserStatus,
        sortBy: sortBy as "name" | "createdAt" | "lastLogin" | "totalXP" | "status",
        sortOrder: sortOrder as "asc" | "desc",
        emailVerified: advanced.emailVerified === "all" ? undefined : advanced.emailVerified === "true",
        phoneVerified: advanced.phoneVerified === "all" ? undefined : advanced.phoneVerified === "true",
        twoFactorEnabled: advanced.twoFactorEnabled === "all" ? undefined : advanced.twoFactorEnabled === "true",
        country: advanced.country || undefined,
        gradeLevel: advanced.gradeLevel || undefined,
        subscriptionStatus: advanced.subscriptionStatus === "all" ? undefined : advanced.subscriptionStatus,
        createdFrom: advanced.createdFrom || undefined,
        createdTo: advanced.createdTo || undefined,
        lastLoginTo: advanced.lastLoginTo || undefined,
        lastLoginFrom: advanced.lastLoginFrom || undefined,
        subscriptionExpiresTo: advanced.subscriptionExpiresTo || undefined,
        includeDeleted: advanced.includeDeleted || undefined,
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
    queryClient.setQueryData<AdminUsersPageData>(["admin", "users", page, limit, querySearch, role, status, sortBy, sortOrder, advanced], (old) => old ? {
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
      const results = await Promise.allSettled(allowed.map((target) => adminUsersApi.remove(target.id)));
      const deletedCount = results.filter((result) => result.status === "fulfilled").length;
      const failedCount = results.length - deletedCount;
      if (deletedCount) toast.success(`تم حذف ${deletedCount} مستخدم بنجاح`);
      if (blockedCount) toast.warning(`تم استبعاد ${blockedCount} حساب محمي`);
      if (failedCount) toast.error(`فشل حذف ${failedCount} مستخدم`);
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
      const res = await adminFetch(apiRoutes.admin.impersonate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: impersonateDialog.user.id }),
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
    // Cancel any previous export
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
        emailVerified: advanced.emailVerified === "all" ? undefined : advanced.emailVerified === "true",
        phoneVerified: advanced.phoneVerified === "all" ? undefined : advanced.phoneVerified === "true",
        twoFactorEnabled: advanced.twoFactorEnabled === "all" ? undefined : advanced.twoFactorEnabled === "true",
        country: advanced.country || undefined,
        gradeLevel: advanced.gradeLevel || undefined,
        subscriptionStatus: advanced.subscriptionStatus === "all" ? undefined : advanced.subscriptionStatus,
        createdFrom: advanced.createdFrom || undefined,
        createdTo: advanced.createdTo || undefined,
        lastLoginTo: advanced.lastLoginTo || undefined,
        lastLoginFrom: advanced.lastLoginFrom || undefined,
        subscriptionExpiresTo: advanced.subscriptionExpiresTo || undefined,
        includeDeleted: advanced.includeDeleted || undefined,
      });

      // Check if aborted
      if (abortController.signal.aborted) return;

      const remaining: AdminUsersPageData[] = [];
      // Keep export responsive without flooding the API on large installations.
      for (let startPage = 2; startPage <= first.pagination.totalPages; startPage += 4) {
        // Check if aborted before each batch
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
            emailVerified: advanced.emailVerified === "all" ? undefined : advanced.emailVerified === "true",
            phoneVerified: advanced.phoneVerified === "all" ? undefined : advanced.phoneVerified === "true",
            twoFactorEnabled: advanced.twoFactorEnabled === "all" ? undefined : advanced.twoFactorEnabled === "true",
            country: advanced.country || undefined,
            gradeLevel: advanced.gradeLevel || undefined,
            subscriptionStatus: advanced.subscriptionStatus === "all" ? undefined : advanced.subscriptionStatus,
            createdFrom: advanced.createdFrom || undefined,
            createdTo: advanced.createdTo || undefined,
            lastLoginTo: advanced.lastLoginTo || undefined,
            lastLoginFrom: advanced.lastLoginFrom || undefined,
            subscriptionExpiresTo: advanced.subscriptionExpiresTo || undefined,
            includeDeleted: advanced.includeDeleted || undefined,
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

      <Tabs
        value={role}
        onValueChange={(val) => {
          setRole(val);
          setPage(1);
        }}
        className="w-full"
      >
        <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/10 h-12 flex gap-1 mb-6 w-full max-w-full justify-start overflow-x-auto sm:w-fit">
          <TabsTrigger value="all" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">
            كل المستخدمين
          </TabsTrigger>
          <TabsTrigger value="STUDENT" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">
            الطلاب
          </TabsTrigger>
          <TabsTrigger value="TEACHER" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">
            المعلمون
          </TabsTrigger>
          <TabsTrigger value="MODERATOR" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">
            المشرفون
          </TabsTrigger>
          <TabsTrigger value="ADMIN" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">
            المدراء
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Tabs
        value={status}
        onValueChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        className="w-full"
      >
        <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/10 h-12 flex gap-1 mb-6 w-full max-w-full justify-start overflow-x-auto sm:w-fit">
          <TabsTrigger value="all" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">
            كل الحالات
          </TabsTrigger>
          <TabsTrigger value="ACTIVE" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
            نشط
          </TabsTrigger>
          <TabsTrigger value="SUSPENDED" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-yellow-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
            موقوف
          </TabsTrigger>
          <TabsTrigger value="BANNED" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
            محظور
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="admin-glass flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 p-4">
        <label className="min-w-40 flex-1 text-xs font-bold">الفرز
          <select className="mt-1 h-10 w-full rounded-xl border bg-background px-3" value={`${sortBy}:${sortOrder}`} onChange={(e) => { const [field, order] = e.target.value.split(":"); setSortBy(field!); setSortOrder(order!); setPage(1); }}>
            <option value="createdAt:desc">الأحدث تسجيلًا</option><option value="createdAt:asc">الأقدم تسجيلًا</option><option value="name:asc">الاسم تصاعديًا</option><option value="name:desc">الاسم تنازليًا</option><option value="lastLogin:desc">آخر دخول</option><option value="totalXP:desc">الأعلى XP</option><option value="status:asc">الحالة</option>
          </select>
        </label>
        {(["emailVerified", "phoneVerified", "twoFactorEnabled"] as const).map((key) => <label key={key} className="min-w-36 text-xs font-bold">{key === "emailVerified" ? "توثيق البريد" : key === "phoneVerified" ? "توثيق الهاتف" : "2FA"}<select className="mt-1 h-10 w-full rounded-xl border bg-background px-3" value={localAdvanced[key]} onChange={(e) => { setLocalAdvanced((old) => ({ ...old, [key]: e.target.value })); }}><option value="all">الكل</option><option value="true">مفعّل</option><option value="false">غير مفعّل</option></select></label>)}
        <label className="min-w-36 text-xs font-bold">الدولة<Input className="mt-1" value={localAdvanced.country} onChange={(e) => { setLocalAdvanced((old) => ({ ...old, country: e.target.value })); }} /></label>
        <label className="min-w-36 text-xs font-bold">المرحلة<Input className="mt-1" value={localAdvanced.gradeLevel} onChange={(e) => { setLocalAdvanced((old) => ({ ...old, gradeLevel: e.target.value })); }} /></label>
        <label className="min-w-36 text-xs font-bold">التسجيل من<Input type="date" className="mt-1" value={localAdvanced.createdFrom} onChange={(e) => { setLocalAdvanced((old) => ({ ...old, createdFrom: e.target.value })); }} /></label>
        <label className="min-w-36 text-xs font-bold">التسجيل إلى<Input type="date" className="mt-1" value={localAdvanced.createdTo} onChange={(e) => { setLocalAdvanced((old) => ({ ...old, createdTo: e.target.value })); }} /></label>
        <label className="min-w-36 text-xs font-bold">آخر دخول من<Input type="date" className="mt-1" value={localAdvanced.lastLoginFrom} onChange={(e) => { setLocalAdvanced((old) => ({ ...old, lastLoginFrom: e.target.value })); }} /></label>
        <label className="min-w-36 text-xs font-bold">آخر دخول إلى<Input type="date" className="mt-1" value={localAdvanced.lastLoginTo} onChange={(e) => { setLocalAdvanced((old) => ({ ...old, lastLoginTo: e.target.value })); }} /></label>
        <label className="min-w-36 text-xs font-bold">الاشتراك<select className="mt-1 h-10 w-full rounded-xl border bg-background px-3" value={localAdvanced.subscriptionStatus} onChange={(e) => { setLocalAdvanced((old) => ({ ...old, subscriptionStatus: e.target.value })); }}><option value="all">الكل</option><option value="ACTIVE">نشط</option><option value="EXPIRED">منتهي</option><option value="NONE">بدون اشتراك</option></select></label>
        <label className="min-w-36 text-xs font-bold">انتهاء الاشتراك إلى<Input type="date" className="mt-1" value={localAdvanced.subscriptionExpiresTo} onChange={(e) => { setLocalAdvanced((old) => ({ ...old, subscriptionExpiresTo: e.target.value })); }} /></label>
        <label className="flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-bold"><Checkbox checked={localAdvanced.includeDeleted} onCheckedChange={(checked) => { setLocalAdvanced((old) => ({ ...old, includeDeleted: !!checked })); }} />المحذوفون والمؤرشفون</label>
        <div className="flex w-full flex-wrap gap-2 border-t pt-3">
          <Button size="sm" variant="outline" onClick={() => { setLocalAdvanced((old) => ({ ...old, lastLoginTo: new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10) })); }}>غير نشطين منذ 90 يومًا</Button>
          <Button size="sm" variant="outline" onClick={() => { setLocalAdvanced((old) => ({ ...old, emailVerified: "false" })); }}>بريد غير موثق</Button>
          <Button size="sm" variant="outline" onClick={() => { setLocalAdvanced((old) => ({ ...old, twoFactorEnabled: "false" })); }}>بدون 2FA</Button>
          <Button size="sm" variant="ghost" onClick={clearAllFilters}>مسح الفلاتر</Button>
          <Button size="sm" variant="outline" onClick={saveCurrentView}>حفظ العرض الحالي</Button>
          {savedViews.length > 0 && <select className="h-9 rounded-lg border bg-background px-3 text-xs" defaultValue="" onChange={(e) => { if (e.target.value) window.location.href = e.target.value; }}><option value="" disabled>العروض المحفوظة</option>{savedViews.map((view) => <option key={view.name} value={view.url}>{view.name}</option>)}</select>}
        </div>
        {/* Apply Filters Button - only shown when local differs from applied */}
        <div className="flex w-full justify-end gap-2 pt-2 border-t border-white/5">
          <Button
            size="sm"
            variant="default"
            onClick={applyAdvancedFilters}
            className="bg-primary hover:bg-primary/90 gap-2"
          >
            <Filter className="h-4 w-4" />
            تطبيق الفلاتر
          </Button>
        </div>
      </div>

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

      <div
        className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl"
      >
        <AdminDataTable
          columns={columns}
          data={data?.users || []}
          loading={isLoading}
          serverSide
          selectable
          virtualized
          bulkActions={[
            {
              label: "إرسال رسالة جماعية",
              icon: Send,
              onClick: (rows) => setMessageDialog({ open: true, users: rows })
            },
            {
              label: "تعليق الحسابات",
              icon: Shield,
              variant: "outline",
              disabled: !canManageUsers,
              onClick: (rows) => void runBulkUpdate(rows, { status: UserStatus.SUSPENDED }),
            },
            {
              label: "تفعيل الحسابات",
              icon: Zap,
              variant: "outline",
              disabled: !canManageUsers,
              onClick: (rows) => void runBulkUpdate(rows, { status: UserStatus.ACTIVE }),
            },
            {
              label: "تحويل إلى طلاب",
              icon: Users,
              variant: "outline",
              disabled: !canManageUsers,
              onClick: (rows) => void runBulkUpdate(rows, { role: UserRole.STUDENT }),
            },
            {
              label: "تصدير المحدد",
              icon: Download,
              variant: "outline",
              onClick: (rows) => {
                const columns: ExportColumn<AdminUserListItem>[] = [
                  { header: "الاسم", accessor: (item) => item.name || item.username || "بدون اسم" },
                  { header: "البريد", accessor: "email" },
                  { header: "الدور", accessor: "role" },
                  { header: "الحالة", accessor: "status" },
                  { header: "XP", accessor: "totalXP" },
                ];
                exportToCSV(rows, columns, "selected-users");
              },
            },
            {
              label: "حذف السجلات",
              icon: UserPlus,
              variant: "destructive",
              disabled: !canManageUsers,
              onClick: (rows) => setDeleteDialog({ open: true, ids: rows.map((item) => item.id) })
            },
          ]}
          totalRows={data?.pagination?.total || 0}
          pageCount={data?.pagination?.totalPages || 1}
          currentPage={page}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
          pageSize={limit}
          actions={{
            onRefresh: () => refetch(),
          }}
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
          let successCount = 0;
          let errorCount = 0;
          for (const row of rows) {
            try {
              const response = await adminFetch(apiRoutes.admin.users, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: row.email,
                  name: row.name,
                  username: row.username || undefined,
                  password: row.password,
                  role: row.role || "STUDENT",
                }),
              });
              if (response.ok) {
                successCount++;
              } else {
                errorCount++;
              }
            } catch {
              errorCount++;
            }
          }
          if (successCount > 0) {
            toast.success(`تم استيراد ${successCount} مستخدم بنجاح`);
            refetch();
          }
          if (errorCount > 0) {
            toast.warning(`فشل في استيراد ${errorCount} مستخدم`);
          }
        }}
      />
    </div>
  );
}