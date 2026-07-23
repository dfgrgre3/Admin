"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable, RowActions } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  UserPlus,
  Download,
  Mail,
  Shield,
  Users,
  Star,
  Search,
  Send,
  Eye,
  AlertTriangle,
  RefreshCw,
  Calendar,
  MapPin,
  GraduationCap,
  Clock,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import { Checkbox } from "@/components/ui/checkbox";
import { keepPreviousData } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { logger } from '@/lib/logger';
import {
  useInstructors,
  useInstructorStatistics,
  useApproveInstructor,
  useRejectInstructor,
  useBulkDeleteInstructors,
  useExportInstructors,
  instructorKeys,
} from '@/hooks/use-instructors';
import type { Instructor } from '@/lib/api/instructors-api';

export default function AdminInstructorsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser, hasPermission } = usePermission();
  const canManageInstructors = hasPermission(PERMISSIONS.USERS_MANAGE);

  const [page, setPage] = React.useState(() => Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = React.useState(() => Number(searchParams.get("limit")) || 10);
  const [search, setSearch] = React.useState(() => searchParams.get("search") || "");
  const [querySearch, setQuerySearch] = React.useState(() => searchParams.get("search") || "");
  const [status, setStatus] = React.useState<string>(() => searchParams.get("status") || "all");
  const [sortBy, setSortBy] = React.useState(() => searchParams.get("sortBy") || "createdAt");
  const [sortOrder, setSortOrder] = React.useState<"desc" | "asc">(() => (searchParams.get("sortOrder") === "asc" ? "asc" : "desc"));

  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; ids: string[] }>({
    open: false,
    ids: [],
  });
  const [exporting, setExporting] = React.useState(false);
  const [selectedInstructor, setSelectedInstructor] = React.useState<Instructor | null>(null);

  const [debouncedSearch, setDebouncedSearch] = React.useState(querySearch);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(querySearch), 350);
    return () => clearTimeout(timer);
  }, [querySearch]);

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
    };
    Object.entries(values).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "false") params.set(key, value);
    });
    const url = `/admin/instructors?${params.toString()}`;
    if (typeof window !== "undefined") {
      window.history.replaceState(window.history.state, "", url);
    }
  }, [page, limit, querySearch, status, sortBy, sortOrder]);

  // Use React Query hooks
  const { data, isLoading, isError, error, refetch } = useInstructors({
    page,
    limit,
    search: debouncedSearch,
    status,
    sortBy,
    sortOrder,
  });

  const { data: statistics } = useInstructorStatistics();

  const approveMutation = useApproveInstructor();
  const rejectMutation = useRejectInstructor();
  const bulkDeleteMutation = useBulkDeleteInstructors();
  const exportMutation = useExportInstructors();

  const handleViewInstructor = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
  };

  const handleDelete = async () => {
    if (!deleteDialog.ids.length) return;
    try {
      if (!canManageInstructors) throw new Error("غير مصرح بتنفيذ الإجراء");
      await bulkDeleteMutation.mutateAsync(deleteDialog.ids);
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
      await exportMutation.mutateAsync({ status, search: querySearch });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        toast.info("تم إلغاء عملية التصدير");
        return;
      }
      toast.error("فشل تصدير البيانات");
    } finally {
      setExporting(false);
      exportAbortControllerRef.current = null;
    }
  };

  const columns: ColumnDef<Instructor>[] = [
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
      header: "المدرّس",
      cell: ({ row }) => {
        const instructor = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={instructor.avatar || ""} />
              <AvatarFallback className="font-bold bg-primary/10 text-primary">
                {instructor.name?.charAt(0) || "I"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-black text-sm tracking-tight">{instructor.name || instructor.username || "بدون اسم"}</p>
              <p className="text-[10px] text-muted-foreground font-bold opacity-60 italic">{instructor.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "specialties",
      header: "التخصصات",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.specialties.slice(0, 2).map((spec, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">{spec}</Badge>
          ))}
          {row.original.specialties.length > 2 && (
            <Badge variant="secondary" className="text-xs">+{row.original.specialties.length - 2}</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "commissionRate",
      header: "العمولة",
      cell: ({ row }) => (
        <span className="font-bold text-primary">{row.original.commissionRate}%</span>
      ),
    },
    {
      accessorKey: "rating",
      header: "التقييم",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          <span className="font-bold">{row.original.rating.toFixed(1)}</span>
        </div>
      ),
    },
    {
      accessorKey: "totalStudents",
      header: "الطلاب",
      cell: ({ row }) => (
        <span className="font-bold">{row.original.totalStudents.toLocaleString()}</span>
      ),
    },
    {
      accessorKey: "totalRevenue",
      header: "الإيرادات",
      cell: ({ row }) => (
        <span className="font-bold text-green-500">{row.original.totalRevenue.toLocaleString()} ر.س</span>
      ),
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => {
        const statusConfig: Record<string, { label: string; variant: any }> = {
          PENDING: { label: "قيد الانتظار", variant: "secondary" },
          UNDER_REVIEW: { label: "قيد المراجعة", variant: "default" },
          APPROVED: { label: "موافق عليه", variant: "default" },
          REJECTED: { label: "مرفوض", variant: "destructive" },
          SUSPENDED: { label: "موقوف", variant: "outline" },
        };
        const config = statusConfig[row.original.status] || statusConfig.PENDING;
        if (!config) {
          return <Badge variant="secondary">قيد الانتظار</Badge>;
        }
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "تاريخ الانضمام",
      cell: ({ row }) => (
        <span className="text-sm font-bold">{new Date(row.original.createdAt).toLocaleDateString("ar-EG")}</span>
      ),
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => (
        <RowActions
          row={row.original}
          onView={(i) => handleViewInstructor(i)}
          onEdit={canManageInstructors ? (i) => router.push(`/admin/instructors/${i.id}/edit`) : undefined}
          onDelete={canManageInstructors ? (i) => setDeleteDialog({ open: true, ids: [i.id] }) : undefined}
          extraActions={[
            { icon: Eye, label: "مراجعة المستندات", onClick: (i) => router.push(`/admin/instructors/${i.id}/documents`) },
            { icon: FileText, label: "العقد", onClick: (i) => router.push(`/admin/instructors/${i.id}/contract`) },
            { icon: CreditCard, label: "المدفوعات", onClick: (i) => router.push(`/admin/instructors/${i.id}/payouts`) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader
        title="إدارة المدرّسين 👨‍🏫"
        description="إدارة جميع المدرّسين، طلبات الانضمام، المستندات، العقود، والمدفوعات."
      >
        <div className="flex flex-wrap items-center gap-3">
          <AdminButton variant="outline" icon={Download} onClick={handleExportCSV} loading={exporting} className="rounded-2xl border-white/10">
            تصدير البيانات CSV
          </AdminButton>
          <AdminButton variant="premium" icon={UserPlus} onClick={() => router.push("/admin/instructors/create")} className="rounded-2xl shadow-xl">
            إضافة مدرّس جديد
          </AdminButton>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminStatsCard
          title="إجمالي المدرّسين"
          value={statistics?.total || data?.pagination?.total || 0}
          icon={Users}
          color="blue"
          description="مدرّس في المنصة"
        />
        <AdminStatsCard
          title="طلبات انضمام جديدة"
          value={statistics?.pending || 0}
          icon={UserPlus}
          color="yellow"
          description="بانتظار المراجعة"
        />
        <AdminStatsCard
          title="موافق عليهم"
          value={statistics?.approved || 0}
          icon={CheckCircle}
          color="green"
          description="مدرّس نشط"
        />
      </div>

      <Tabs value={status} onValueChange={(val) => { setStatus(val); setPage(1); }} className="w-full">
        <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/10 h-12 flex gap-1 mb-6 w-full max-w-full justify-start overflow-x-auto sm:w-fit">
          <TabsTrigger value="all" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">الكل</TabsTrigger>
          <TabsTrigger value="PENDING" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-yellow-500 data-[state=active]:text-white data-[state=active]:shadow-lg">قيد الانتظار</TabsTrigger>
          <TabsTrigger value="UNDER_REVIEW" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg">قيد المراجعة</TabsTrigger>
          <TabsTrigger value="APPROVED" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg">موافق عليه</TabsTrigger>
          <TabsTrigger value="REJECTED" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg">مرفوض</TabsTrigger>
          <TabsTrigger value="SUSPENDED" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-gray-500 data-[state=active]:text-white data-[state=active]:shadow-lg">موقوف</TabsTrigger>
        </TabsList>
      </Tabs>

      {isError && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="font-bold">تعذر تحميل المدرّسين</p>
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
          data={data?.instructors || []}
          loading={isLoading}
          serverSide
          selectable
          bulkActions={[
            { label: "إرسال إشعار", icon: Send, onClick: (rows) => toast.success(`إرسال إشعار لـ ${rows.length} مدرّس`) },
            { label: "اعتماد", icon: CheckCircle, variant: "outline", disabled: !canManageInstructors, onClick: async (rows) => {
              for (const row of rows) {
                await approveMutation.mutateAsync(row.id);
              }
              await refetch();
            }},
            { label: "رفض", icon: XCircle, variant: "outline", disabled: !canManageInstructors, onClick: async (rows) => {
              const reason = prompt("سبب الرفض:");
              if (reason) {
                for (const row of rows) {
                  await rejectMutation.mutateAsync({ id: row.id, reason });
                }
                await refetch();
              }
            }},
            { label: "حذف", icon: XCircle, variant: "destructive", disabled: !canManageInstructors, onClick: (rows) => setDeleteDialog({ open: true, ids: rows.map((item) => item.id) }) },
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
                  placeholder="بحث عن مدرّس..."
                  aria-label="بحث عن مدرّس"
                  className="bg-accent/10 border border-border rounded-xl h-10 px-10 text-sm focus:ring-1 ring-primary outline-none w-full sm:w-64 font-bold"
                  value={search}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearch(value);
                    setPage(1);
                    setQuerySearch(value.trim());
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
        title={deleteDialog.ids.length > 1 ? `حذف ${deleteDialog.ids.length} مدرّس؟` : "حذف مدرّس؟"}
        description="سيتم حذف المدرّسين المحددين. لا يمكن التراجع عن العملية."
        confirmText="تأكيد الحذف النهائي"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}