"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable, RowActions } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, GraduationCap, BookOpen, Star, Trash2, Edit, ShieldCheck, Clock, AlertCircle, CheckCircle2, XCircle, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "@/lib/api/routes";
import { adminFetch } from "@/lib/api/admin-api";
import { toast } from "sonner";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import { ColumnDef } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TeacherModel {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subjectId: string;
  onlineUrl: string | null;
  rating: number;
  notes: string | null;
  status?: string;
  country?: string;
  specialties?: string[];
  languages?: string[];
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  subject?: {
    name: string;
    nameAr: string | null;
    color: string | null;
  };
}

interface InstructorStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
  underReview: number;
}

interface ApiResponse {
  data?: {
    teachers: TeacherModel[];
    instructors?: TeacherModel[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  teachers?: TeacherModel[];
  instructors?: TeacherModel[];
  summary?: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    suspended: number;
    underReview: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminTeachersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [suspendDialog, setSuspendDialog] = React.useState<{ open: boolean; id: string | null; name: string }>({
    open: false,
    id: null,
    name: "",
  });
  const [activateDialog, setActivateDialog] = React.useState<{ open: boolean; id: string | null; name: string }>({
    open: false,
    id: null,
    name: "",
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "teachers", page, limit, search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(statusFilter && statusFilter !== "all" && { status: statusFilter }),
      });
      const response = await adminFetch(`${apiRoutes.admin.instructors}?${params}`);
      if (!response.ok) throw new Error("Failed to fetch teachers");
      return (await response.json()) as ApiResponse;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["admin", "instructor-statistics"],
    queryFn: async () => {
      const response = await adminFetch(apiRoutes.admin.instructorStatistics);
      if (!response.ok) throw new Error("Failed to fetch statistics");
      return (await response.json()) as InstructorStatistics;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await adminFetch(apiRoutes.admin.teachers, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Failed to delete teacher");
      return response.json();
    },
    onSuccess: () => {
      toast.success("تم حذف المعلم بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin", "teachers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "instructor-statistics"] });
      setDeleteDialog({ open: false, id: null });
    },
    onError: () => {
      toast.error("فشل في حذف المعلم");
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await adminFetch(apiRoutes.admin.instructorSuspend(id), {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to suspend teacher");
      return response.json();
    },
    onSuccess: () => {
      toast.success("تم إيقاف المعلم بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin", "teachers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "instructor-statistics"] });
      setSuspendDialog({ open: false, id: null, name: "" });
    },
    onError: () => {
      toast.error("فشل في إيقاف المعلم");
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await adminFetch(apiRoutes.admin.instructorApprove(id), {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to approve teacher");
      return response.json();
    },
    onSuccess: () => {
      toast.success("تم تفعيل المعلم بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin", "teachers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "instructor-statistics"] });
      setActivateDialog({ open: false, id: null, name: "" });
    },
    onError: () => {
      toast.error("فشل في تفعيل المعلم");
    },
  });

  const getStatusBadge = (status: string | undefined) => {
    const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
      APPROVED: { icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", label: "نشط" },
      ACTIVE: { icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", label: "نشط" },
      PENDING: { icon: Clock, color: "bg-amber-500/10 text-amber-500 border-amber-500/20", label: "قيد المراجعة" },
      UNDER_REVIEW: { icon: Clock, color: "bg-amber-500/10 text-amber-500 border-amber-500/20", label: "قيد المراجعة" },
      SUSPENDED: { icon: XCircle, color: "bg-red-500/10 text-red-500 border-red-500/20", label: "موقوف" },
      REJECTED: { icon: XCircle, color: "bg-red-500/10 text-red-500 border-red-500/20", label: "مرفوض" },
    };

    const config = statusConfig[status || ""] || statusConfig.PENDING;
    if (!config) return null;
    const Icon = config.icon;

    return (
      <Badge className={`gap-1.5 ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const columns: ColumnDef<TeacherModel>[] = [
    {
      accessorKey: "name",
      header: "المعلم",
      cell: ({ row }) => {
        const teacher = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={teacher.avatar || ""} />
              <AvatarFallback className="font-bold bg-primary/10 text-primary">
                {teacher.name?.charAt(0) || "T"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-black text-sm">{teacher.name}</p>
              <p className="text-[10px] text-muted-foreground">{teacher.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: "specialties",
      header: "التخصصات",
      cell: ({ row }) => {
        const specialties = row.original.specialties || [];
        return (
          <div className="flex flex-wrap gap-1">
            {specialties.slice(0, 2).map((spec, i) => (
              <Badge key={i} variant="outline" className="text-[10px]">
                {spec}
              </Badge>
            ))}
            {specialties.length > 2 && (
              <Badge variant="outline" className="text-[10px]">
                +{specialties.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "country",
      header: "الدولة",
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.country || "-"}</span>
      ),
    },
    {
      accessorKey: "rating",
      header: "التقييم",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          <span className="font-bold">{row.original.rating || 0}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "تاريخ الانضمام",
      cell: ({ row }) => (
        <span className="text-sm">
          {new Date(row.original.createdAt).toLocaleDateString("ar-EG")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const teacher = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <AdminButton variant="ghost" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
              </AdminButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={() => router.push(`/admin/teachers/${teacher.id}`)}>
                <GraduationCap className="h-4 w-4 ml-2" />
                عرض التفاصيل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/admin/teachers/${teacher.id}/edit`)}>
                <Edit className="h-4 w-4 ml-2" />
                تعديل
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {teacher.status !== "APPROVED" && teacher.status !== "ACTIVE" && (
                <DropdownMenuItem
                  onClick={() => setActivateDialog({ open: true, id: teacher.id, name: teacher.name })}
                >
                  <CheckCircle2 className="h-4 w-4 ml-2 text-emerald-500" />
                  تفعيل
                </DropdownMenuItem>
              )}
              {teacher.status !== "SUSPENDED" && (
                <DropdownMenuItem
                  onClick={() => setSuspendDialog({ open: true, id: teacher.id, name: teacher.name })}
                >
                  <XCircle className="h-4 w-4 ml-2 text-red-500" />
                  إيقاف
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteDialog({ open: true, id: teacher.id })}
                className="text-red-500"
              >
                <Trash2 className="h-4 w-4 ml-2" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader
        title="إدارة المعلمين 👨‍🏫"
        description="إدارة جميع المعلمين في المنصة وربطهم بالمواد الدراسية."
      >
        <div className="flex items-center gap-3">
          <AdminButton
            variant="outline"
            icon={Users}
            onClick={() => router.push("/admin/teachers/applications")}
            className="rounded-2xl border-white/20 text-xs"
          >
            طلبات التدريس
          </AdminButton>
          <AdminButton
            variant="premium"
            icon={UserPlus}
            onClick={() => router.push("/admin/teachers/create")}
            className="rounded-2xl shadow-xl text-xs"
          >
            إضافة معلم
          </AdminButton>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <AdminStatsCard
          title="إجمالي المعلمين"
          value={stats?.total || data?.pagination?.total || 0}
          icon={GraduationCap}
          color="blue"
          description="معلم في المنصة"
        />
        <AdminStatsCard
          title="نشط"
          value={stats?.approved || 0}
          icon={CheckCircle2}
          color="green"
          description="معلم نشط"
        />
        <AdminStatsCard
          title="قيد المراجعة"
          value={stats?.pending || 0}
          icon={Clock}
          color="amber"
          description="طلب معلق"
        />
        <AdminStatsCard
          title="موقوف"
          value={stats?.suspended || 0}
          icon={XCircle}
          color="red"
          description="معلم موقوف"
        />
        <AdminStatsCard
          title="مرفوض"
          value={stats?.rejected || 0}
          icon={AlertCircle}
          color="rose"
          description="طلب مرفوض"
        />
        <AdminStatsCard
          title="قيد المراجعة"
          value={stats?.underReview || 0}
          icon={ShieldCheck}
          color="purple"
          description="تحت المراجعة"
        />
      </div>

      <div className="admin-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <AdminDataTable
          columns={columns}
          data={data?.instructors || data?.teachers || []}
          loading={isLoading}
          searchKey="name"
          searchPlaceholder="ابحث عن معلم بالاسم أو البريد..."
          serverSide
          totalRows={data?.pagination?.total || 0}
          pageCount={data?.pagination?.totalPages || 1}
          currentPage={page}
          onPageChange={setPage}
          pageSize={limit}
          onPageSizeChange={setLimit}
          selectable
          onSelectionChange={(selectedRows) => {
            // Handle selection
          }}
          bulkActions={[
            {
              label: "تفعيل",
              icon: CheckCircle2,
              onClick: (selectedRows) => {
                selectedRows.forEach((row: TeacherModel) => {
                  if (row.status !== "APPROVED" && row.status !== "ACTIVE") {
                    approveMutation.mutate(row.id);
                  }
                });
              },
              variant: "default",
            },
            {
              label: "إيقاف",
              icon: XCircle,
              onClick: (selectedRows) => {
                selectedRows.forEach((row: TeacherModel) => {
                  if (row.status !== "SUSPENDED") {
                    suspendMutation.mutate(row.id);
                  }
                });
              },
              variant: "destructive",
            },
          ]}
          toolbar={
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">جميع الحالات</option>
                <option value="APPROVED">نشط</option>
                <option value="PENDING">قيد المراجعة</option>
                <option value="UNDER_REVIEW">تحت المراجعة</option>
                <option value="SUSPENDED">موقوف</option>
                <option value="REJECTED">مرفوض</option>
              </select>
            </div>
          }
          actions={{
            onRefresh: () => refetch(),
          }}
        />
      </div>

      <AdminConfirm
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, id: null })}
        title="حذف معلم"
        description="هل أنت متأكد من حذف هذا المعلم؟ سيتم إزالة بياناته من النظام."
        confirmText="تأكيد الحذف"
        variant="destructive"
        onConfirm={() => {
          if (deleteDialog.id) {
            deleteMutation.mutate(deleteDialog.id);
          }
        }}
        loading={deleteMutation.isPending}
      />

      <AdminConfirm
        open={suspendDialog.open}
        onOpenChange={(open) => setSuspendDialog({ open: open, id: null, name: "" })}
        title="إيقاف معلم"
        description={`هل أنت متأكد من إيقاف المعلم ${suspendDialog.name}؟ لن يتمكن من الوصول إلى حسابه.`}
        confirmText="تأكيد الإيقاف"
        variant="destructive"
        onConfirm={() => {
          if (suspendDialog.id) {
            suspendMutation.mutate(suspendDialog.id);
          }
        }}
        loading={suspendMutation.isPending}
      />

      <AdminConfirm
        open={activateDialog.open}
        onOpenChange={(open) => setActivateDialog({ open: open, id: null, name: "" })}
        title="تفعيل معلم"
        description={`هل أنت متأكد من تفعيل المعلم ${activateDialog.name}؟ سيتمكن من الوصول إلى حسابه.`}
        confirmText="تأكيد التفعيل"
        variant="default"
        onConfirm={() => {
          if (activateDialog.id) {
            approveMutation.mutate(activateDialog.id);
          }
        }}
        loading={approveMutation.isPending}
      />
    </div>
  );
}