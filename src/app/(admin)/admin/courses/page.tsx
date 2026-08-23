"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import {
  Download,
  Plus,
  Tags,
} from "lucide-react";
import { toast } from "sonner";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { CourseStats } from "@/components/admin/courses/dashboard-stats";
import { CourseFilters } from "@/components/admin/courses/course-filters";
import { CourseContentView } from "@/components/admin/courses/course-content-view";
import { CourseBulkActions } from "@/components/admin/courses/course-bulk-actions";
import { CoursePagination } from "@/components/admin/courses/course-pagination";
import { CourseEmptyState } from "@/components/admin/courses/course-empty-state";
import { apiRoutes } from "@/lib/api/routes";
import { parseContentDispositionFilename } from "@/lib/export-utils";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { adminFetch } from "@/lib/api/admin-api";
import { COURSE_PUBLIC_CACHE_PATHS } from "@/lib/public-cache/admin-cache-paths";
import { requestPublicCacheRevalidation } from "@/lib/public-cache/revalidate-public";
import { usePermission } from "@/components/auth/PermissionGuard";
import { readJsonOrThrow, throwIfApiError } from "@/lib/api/api-error-utils";
import { PERMISSIONS } from "@/lib/permissions";
import type { Course, CourseCategory } from "./_components/types";
import { CategoryDialog, CategoryFormValues, categorySchema, defaultCategoryValues } from "./_components/category-dialog";

function revalidateCoursePublicCache() {
  return requestPublicCacheRevalidation(COURSE_PUBLIC_CACHE_PATHS);
}

interface CoursesResponse {
  data: {
    courses: Course[];
    pagination: {
      page?: number;
      limit: number;
      total: number;
      totalPages?: number;
      offset?: number;
      hasMore?: boolean;
      nextCursor?: string | null;
    };
  };
}

interface CourseStatsResponse {
  data?: {
    stats?: {
      totalCourses?: number;
      publishedCourses?: number;
      draftCourses?: number;
      archivedCourses?: number;
      totalEnrollments?: number;
      activeStudents?: number;
      totalRevenue?: number;
      avgCompletion?: number;
      paidCourses?: number;
      freeCourses?: number;
      growth?: {
        enrollments?: number;
        revenue?: number;
      };
    };
  };
}

export default function AdminCoursesPage() {
  const router = useRouter();
  const { hasPermission } = usePermission();
  const canManageCourses = hasPermission(PERMISSIONS.SUBJECTS_MANAGE);

  const [categoryDialogOpen, setCategoryDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<CourseCategory | null>(null);
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; id: string | null; }>({
    open: false,
    id: null
  });
  const [categoryDeleteDialog, setCategoryDeleteDialog] = React.useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });
  const [assignTeacherDialog, setAssignTeacherDialog] = React.useState(false);
  const [assignTeacherId, setAssignTeacherId] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(12);
  const [search, setSearch] = React.useState("");
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [filterLevel, setFilterLevel] = React.useState("ALL");
  const [filterStatus, setFilterStatus] = React.useState("ALL");
  const [filterCategory, setFilterCategory] = React.useState("ALL");
  const [filterPriceType, setFilterPriceType] = React.useState("ALL");
  const [filterInstructor, setFilterInstructor] = React.useState("ALL");
  const [sortBy, setSortBy] = React.useState("newest");

  // useDeferredValue only defers React's *render* priority — it does not
  // coalesce the value over wall-clock time, so it settles almost immediately
  // per keystroke with nothing else competing for scheduling. An actual
  // debounce is required here since `deferredSearch` feeds the useQuery
  // queryKey below and drives a real network request on every change.
  const debouncedSearch = useDebounce(search, 300);
  const deferredSearch = React.useDeferredValue(debouncedSearch);

  const buildFilterParams = React.useCallback(() => {
    const params = new URLSearchParams();
    if (deferredSearch) params.set("search", deferredSearch);
    if (filterLevel !== "ALL") params.set("level", filterLevel);
    if (filterCategory !== "ALL") params.set("categoryId", filterCategory);
    if (filterPriceType === "FREE") params.set("price", "0");
    if (filterPriceType === "PAID") params.set("price", ">0");
    if (filterInstructor !== "ALL") params.set("instructorId", filterInstructor);
    // Backend validates status against UPPERCASE CourseStatus values
    if (filterStatus !== "ALL") params.set("status", filterStatus);
    if (sortBy !== "newest") params.set("sort", sortBy);
    return params;
  }, [
    deferredSearch,
    filterLevel,
    filterCategory,
    filterPriceType,
    filterInstructor,
    filterStatus,
    sortBy]);

  // Stats depend on the same filters (minus paging), so the serialized params
  // double as the query key.
  const statsParamsKey = React.useMemo(() => buildFilterParams().toString(), [buildFilterParams]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      "admin",
      "courses",
      page,
      limit,
      deferredSearch,
      filterLevel,
      filterStatus,
      filterCategory,
      filterPriceType,
      filterInstructor,
      sortBy],

    queryFn: async () => {
      const params = buildFilterParams();
      params.set("offset", String((page - 1) * limit));
      params.set("limit", limit.toString());

      const response = await adminFetch(`${apiRoutes.admin.courses}?${params.toString()}`);
      if (!response.ok) throw new Error("فشل تحميل الدورات");
      return (await response.json()) as CoursesResponse;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000
  });

  const courses = React.useMemo(() => data?.data?.courses ?? [], [data]);
  const pagination = data?.data?.pagination;
  const totalPages = React.useMemo(() => {
    if (!pagination) return 1;
    if (pagination.totalPages) return pagination.totalPages;
    return Math.max(1, Math.ceil((pagination.total || 0) / Math.max(limit, 1)));
  }, [pagination, limit]);

  // Global stats computed by the backend over the whole filtered set (not just the current page)
  const { data: statsResponse, refetch: refetchStats } = useQuery({
    queryKey: ["admin", "courses", "stats", statsParamsKey],
    queryFn: async () => {
      const params = buildFilterParams();
      const query = params.toString();
      const response = await adminFetch(
        query ? `${apiRoutes.admin.courseStats}?${query}` : apiRoutes.admin.courseStats);

      if (!response.ok) throw new Error("فشل تحميل إحصائيات الدورات");
      return (await response.json()) as CourseStatsResponse;
    },
    placeholderData: keepPreviousData,
    staleTime: 60_000
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ["admin", "teachers"],
    queryFn: async () => {
      const response = await adminFetch(apiRoutes.admin.teachers);
      const result = await response.json();
      return (result.data?.teachers || []) as Array<{ id: string; name: string; }>;
    },
    staleTime: 300_000
  });

  const { data: categories = [], refetch: refetchCategories } = useQuery({
    queryKey: ["admin", "course-categories"],
    queryFn: async () => {
      const response = await adminFetch(apiRoutes.admin.courseCategories);
      const result = await response.json();
      return (result.data?.categories || []) as CourseCategory[];
    },
    staleTime: 300_000
  });

  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as Resolver<CategoryFormValues>,
    defaultValues: defaultCategoryValues
  });

  React.useEffect(() => {
    setPage(1);
  }, [deferredSearch, filterLevel, filterStatus, filterCategory, filterPriceType, filterInstructor, sortBy]);

  // Stats come straight from the backend aggregate over the filtered set.
  const statsData = React.useMemo(() => {
    const backendStats = statsResponse?.data?.stats;
    return {
      totalEnrollments: backendStats?.totalEnrollments ?? 0,
      totalRevenue: backendStats?.totalRevenue ?? 0,
      activeStudents: backendStats?.activeStudents ?? 0,
      avgCompletion: backendStats?.avgCompletion ?? 0,
      totalCourses: backendStats?.totalCourses ?? pagination?.total ?? 0,
      publishedCourses: backendStats?.publishedCourses ?? 0,
      draftCourses: backendStats?.draftCourses ?? 0,
      growth: {
        enrollments: backendStats?.growth?.enrollments ?? 0,
        revenue: backendStats?.growth?.revenue ?? 0
      }
    };
  }, [pagination, statsResponse]);

  // Any mutation changes both the list and the aggregate counters.
  const refreshCourses = React.useCallback(async () => {
    await Promise.all([refetch(), refetchStats()]);
  }, [refetch, refetchStats]);

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      const response = await adminFetch(apiRoutes.admin.courses, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteDialog.id })
      });
      await throwIfApiError(response, "تعذر حذف الدورة");
      toast.success("تم حذف الدورة بنجاح");
      void revalidateCoursePublicCache().catch(() => {});
      await refreshCourses();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
  };

  const handleToggleStatus = React.useCallback(async (course: Course | import("@/components/admin/courses/types").CourseBase) => {
    try {
      const response = await adminFetch(apiRoutes.admin.courses, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: course.id, isPublished: !course.isPublished })
      });
      await throwIfApiError(response, "فشل تحديث الحالة");
      toast.success(course.isPublished ? "تم إخفاء الدورة" : "تم نشر الدورة بنجاح");
      void revalidateCoursePublicCache().catch(() => {});
      await refreshCourses();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تحديث الحالة");
    }
  }, [refreshCourses]);

  const handleCategorySubmit = async (values: CategoryFormValues) => {
    try {
      const method = editingCategory ? "PATCH" : "POST";
      const payload = editingCategory ? { ...values, id: editingCategory.id } : values;
      const response = await adminFetch(apiRoutes.admin.courseCategories, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      await throwIfApiError(response, "تعذر حفظ التصنيف");
      toast.success(editingCategory ? "تم تحديث التصنيف" : "تم إنشاء التصنيف");
      setCategoryDialogOpen(false);
      setEditingCategory(null);
      categoryForm.reset(defaultCategoryValues);
      void revalidateCoursePublicCache().catch(() => {});
      await refetchCategories();
      await refreshCourses();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء الاتصال بالخادم");
    }
  };

  const handleCategoryDelete = async () => {
    if (!categoryDeleteDialog.id) return;
    try {
      const response = await adminFetch(apiRoutes.admin.courseCategories, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: categoryDeleteDialog.id })
      });
      await throwIfApiError(response, "تعذر حذف التصنيف");
      toast.success("تم حذف التصنيف");
      void revalidateCoursePublicCache().catch(() => {});
      await refetchCategories();
      await refreshCourses();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setCategoryDeleteDialog({ open: false, id: null });
    }
  };

  const handleDuplicate = React.useCallback(async (course: Course | import("@/components/admin/courses/types").CourseBase) => {
    try {
      const response = await adminFetch(apiRoutes.admin.courseDuplicate, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id })
      });
      const result = await readJsonOrThrow<{ message?: string }>(response, "فشل الاستنساخ");
      toast.success(result.message || "تم استنساخ الدورة بنجاح");
      void revalidateCoursePublicCache().catch(() => {});
      await refreshCourses();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ غير متوقع");
    }
  }, [refreshCourses]);

  const handleToggleActive = React.useCallback(async (course: Course | import("@/components/admin/courses/types").CourseBase) => {
    try {
      const response = await adminFetch(apiRoutes.admin.courses, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: course.id, isActive: !course.isActive })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || "فشل تحديث الحالة");
      }
      toast.success(course.isActive ? "تم إيقاف الدورة" : "تم تفعيل الدورة بنجاح");
      void revalidateCoursePublicCache().catch(() => {});
      await refreshCourses();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "فشل تحديث الحالة");
    }
  }, [refreshCourses]);

  const handleBatchAction = async (
    action: "publish" | "unpublish" | "activate" | "deactivate" | "delete" | "archive" | "unarchive" | "assign_teacher" | "remove_teacher",
    teacherId?: string) => {
    if (selectedIds.length === 0) return;
    try {
      const response = await adminFetch(apiRoutes.admin.courseBatch, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action, ...(teacherId ? { teacherId } : {}) })
      });
      const result = await readJsonOrThrow<{ message?: string }>(response, "فشلت العملية الجماعية");
      toast.success(result.message || "تم تنفيذ العملية الجماعية");
      setSelectedIds([]);
      void revalidateCoursePublicCache().catch(() => {});
      await refreshCourses();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ غير متوقع");
    }
  };

  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = React.useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const params = selectedIds.length > 0
        ? new URLSearchParams({ ids: selectedIds.join(",") })
        : buildFilterParams();

      const query = params.toString();
      const response = await adminFetch(
        query ? `${apiRoutes.admin.courseExport}?${query}` : apiRoutes.admin.courseExport
      );
      if (!response.ok) throw new Error("تعذر تصدير الدورات");

      const disposition = response.headers.get("content-disposition");
      const filename = parseContentDispositionFilename(
        disposition,
        `courses-export-${new Date().toISOString().slice(0, 10)}.csv`
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
      toast.success(
        selectedIds.length > 0
          ? `تم تصدير ${selectedIds.length} دورة`
          : "تم تصدير الدورات بنجاح"
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تصدير الدورات");
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, selectedIds, buildFilterParams]);

  const emptyState = (
    <CourseEmptyState onAddCourse={() => router.push("/admin/courses/new")} />
  );

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header - simplified, no stats grid */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/30 p-8 backdrop-blur-xl">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-[80px]" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-violet-500/10 blur-[80px]" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-right">
            <h1 className="text-4xl font-black tracking-tight text-foreground">
              إدارة الدورات التعليمية
            </h1>
            <p className="text-lg font-medium text-muted-foreground">
              تحكم في المحتوى، الطلاب، والأداء المالي لمنصة Thanawy
            </p>
          </div>

          {canManageCourses && <div className="flex flex-wrap items-center justify-center gap-3">
            <AdminButton
              variant="outline"
              className="h-12 rounded-2xl px-6 font-black gap-2 bg-background/50 border-border/50"
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download className={cn("h-4 w-4", isExporting && "animate-pulse")} />
              {isExporting ? "جارٍ التصدير..." : "تصدير CSV"}
            </AdminButton>
            <AdminButton
              variant="outline"
              className="h-12 rounded-2xl px-6 font-black gap-2 bg-background/50 border-border/50"
              onClick={() => setCategoryDialogOpen(true)}
            >
              <Tags className="h-4 w-4" />
              إدارة التصنيفات
            </AdminButton>
            <AdminButton
              className="h-12 rounded-2xl px-8 font-black gap-2 shadow-xl shadow-primary/20"
              onClick={() => router.push("/admin/courses/new")}
            >
              <Plus className="h-5 w-5" />
              دورة تعليمية جديدة
            </AdminButton>
          </div>}
        </div>
      </div>

      {/* Stats - using the dedicated CourseStats component */}
      <CourseStats stats={statsData} />

      <CourseFilters
        search={search}
        level={filterLevel}
        status={filterStatus}
        category={filterCategory}
        priceType={filterPriceType}
        instructor={filterInstructor}
        sort={sortBy}
        onSearch={setSearch}
        onFilterChange={(filters) => {
          setFilterLevel(filters.level);
          setFilterStatus(filters.status);
          setFilterCategory(filters.category);
        }}
        onPriceTypeChange={setFilterPriceType}
        onInstructorChange={setFilterInstructor}
        onSortChange={setSortBy}
        onViewChange={setView}
        currentView={view}
        categories={categories}
        teachers={teachers}
        onRefresh={() => void refreshCourses()}
        onAddCourse={() => router.push("/admin/courses/new")}
        totalCount={pagination?.total ?? courses.length}
        isLoading={isFetching} />

      <CourseBulkActions
        selectedCount={selectedIds.length}
        onPublish={() => handleBatchAction("publish")}
        onUnpublish={() => handleBatchAction("unpublish")}
        onActivate={() => handleBatchAction("activate")}
        onDeactivate={() => handleBatchAction("deactivate")}
        onDelete={() => handleBatchAction("delete")}
        onExport={handleExport}
        isExporting={isExporting}
        onArchive={() => handleBatchAction("archive")}
        onUnarchive={() => handleBatchAction("unarchive")}
        onAssignTeacher={() => {
          setAssignTeacherId("");
          setAssignTeacherDialog(true);
        }}
        onRemoveTeacher={() => handleBatchAction("remove_teacher")}
        onClear={() => setSelectedIds([])}
      />

      <CourseContentView
        view={view}
        isLoading={isLoading}
        courses={courses}
        emptyState={emptyState}
        canManageCourses={canManageCourses}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        handleDuplicate={handleDuplicate}
        handleToggleStatus={handleToggleStatus}
        handleToggleActive={handleToggleActive}
        router={router}
        setDeleteDialog={setDeleteDialog}
      />

      {courses.length > 0 && (
        <CoursePagination
          page={page}
          totalPages={totalPages}
          total={pagination?.total}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      )}

      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={(open) => {
          setCategoryDialogOpen(open);
          if (!open) {
            setEditingCategory(null);
            categoryForm.reset(defaultCategoryValues);
          }
        }}
        editingCategory={editingCategory}
        categoryForm={categoryForm}
        onSubmit={handleCategorySubmit}
        onDeleteRequest={(category) => {
          setCategoryDeleteDialog({ open: true, id: category.id });
          setCategoryDialogOpen(false);
        }}
        categories={categories}
        onEditCategory={(category) => {
          setEditingCategory(category);
          categoryForm.reset({
            name: category.name,
            slug: category.slug ?? "",
            icon: category.icon ?? "",
            description: category.description ?? ""
          });
        }}
        onNewCategory={() => {
          setEditingCategory(null);
          categoryForm.reset(defaultCategoryValues);
        }}
      />

      <Dialog open={assignTeacherDialog} onOpenChange={setAssignTeacherDialog}>
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تعيين معلم للدورات المحددة</DialogTitle>
            <DialogDescription>
              سيتم تعيين المعلم المختار لعدد {selectedIds.length} دورة.
            </DialogDescription>
          </DialogHeader>

          <Select value={assignTeacherId} onValueChange={setAssignTeacherId}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="اختر معلمًا" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DialogFooter>
            <AdminButton variant="ghost" onClick={() => setAssignTeacherDialog(false)}>
              إلغاء
            </AdminButton>
            <AdminButton
              disabled={!assignTeacherId}
              onClick={async () => {
                setAssignTeacherDialog(false);
                await handleBatchAction("assign_teacher", assignTeacherId);
              }}
            >
              تعيين المعلم
            </AdminButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, id: open ? deleteDialog.id : null })}
        onConfirm={handleDelete}
        title="حذف الدورة نهائيًا"
        description="سيتم حذف الدورة بشكل دائم إذا لم يكن هناك طلاب مسجلون. هذه العملية لا يمكن التراجع عنها." />

      <ConfirmDialog
        open={categoryDeleteDialog.open}
        onOpenChange={(open) =>
          setCategoryDeleteDialog({ open, id: open ? categoryDeleteDialog.id : null })
        }
        onConfirm={handleCategoryDelete}
        title="حذف التصنيف"
        description="سيتم حذف التصنيف إذا لم يكن مرتبطًا بأي دورة."
        confirmText="حذف التصنيف"
        variant="destructive" />

    </div>
  );

}