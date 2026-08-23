"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRoutes } from "@/lib/api/routes";
import { adminFetch } from "@/lib/api/admin-api";
import { parseContentDispositionFilename } from "@/lib/export-utils";
import { cn } from "@/lib/utils";
import {
  Users,
  Search,
  Download,
  TrendingUp,
  Award,
  Clock,
  Mail,
  Calendar,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  enrolledAt: string;
  progress: number;
  lastActive: string | null;
  completedLessons: number;
  totalLessons: number;
  status: "active" | "inactive" | "completed";
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
  };
}

export default function CourseStudentsPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [isExporting, setIsExporting] = React.useState(false);
  const limit = 20;

  const deferredSearch = React.useDeferredValue(search);

  const { data, isLoading } = useQuery({
    queryKey: [
      "admin",
      "courses",
      courseId,
      "students",
      page,
      limit,
      deferredSearch,
      statusFilter,
    ],
    queryFn: async (): Promise<StudentsResponse> => {
      const params = new URLSearchParams({
        offset: String((page - 1) * limit),
        limit: limit.toString(),
      });

      if (deferredSearch) params.set("search", deferredSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const response = await adminFetch(
        `${apiRoutes.admin.courseStudents(courseId)}?${params.toString()}`
      );
      if (!response.ok) throw new Error("فشل تحميل الطلاب");
      return (await response.json()) as StudentsResponse;
    },
    staleTime: 30_000,
  });

  const students = React.useMemo(() => data?.data?.students ?? [], [data]);
  const pagination = data?.data?.pagination;
  const totalPages = React.useMemo(() => {
    if (!pagination) return 1;
    return pagination.totalPages || 1;
  }, [pagination]);

  const statsData = React.useMemo(() => {
    const total = pagination?.total ?? students.length;
    const active = students.filter((s) => s.status === "active").length;
    const completed = students.filter((s) => s.status === "completed").length;
    const avgProgress =
      students.length > 0
        ? Math.round(
            students.reduce((sum, s) => sum + s.progress, 0) / students.length
          )
        : 0;
    return { total, active, completed, avgProgress };
  }, [pagination, students]);

  React.useEffect(() => {
    setPage(1);
  }, [deferredSearch, statusFilter]);

  const handleExport = React.useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (deferredSearch) params.set("search", deferredSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const query = params.toString();
      const endpoint = `${apiRoutes.admin.courseStudents(courseId)}/export`;
      const response = await adminFetch(query ? `${endpoint}?${query}` : endpoint);
      if (!response.ok) throw new Error("تعذر تصدير قائمة الطلاب");

      const filename = parseContentDispositionFilename(
        response.headers.get("content-disposition"),
        `course-students-${new Date().toISOString().slice(0, 10)}.csv`
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("تم تصدير قائمة الطلاب");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ غير متوقع");
    } finally {
      setIsExporting(false);
    }
  }, [courseId, deferredSearch, isExporting, statusFilter]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">الطلاب المشتركون</h2>
          <p className="text-sm font-bold text-muted-foreground mt-1">
            إدارة ومتابعة جميع الطلاب المسجلين في الدورة
          </p>
        </div>
        <AdminButton
          variant="outline"
          className="gap-2 rounded-xl h-11 px-6 font-bold"
          onClick={handleExport}
          disabled={isExporting}
        >
          <Download className="h-4 w-4" />
          {isExporting ? "جارٍ التصدير..." : "تصدير CSV"}
        </AdminButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "إجمالي الطلاب",
            value: statsData.total,
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/15",
          },
          {
            label: "نشط حالياً",
            value: statsData.active,
            icon: TrendingUp,
            color: "text-emerald-500",
            bg: "bg-emerald-500/15",
          },
          {
            label: "أكملوا الدورة",
            value: statsData.completed,
            icon: Award,
            color: "text-amber-500",
            bg: "bg-amber-500/15",
          },
          {
            label: "متوسط التقدم",
            value: `${statsData.avgProgress}%`,
            icon: Clock,
            color: "text-violet-500",
            bg: "bg-violet-500/15",
          },
        ].map((stat, i) => (
          <AdminCard key={i} className="p-5 relative overflow-hidden group border-border/40">
            <div
              className={cn(
                "absolute -right-3 -top-3 h-20 w-20 rounded-full opacity-10 blur-xl transition-all group-hover:opacity-20",
                stat.bg
              )}
            />
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <span className="text-[10px] font-black uppercase text-muted-foreground">
                {stat.label}
              </span>
            </div>
            <p className="text-2xl font-black">{stat.value}</p>
          </AdminCard>
        ))}
      </div>

      {/* Filters */}
      <AdminCard className="p-4 border-border/40">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث عن طالب بالاسم أو البريد الإلكتروني..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pr-10 rounded-xl text-sm font-bold"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11 w-full md:w-[200px] rounded-xl font-bold">
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="active">نشط</SelectItem>
              <SelectItem value="inactive">غير نشط</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </AdminCard>

      {/* Students Table */}
      <AdminCard className="border-border/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                <th className="text-right p-4 text-[10px] font-black uppercase text-muted-foreground">
                  الطالب
                </th>
                <th className="text-right p-4 text-[10px] font-black uppercase text-muted-foreground">
                  الحالة
                </th>
                <th className="text-right p-4 text-[10px] font-black uppercase text-muted-foreground">
                  التقدم
                </th>
                <th className="text-right p-4 text-[10px] font-black uppercase text-muted-foreground">
                  الدروس
                </th>
                <th className="text-right p-4 text-[10px] font-black uppercase text-muted-foreground">
                  آخر نشاط
                </th>
                <th className="text-right p-4 text-[10px] font-black uppercase text-muted-foreground">
                  التسجيل
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="flex justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-primary" />
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm font-bold text-muted-foreground">
                      لا يوجد طلاب مسجلين بعد
                    </p>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-border/30 hover:bg-muted/10 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-black text-sm">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{student.name}</p>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge
                        className={cn(
                          "font-black text-[10px] px-3 rounded-lg",
                          student.status === "active"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : student.status === "completed"
                            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            : "bg-muted text-muted-foreground border-border/50"
                        )}
                      >
                        {student.status === "active"
                          ? "نشط"
                          : student.status === "completed"
                          ? "مكتمل"
                          : "غير نشط"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[100px]">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              student.progress >= 80
                                ? "bg-emerald-500"
                                : student.progress >= 50
                                ? "bg-amber-500"
                                : "bg-blue-500"
                            )}
                            style={{ width: `${Math.min(student.progress, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-black min-w-[40px]">
                          {student.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-bold">
                      {student.completedLessons} / {student.totalLessons}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {student.lastActive
                          ? new Date(student.lastActive).toLocaleDateString("ar-EG")
                          : "لا يوجد نشاط"}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(student.enrolledAt).toLocaleDateString("ar-EG")}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border/50">
            <div className="text-xs font-bold text-muted-foreground">
              صفحة {page} من {totalPages}
            </div>
            <div className="flex gap-2">
              <AdminButton
                variant="outline"
                size="sm"
                className="h-9 rounded-lg text-[10px] font-black"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                السابق
              </AdminButton>
              <AdminButton
                variant="outline"
                size="sm"
                className="h-9 rounded-lg text-[10px] font-black"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                التالي
              </AdminButton>
            </div>
          </div>
        )}
      </AdminCard>
    </div>
  );
}