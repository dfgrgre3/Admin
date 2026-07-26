"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Users, UserPlus, Search, Download, RefreshCw, Eye, Edit, Trash2,
  GraduationCap, BookOpen, Award, TrendingUp, BarChart3, Calendar,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin-api";
import { apiRoutes } from "@/lib/api/routes";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { exportToCSV, ExportColumn } from "@/lib/export-utils";
import { UserStatus } from "@/types/enums";

interface Student {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  phone: string | null;
  status: UserStatus;
  gender: string | null;
  dateOfBirth: string | null;
  city: string | null;
  country: string | null;
  school: string | null;
  totalXP: number;
  level: number;
  currentStreak: number;
  examsPassed: number;
  tasksCompleted: number;
  studyTimeMinutes: number;
  lastActiveAt: string | null;
  createdAt: string;
  enrolledCoursesCount: number;
  completedCoursesCount: number;
  averageGrade: number | null;
  nextLessonAt: string | null;
  subscriptionStatus: string | null;
  subscriptionExpiresAt: string | null;
}

interface StudentsResponse {
  data: {
    students: Student[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    summary: {
      totalStudents: number;
      activeStudents: number;
      inactiveStudents: number;
      suspendedStudents: number;
      averageXP: number;
      averageLevel: number;
      totalStudyHours: number;
      topPerformingStudent?: Student | null;
    };
  };
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  ACTIVE: { label: "نشط", color: "text-emerald-500", bgColor: "bg-emerald-500/10 border-emerald-500/20" },
  INACTIVE: { label: "غير نشط", color: "text-slate-500", bgColor: "bg-slate-500/10 border-slate-500/20" },
  SUSPENDED: { label: "معلق", color: "text-amber-500", bgColor: "bg-amber-500/10 border-amber-500/20" },
  BANNED: { label: "محظور", color: "text-red-500", bgColor: "bg-red-500/10 border-red-500/20" },
  DELETED: { label: "محذوف", color: "text-gray-500", bgColor: "bg-gray-500/10 border-gray-500/20" },
};

export default function AdminStudentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const canManageStudents = hasPermission(PERMISSIONS.STUDENTS_VIEW);

  const [page, setPage] = React.useState(() => Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = React.useState(() => Number(searchParams.get("limit")) || 10);
  const [search, setSearch] = React.useState(() => searchParams.get("search") || "");
  const [querySearch, setQuerySearch] = React.useState(() => searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = React.useState(() => searchParams.get("status") || "all");
  const [sortBy, setSortBy] = React.useState(() => searchParams.get("sortBy") || "createdAt");
  const [sortOrder, setSortOrder] = React.useState(() => searchParams.get("sortOrder") || "desc");
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const deferredSearch = React.useDeferredValue(querySearch);

  React.useEffect(() => {
    setPage(1);
  }, [deferredSearch, statusFilter]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "students", page, limit, deferredSearch, statusFilter, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });
      if (deferredSearch) params.set("search", deferredSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const response = await adminApi.fetch(`${apiRoutes.admin.users}?${params.toString()}&role=STUDENT`);
      if (!response.ok) throw new Error("Failed to fetch students");
      return (await response.json()) as StudentsResponse;
    },
    placeholderData: (previousData) => previousData,
  });

  const students = data?.data?.students || [];
  const pagination = data?.data?.pagination;
  const summary = data?.data?.summary || {
    totalStudents: 0,
    activeStudents: 0,
    inactiveStudents: 0,
    suspendedStudents: 0,
    averageXP: 0,
    averageLevel: 0,
    totalStudyHours: 0,
  };

  const handleExport = () => {
    if (!students.length) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }
    const exportColumns: ExportColumn<Student>[] = [
      { header: "الاسم", accessor: (s) => s.name || "غير معروف" },
      { header: "البريد الإلكتروني", accessor: (s) => s.email },
      { header: "المستوى", accessor: (s) => s.level },
      { header: "الخبرة (XP)", accessor: (s) => s.totalXP },
      { header: "السلسلة الحالية", accessor: (s) => s.currentStreak },
      { header: "الامتحانات المنجزة", accessor: (s) => s.examsPassed },
      { header: "الواجبات المنجزة", accessor: (s) => s.tasksCompleted },
      { header: "ساعات الدراسة", accessor: (s) => Math.round(s.studyTimeMinutes / 60) },
      { header: "المتوسط", accessor: (s) => s.averageGrade?.toFixed(2) || "-" },
      { header: "عدد الدورات", accessor: (s) => s.enrolledCoursesCount },
      { header: "الحالة", accessor: (s) => statusConfig[s.status]?.label || s.status },
      { header: "تاريخ الإنشاء", accessor: (s) => new Date(s.createdAt).toLocaleDateString("ar-EG") },
    ];
    exportToCSV(students, exportColumns, "students");
    toast.success("تم التصدير بنجاح");
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      const response = await adminApi.fetch(`${apiRoutes.admin.users}/${deleteDialog.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("تم حذف الطالب بنجاح");
        queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      } else {
        const error = await response.json();
        toast.error(error.error || "فشل في حذف الطالب");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
  };

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "name",
      header: "الطالب",
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={student.avatar || ""} />
              <AvatarFallback className="font-bold bg-primary/10 text-primary">
                {student.name?.charAt(0) || student.email.charAt(0) || "S"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-black text-xs">{student.name || "طالب"}</p>
              <p className="text-[10px] text-muted-foreground font-bold opacity-60 italic">
                {student.email}
              </p>
              {student.school && (
                <p className="text-[9px] text-muted-foreground">{student.school}</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "level",
      header: "المستوى",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GraduationCap className="h-3 w-3" />
          </div>
          <span className="font-black text-xs">{row.original.level}</span>
        </div>
      ),
    },
    {
      accessorKey: "totalXP",
      header: "الخبرة",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Award className="h-3 w-3 text-amber-500" />
          <span className="font-black text-xs text-amber-500">{row.original.totalXP.toLocaleString()}</span>
        </div>
      ),
    },
    {
      accessorKey: "currentStreak",
      header: "السلسلة",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3 w-3 text-rose-500" />
          <span className="font-black text-xs">{row.original.currentStreak} يوم</span>
        </div>
      ),
    },
    {
      accessorKey: "examsPassed",
      header: "الامتحانات",
      cell: ({ row }) => (
        <span className="font-black text-xs">{row.original.examsPassed} / {row.original.examsPassed + (row.original.tasksCompleted || 0)}</span>
      ),
    },
    {
      accessorKey: "studyTimeMinutes",
      header: "وقت الدراسة",
      cell: ({ row }) => (
        <span className="text-xs font-bold text-muted-foreground">
          {Math.round(row.original.studyTimeMinutes / 60)} ساعة
        </span>
      ),
    },
    {
      accessorKey: "enrolledCoursesCount",
      header: "الدورات",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <BookOpen className="h-3 w-3 text-blue-500" />
          <span className="font-black text-xs">{row.original.enrolledCoursesCount}</span>
        </div>
      ),
    },
    {
      accessorKey: "averageGrade",
      header: "المتوسط",
      cell: ({ row }) => (
        row.original.averageGrade ? (
          <Badge variant="outline" className="font-black text-xs px-2 py-0.5">
            {row.original.averageGrade.toFixed(1)}%
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground opacity-50">-</span>
        )
      ),
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => {
        const config = statusConfig[row.original.status] || statusConfig.ACTIVE;
        if (!config) return null;
        return (
          <div className={`inline-flex items-center px-2.5 py-1 rounded-lg border ${config.bgColor}`}>
            <span className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}>
              {config.label}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "lastActiveAt",
      header: "آخر نشاط",
      cell: ({ row }) => (
        <span className="text-xs font-bold text-muted-foreground">
          {row.original.lastActiveAt
            ? new Date(row.original.lastActiveAt).toLocaleDateString("ar-EG")
            : "لم يسجل دخولًا"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push(`/admin/students/${student.id}`)}
              className="p-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              aria-label={`عرض ${student.name || "الطالب"}`}
              title="عرض الملف"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => router.push(`/admin/users/${student.id}/edit`)}
              className="p-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              aria-label={`تعديل ${student.name || "الطالب"}`}
              title="تعديل"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setDeleteDialog({ open: true, id: student.id })}
              className="p-1.5 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              aria-label={`حذف ${student.name || "الطالب"}`}
              title="حذف"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader
        title="إدارة الطلاب 👨‍🎓"
        description="عرض وإدارة جميع طلاب المنصة، تقدمهم الدراسي، والأنشطة التعليمية."
        eyebrow="المستخدمون"
        badge={summary.totalStudents.toLocaleString()}
      >
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={Download} onClick={handleExport}>
            تصدير CSV
          </AdminButton>
          <AdminButton variant="outline" icon={RefreshCw} onClick={() => refetch()} loading={isFetching}>
            تحديث
          </AdminButton>
          <AdminButton
            icon={UserPlus}
            onClick={() => router.push("/admin/users/create")}
          >
            إضافة طالب
          </AdminButton>
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <AdminStatsCard
          title="إجمالي الطلاب"
          value={summary.totalStudents}
          icon={Users}
          color="blue"
          description="طالب مسجل"
        />
        <AdminStatsCard
          title="نشطون"
          value={summary.activeStudents}
          icon={TrendingUp}
          color="green"
          description="طالب نشط"
        />
        <AdminStatsCard
          title="غير نشطون"
          value={summary.inactiveStudents}
          icon={BarChart3}
          color="slate"
          description="لم يسجلوا دخولًا مؤخرًا"
        />
        <AdminStatsCard
          title="معلقون"
          value={summary.suspendedStudents}
          icon={Calendar}
          color="yellow"
          description="طلاب معلقون"
        />
        <AdminStatsCard
          title="متوسط الخبرة"
          value={summary.averageXP}
          icon={Award}
          color="amber"
          description="نقطة خبرة متوسطها الطلاب"
        />
      </div>

      {/* Table */}
      <div className="rpg-glass-light dark:rpg-glass p-1 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <AdminDataTable
          columns={columns}
          data={students}
          loading={isLoading}
          serverSide
          virtualized
          totalRows={pagination?.total || 0}
          pageCount={pagination?.totalPages || 1}
          currentPage={page}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
          pageSize={limit}
          actions={{ onRefresh: () => refetch() }}
          toolbar={
            <div className="flex items-center gap-3">
              <div className="relative group w-full sm:w-64">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setQuerySearch(e.target.value);
                  }}
                  placeholder="ابحث بالاسم أو البريد..."
                  className="h-10 w-full rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold text-right"
                  dir="rtl"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-xl border border-border bg-accent/10 px-3 text-xs font-black text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">جميع الحالات</option>
                <option value="ACTIVE">نشط</option>
                <option value="INACTIVE">غير نشط</option>
                <option value="SUSPENDED">معلق</option>
                <option value="BANNED">محظور</option>
              </select>
            </div>
          }
          emptyMessage={{
            title: "لا يوجد طلاب",
            description: "لم يتم العثور على أي طلاب بهذه المعايير.",
          }}
        />
      </div>

      {/* Delete Confirmation */}
      <AdminConfirm
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, id: null })}
        title="حذف الطالب"
        description="هل أنت متأكد من حذف هذا الطالب؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
