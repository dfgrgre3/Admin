"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable, RowActions } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { RoleBadge, StatusBadge } from "@/components/admin/ui/admin-badge";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Download, Mail, Shield, Users, Search, Send, RefreshCw, Link2, UserMinus } from "lucide-react";
import { useExport, ExportColumn } from '@/lib/export-utils';
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import dynamic from "next/dynamic";
import { Checkbox } from "@/components/ui/checkbox";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminParentsApi, type ParentListItem, type ParentsPage, type ParentStatistics } from "@/lib/api/admin-parents-api";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserStatus } from "@/types/enums";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { getUserActionBlockReason } from "@/lib/user-action-guards";
import { useAdaptiveDebounce } from "@/hooks/use-adaptive-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { logger } from '@/lib/logger';

const MessageModal = dynamic(() => import("@/components/admin/broadcast/broadcast-modal").then(mod => ({ default: mod.BroadcastModal })), {
  ssr: false,
  loading: () => null,
});

export default function AdminParentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user: currentUser, hasPermission } = usePermission();
  const canManageParents = hasPermission(PERMISSIONS.PARENTS_MANAGE);
  const [page, setPage] = React.useState(() => Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = React.useState(() => Number(searchParams.get("limit")) || 10);
  const [search, setSearch] = React.useState(() => searchParams.get("search") || "");
  const [querySearch, setQuerySearch] = React.useState(() => searchParams.get("search") || "");
  const [status, setStatus] = React.useState<string>(() => searchParams.get("status") || "all");
  const [sortBy, setSortBy] = React.useState(() => searchParams.get("sortBy") || "createdAt");
  const [sortOrder, setSortOrder] = React.useState(() => searchParams.get("sortOrder") || "desc");
  const [country, setCountry] = React.useState<string>(() => searchParams.get("country") || "all");
  const [minStudents, setMinStudents] = React.useState<string>(() => searchParams.get("minStudents") || "");
  const [maxStudents, setMaxStudents] = React.useState<string>(() => searchParams.get("maxStudents") || "");

  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; ids: string[] }>({
    open: false,
    ids: [],
  });
  const [messageDialog, setMessageDialog] = React.useState<{ open: boolean; parents: ParentListItem[] }>({
    open: false,
    parents: [],
  });
  const [linkStudentDialog, setLinkStudentDialog] = React.useState<{ open: boolean; parentId: string | null }>({
    open: false,
    parentId: null,
  });
  const [exporting, setExporting] = React.useState(false);
  const { debouncedCallback: updateQuerySearch } = useAdaptiveDebounce(
    (value: unknown) => setQuerySearch(String(value)),
    { minDelay: 300, maxDelay: 500, initialDelay: 350 },
  );
  const { exportToCSV } = useExport();

  const exportAbortControllerRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    return () => {
      if (exportAbortControllerRef.current) {
        exportAbortControllerRef.current.abort();
        exportAbortControllerRef.current = null;
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
      status,
      sortBy,
      sortOrder,
      country,
      minStudents,
      maxStudents,
    };
    Object.entries(values).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "false") params.set(key, value);
    });
    const url = `/admin/parents?${params.toString()}`;
    if (typeof window !== "undefined") {
      window.history.replaceState(window.history.state, "", url);
    }
  }, [page, limit, querySearch, status, sortBy, sortOrder, country, minStudents, maxStudents]);

  const clearAllFilters = () => {
    setSearch("");
    setQuerySearch("");
    setStatus("all");
    setCountry("all");
    setMinStudents("");
    setMaxStudents("");
  };

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["admin", "parents", "statistics"],
    queryFn: () => adminParentsApi.getStatistics(),
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "parents", page, limit, querySearch, status, sortBy, sortOrder, country, minStudents, maxStudents],
    queryFn: async () => {
      return adminParentsApi.list({
        page,
        limit,
        search: querySearch,
        status: status === "all" ? undefined : status as UserStatus,
        sortBy: sortBy as "name" | "createdAt" | "lastLogin" | "linkedStudentsCount",
        sortOrder: sortOrder as "asc" | "desc",
        country: country === "all" ? undefined : country,
        minStudents: minStudents ? Number(minStudents) : undefined,
        maxStudents: maxStudents ? Number(maxStudents) : undefined,
      });
    },
    placeholderData: keepPreviousData,
    retry: 1,
  });

  const runBulkUpdate = async (rows: ParentListItem[], changes: Partial<Pick<ParentListItem, "role" | "status">>) => {
    const allowed = rows.filter((target) => !getUserActionBlockReason(currentUser, target, "suspend"));
    if (!allowed.length) return toast.error("لا توجد حسابات مسموح بتعديلها");
    const results = await adminParentsApi.updateMany(allowed.map((item) => item.id), changes);
    const successIds = new Set(allowed.filter((_, index) => results[index]?.status === "fulfilled").map((item) => item.id));
    queryClient.setQueryData<ParentsPage>(["admin", "parents", page, limit, querySearch, status, sortBy, sortOrder, country, minStudents, maxStudents], (old) => old ? {
      ...old,
      parents: old.parents.map((item) => successIds.has(item.id) ? { ...item, ...changes } : item),
    } : old);
    toast.success(`تم تحديث ${successIds.size} ولي أمر`);
    if (successIds.size < allowed.length) toast.error(`فشل تحديث ${allowed.length - successIds.size} ولي أمر`);
  };

  const handleDelete = async () => {
    if (!deleteDialog.ids.length) return;
    try {
      if (!canManageParents) throw new Error("غير مصرح بتنفيذ الإجراء");
      const targets = (data?.parents || []).filter((item) => deleteDialog.ids.includes(item.id));
      const allowed = targets.filter((target) => !getUserActionBlockReason(currentUser, target, "delete"));
      const blockedCount = targets.length - allowed.length;
      const result = await adminParentsApi.bulkRemove(allowed.map((target) => target.id));
      if (result.deleted) toast.success(`تم حذف ${result.deleted} ولي أمر بنجاح`);
      if (blockedCount) toast.warning(`تم استبعاد ${blockedCount} حساب محمي`);
      if (result.failed) toast.error(`فشل حذف ${result.failed} ولي أمر`);
      await refetch();
    } catch (err: unknown) {
      toast.error("خطأ في الاتصال بالخادم");
      console.error(err instanceof Error ? err.message : String(err));
    } finally {
      setDeleteDialog({ open: false, ids: [] });
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
      const first = await adminParentsApi.list({
        page: 1,
        limit: 200,
        search: querySearch,
        status: status === "all" ? undefined : status as UserStatus,
        sortBy: sortBy as "name" | "createdAt" | "lastLogin" | "linkedStudentsCount",
        sortOrder: sortOrder as "asc" | "desc",
        country: country === "all" ? undefined : country,
        minStudents: minStudents ? Number(minStudents) : undefined,
        maxStudents: maxStudents ? Number(maxStudents) : undefined,
      });

      if (abortController.signal.aborted) return;

      const remaining: ParentsPage[] = [];
      for (let startPage = 2; startPage <= first.pagination.totalPages; startPage += 4) {
        if (abortController.signal.aborted) return;

        const batch = await Promise.all(
          Array.from({ length: Math.min(4, first.pagination.totalPages - startPage + 1) }, (_, index) =>
            adminParentsApi.list({
              page: startPage + index,
              limit: 200,
              search: querySearch,
              status: status === "all" ? undefined : status as UserStatus,
              sortBy: sortBy as "name" | "createdAt" | "lastLogin" | "linkedStudentsCount",
              sortOrder: sortOrder as "asc" | "desc",
              country: country === "all" ? undefined : country,
              minStudents: minStudents ? Number(minStudents) : undefined,
              maxStudents: maxStudents ? Number(maxStudents) : undefined,
            })
          ),
        );
        remaining.push(...batch);
      }
      const parents = [first, ...remaining].flatMap((result) => result.parents);
      if (!parents.length) {
        toast.error('لا توجد بيانات للتصدير');
        return;
      }
      const exportColumns: ExportColumn<ParentListItem>[] = [
        { header: 'الاسم', accessor: (p) => p.name || p.username || "بدون اسم" },
        { header: 'البريد الإلكتروني', accessor: 'email' },
        { header: 'الهاتف', accessor: (p) => p.phone || 'غير مسجل' },
        { header: 'الدولة', accessor: (p) => p.country || 'غير محدد' },
        { header: 'عدد الطلاب المرتبطين', accessor: 'linkedStudentsCount' },
        { header: 'الحالة', accessor: 'status' },
        { header: 'تاريخ الانضمام', accessor: (p) => new Date(p.createdAt).toLocaleDateString('ar-EG') },
        { header: 'آخر دخول', accessor: (p) => p.lastLogin ? new Date(p.lastLogin).toLocaleDateString('ar-EG') : 'لم يسجل دخول' },
      ];
      exportToCSV(parents, exportColumns, 'parents');
      toast.success(`تم تصدير ${parents.length} ولي أمر بنجاح`);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        toast.info("تم إلغاء عملية التصدير");
        return;
      }
      logger.error("فشل تصدير CSV", err);
      toast.error("فشل تصدير بيانات أولياء الأمور");
    } finally {
      setExporting(false);
      exportAbortControllerRef.current = null;
    }
  };

  const columns: ColumnDef<ParentListItem>[] = [
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
      header: "ولي الأمر",
      cell: ({ row }) => {
        const parent = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={parent.avatar || ""} />
              <AvatarFallback className="font-bold bg-primary/10 text-primary">
                {parent.name?.charAt(0) || "P"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-black text-sm tracking-tight">{parent.name || parent.username || "بدون اسم"}</p>
              <p className="text-[10px] text-muted-foreground font-bold opacity-60 italic">{parent.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "linkedStudentsCount",
      header: "الطلاب المرتبطين",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="font-black">{row.original.linkedStudentsCount || 0}</span>
        </div>
      ),
    },
    {
      accessorKey: "country",
      header: "الدولة",
      cell: ({ row }) => (
        <span className="text-sm font-bold">{row.original.country || "غير محدد"}</span>
      ),
    },
    {
      accessorKey: "activeSubscription",
      header: "الاشتراك",
      cell: ({ row }) => (
        <StatusBadge status={row.original.activeSubscription ? "active" : "inactive"} />
      ),
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => <StatusBadge status={row.original.status === UserStatus.ACTIVE ? "active" : row.original.status === UserStatus.INACTIVE || row.original.status === UserStatus.DELETED ? "inactive" : "suspended"} />,
    },
    {
      id: "verification",
      header: "التوثيق",
      cell: ({ row }) => <div className="flex flex-wrap gap-1">
        <StatusBadge status={row.original.emailVerified ? "verified" : "unverified"} />
        <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${row.original.phoneVerified ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>الهاتف</span>
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
      cell: ({ row }) => {
        const deleteBlock = getUserActionBlockReason(currentUser, row.original, "delete");
        return (
          <RowActions
            row={row.original}
            onView={(p) => router.push(`/admin/parents/${p.id}`)}
            onEdit={canManageParents ? (p) => router.push(`/admin/parents/${p.id}/edit`) : undefined}
            onDelete={canManageParents && !deleteBlock ? (p) => setDeleteDialog({ open: true, ids: [p.id] }) : undefined}
            extraActions={[
              { icon: Mail, label: "إرسال رسالة", onClick: (p) => setMessageDialog({ open: true, parents: [p] }) },
              { icon: Link2, label: "ربط طالب", onClick: (p) => setLinkStudentDialog({ open: true, parentId: p.id }) },
            ]}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader
        title="إدارة أولياء الأمور 👨‍👩‍👧‍👦"
        description="إدارة حسابات أولياء الأمور، ربطهم بالطلاب، ومتابعة نشاطهم داخل النظام التعليمي."
      >
        <div className="flex flex-wrap items-center gap-3">
          <AdminButton variant="outline" icon={Download} onClick={handleExportCSV} loading={exporting} className="rounded-2xl border-white/10">
            تصدير البيانات CSV
          </AdminButton>
          <AdminButton variant="premium" icon={UserPlus} onClick={() => router.push("/admin/parents/create")} className="rounded-2xl shadow-xl">
            إضافة ولي أمر جديد
          </AdminButton>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <AdminStatsCard
          title="إجمالي أولياء الأمور"
          value={statsData?.totalParents || 0}
          icon={Users}
          color="blue"
          description="ولي أمر في المنصة"
        />
        <AdminStatsCard
          title="أولياء أمور نشطين"
          value={statsData?.activeParents || 0}
          icon={Shield}
          color="green"
          description="حساب نشط"
        />
        <AdminStatsCard
          title="أولياء أمور موقوفين"
          value={statsData?.suspendedParents || 0}
          icon={Shield}
          color="yellow"
          description="حساب موقوف"
        />
        <AdminStatsCard
          title="متصلين الآن"
          value={statsData?.onlineParents || 0}
          icon={Users}
          color="purple"
          description="متصل في آخر 15 دقيقة"
        />
      </div>

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
            <RefreshCw className="h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="font-bold">تعذر تحميل أولياء الأمور</p>
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
          data={data?.parents || []}
          loading={isLoading}
          serverSide
          selectable
          virtualized
          bulkActions={[
            { label: "إرسال رسالة جماعية", icon: Send, onClick: (rows) => setMessageDialog({ open: true, parents: rows }) },
            { label: "تعليق الحسابات", icon: Shield, variant: "outline", disabled: !canManageParents, onClick: (rows) => void runBulkUpdate(rows, { status: UserStatus.SUSPENDED }) },
            { label: "تفعيل الحسابات", icon: Shield, variant: "outline", disabled: !canManageParents, onClick: (rows) => void runBulkUpdate(rows, { status: UserStatus.ACTIVE }) },
            { label: "تصدير المحدد", icon: Download, variant: "outline", onClick: (rows) => { exportToCSV(rows, [{ header: "الاسم", accessor: (item) => item.name || item.username || "بدون اسم" }, { header: "البريد", accessor: "email" }, { header: "الحالة", accessor: "status" }, { header: "الطلاب", accessor: "linkedStudentsCount" }], "selected-parents"); } },
            { label: "حذف السجلات", icon: UserMinus, variant: "destructive", disabled: !canManageParents, onClick: (rows) => setDeleteDialog({ open: true, ids: rows.map((item) => item.id) }) },
          ]}
          totalRows={data?.pagination?.total || 0}
          pageCount={data?.pagination?.totalPages || 1}
          currentPage={page}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
          pageSize={limit}
          actions={{ onRefresh: () => refetch() }}
          toolbar={
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative group w-full sm:w-auto">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <input
                  type="text"
                  placeholder="بحث بالاسم، البريد، الهاتف..."
                  aria-label="بحث في أولياء الأمور"
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
              <Input
                type="number"
                placeholder="أقل عدد طلاب"
                className="bg-accent/10 border border-border rounded-xl h-10 w-32 text-sm"
                value={minStudents}
                onChange={(e) => { setMinStudents(e.target.value); setPage(1); }}
              />
              <Input
                type="number"
                placeholder="أكثر عدد طلاب"
                className="bg-accent/10 border border-border rounded-xl h-10 w-32 text-sm"
                value={maxStudents}
                onChange={(e) => { setMaxStudents(e.target.value); setPage(1); }}
              />
            </div>
          }
        />
      </div>

      <AdminConfirm
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, ids: [] })}
        title={deleteDialog.ids.length > 1 ? `حذف ${deleteDialog.ids.length} ولي أمر؟` : "حذف حساب ولي أمر؟"}
        description="سيتم حذف الحسابات المحددة، مع استبعاد حسابك الحالي وأي حساب أعلى من صلاحيتك. لا يمكن التراجع عن العملية."
        confirmText="تأكيد الحذف النهائي"
        variant="destructive"
        onConfirm={handleDelete}
      />
      <MessageModal
        open={messageDialog.open}
        onOpenChange={(open) => setMessageDialog({ open, parents: open ? messageDialog.parents : [] })}
        users={messageDialog.parents}
      />
    </div>
  );
}
