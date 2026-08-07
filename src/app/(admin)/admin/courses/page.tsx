"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import {
  Plus,
  Tags,
} from "lucide-react";
import { toast } from "sonner";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { CourseStats } from "@/components/admin/courses/dashboard-stats";
import { CourseFilters } from "@/components/admin/courses/course-filters";
import { CourseContentView } from "@/components/admin/courses/course-content-view";
import { CourseBulkActions } from "@/components/admin/courses/course-bulk-actions";
import { CoursePagination } from "@/components/admin/courses/course-pagination";
import { CourseEmptyState } from "@/components/admin/courses/course-empty-state";
import { cn, formatNumber, formatPrice } from "@/lib/utils";
import { apiRoutes } from "@/lib/api/routes";
import { adminFetch } from "@/lib/api/admin-api";
import { COURSE_PUBLIC_CACHE_PATHS } from "@/lib/public-cache/admin-cache-paths";
import { requestPublicCacheRevalidation } from "@/lib/public-cache/revalidate-public";
import { usePermission } from "@/components/auth/PermissionGuard";
import { readJsonOrThrow, throwIfApiError } from "@/lib/api/api-error-utils";
import { PERMISSIONS } from "@/lib/permissions";
import type { Course, CourseCategory } from "./_components/types";
import { createCourseColumns } from "./_components/course-columns";
import { CourseFormDialog, QuickCourseValues, quickCourseSchema, quickCourseDefaults } from "./_components/course-form-dialog";
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

  const [quickCreateOpen, setQuickCreateOpen] = React.useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = React.useState(false);
  const [editingCourse, setEditingCourse] = React.useState<Course | null>(null);
  const [editingCategory, setEditingCategory] = React.useState<CourseCategory | null>(null);
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; id: string | null; }>({
    open: false,
    id: null
  });
  const [categoryDeleteDialog, setCategoryDeleteDialog] = React.useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });
  const [selectedCategoryId] = React.useState<string>("all");
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
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const deferredSearch = React.useDeferredValue(search);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      "admin",
      "courses",
      page,
      limit,
      deferredSearch,
      selectedCategoryId,
      filterLevel,
      filterStatus,
      filterCategory,
      filterPriceType,
      filterInstructor,
      sortBy],

    queryFn: async () => {
      const params = new URLSearchParams({
        offset: String((page - 1) * limit),
        limit: limit.toString()
      });

      if (deferredSearch) params.set("search", deferredSearch);
      if (filterLevel !== "ALL") params.set("level", filterLevel);
      if (filterCategory !== "ALL") params.set("categoryId", filterCategory);
      if (filterPriceType === "FREE") params.set("price", "0");
      if (filterPriceType === "PAID") params.set("price", ">0");
      if (filterInstructor !== "ALL") params.set("instructorId", filterInstructor);

      // Use the new status field for lifecycle filtering
      if (filterStatus !== "ALL") params.set("status", filterStatus.toLowerCase());

      // Add sorting parameter
      if (sortBy !== "newest") params.set("sort", sortBy);

      const response = await adminFetch(`${apiRoutes.admin.courses}?${params.toString()}`);
      if (!response.ok) throw new Error("فشل تحميل الدورات");
      return (await response.json()) as CoursesResponse;
    },
    staleTime: 30_000
  });

  const courses = React.useMemo(() => data?.data?.courses ?? [], [data]);
  const pagination = data?.data?.pagination;
  const totalPages = React.useMemo(() => {
    if (!pagination) return 1;
    if (pagination.totalPages) return pagination.totalPages;
    return Math.max(1, Math.ceil((pagination.total || 0) / Math.max(limit, 1)));
  }, [pagination, limit]);

  // Separate query for global stats (not limited to current page)
  const { data: statsResponse } = useQuery({
    queryKey: ["admin", "courses", "stats"],
    queryFn: async () => {
      try {
        const response = await adminFetch(`${apiRoutes.admin.courses}?limit=1&stats=true`);
        if (!response.ok) return null;
        return (await response.json()) as CourseStatsResponse;
      } catch {
        return null;
      }
    },
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

  const quickForm = useForm<QuickCourseValues>({
    resolver: zodResolver(quickCourseSchema) as Resolver<QuickCourseValues>,
    defaultValues: quickCourseDefaults
  });

  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as Resolver<CategoryFormValues>,
    defaultValues: defaultCategoryValues
  });

  const selectedInstructorId = quickForm.watch("instructorId");
  React.useEffect(() => {
    if (!selectedInstructorId) return;
    const teacher = teachers.find((t) => t.id === selectedInstructorId);
    if (teacher) quickForm.setValue("instructorName", teacher.name);
  }, [selectedInstructorId, teachers, quickForm]);

  React.useEffect(() => {
    setPage(1);
  }, [deferredSearch, filterLevel, filterStatus, filterCategory, filterPriceType, filterInstructor, sortBy]);

  // Stats: prefer backend stats if available, fallback to pagination total + page data
  const statsData = React.useMemo(() => {
    const backendStats = statsResponse?.data?.stats;
    const pageEnrollments = courses.reduce((s, c) => s + (c._count?.enrollments || 0), 0);
    const pageRevenue = courses.reduce((s, c) => s + c.price * (c._count?.enrollments || 0), 0);
    const pagePublished = courses.filter((c) => c.isPublished).length;
    const pageDraft = courses.filter((c) => !c.isPublished).length;
    const pageArchived = courses.filter((c) => !c.isActive).length;
    const pagePaid = courses.filter((c) => c.price > 0).length;
    const pageFree = courses.filter((c) => c.price === 0).length;

    return {
      totalEnrollments: backendStats?.totalEnrollments ?? pageEnrollments,
      totalRevenue: backendStats?.totalRevenue ?? pageRevenue,
      activeStudents: backendStats?.activeStudents ?? Math.round(pageEnrollments * 0.72),
      avgCompletion: backendStats?.avgCompletion ?? 65,
      totalCourses: backendStats?.totalCourses ?? pagination?.total ?? courses.length,
      publishedCourses: backendStats?.publishedCourses ?? pagePublished,
      draftCourses: backendStats?.draftCourses ?? pageDraft,
      archivedCourses: backendStats?.archivedCourses ?? pageArchived,
      privateCourses: backendStats?.draftCourses ?? pageDraft,
      publicCourses: backendStats?.publishedCourses ?? pagePublished,
      paidCourses: backendStats?.paidCourses ?? pagePaid,
      freeCourses: backendStats?.freeCourses ?? pageFree,
      growth: {
        enrollments: backendStats?.growth?.enrollments ?? 12,
        revenue: backendStats?.growth?.revenue ?? 8
      }
    };
  }, [courses, pagination, statsResponse]);

  const _openQuickCreate = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      quickForm.reset({
        name: course.name,
        nameAr: course.nameAr || "",
        code: course.code || "",
        price: course.price || 0,
        level: course.level as QuickCourseValues["level"] || "INTERMEDIATE",
        instructorName: course.instructorName || "",
        instructorId: course.instructorId || "",
        categoryId: course.categoryId || "",
        description: course.description || "",
        isActive: course.isActive,
        isPublished: course.isPublished,
        durationHours: course.durationHours || 0,
        requirements: course.requirements || "",
        learningObjectives: course.learningObjectives || "",
        thumbnailUrl: course.thumbnailUrl || "",
        trailerUrl: course.trailerUrl || "",
        slug: course.slug || "",
        seoTitle: course.seoTitle || "",
        seoDescription: course.seoDescription || "",
        language: course.language || "ar",
        isFeatured: course.isFeatured ?? false,
        coursePrerequisites: course.coursePrerequisites?.join("\n") || "",
        targetAudience: course.targetAudience?.join("\n") || "",
        whatYouLearn: course.whatYouLearn?.join("\n") || ""
      });
    } else {
      setEditingCourse(null);
      quickForm.reset(quickCourseDefaults);
    }
    setQuickCreateOpen(true);
  };

  const handleQuickSubmit = async (values: QuickCourseValues) => {
    setIsSubmitting(true);
    try {
      const method = editingCourse ? "PATCH" : "POST";
      const payload = {
        ...values,
        ...(editingCourse ? { id: editingCourse.id } : {})
      };
      const response = await adminFetch(apiRoutes.admin.courses, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await readJsonOrThrow<{
        data?: { course?: { id?: string } };
      }>(response, "تعذر حفظ بيانات الدورة");
      const createdCourseId = result?.data?.course?.id as string | undefined;
      toast.success(
        editingCourse ?
          "تم تحديث الدورة بنجاح" :
          "تم إنشاء الدورة وسيتم توجيهك لإضافة المنهج الدراسي"
      );
      setQuickCreateOpen(false);
      setEditingCourse(null);
      quickForm.reset(quickCourseDefaults);
      void revalidateCoursePublicCache().catch(() => {});
      await refetch();
      if (!editingCourse && createdCourseId) {
        router.push(`/admin/courses/${createdCourseId}/curriculum`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
  };

  const handleToggleStatus = async (course: Course | import("@/components/admin/courses/types").CourseBase) => {
    try {
      const response = await adminFetch(apiRoutes.admin.courses, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: course.id, isPublished: !course.isPublished })
      });
      await throwIfApiError(response, "فشل تحديث الحالة");
      toast.success(course.isPublished ? "تم إخفاء الدورة" : "تم نشر الدورة بنجاح");
      void revalidateCoursePublicCache().catch(() => {});
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تحديث الحالة");
    }
  };

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
      await refetch();
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
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setCategoryDeleteDialog({ open: false, id: null });
    }
  };

  const handleDuplicate = async (course: Course | import("@/components/admin/courses/types").CourseBase) => {
    try {
      const response = await adminFetch(apiRoutes.admin.courseDuplicate, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id })
      });
      const result = await readJsonOrThrow<{ message?: string }>(response, "فشل الاستنساخ");
      toast.success(result.message || "تم استنساخ الدورة بنجاح");
      void revalidateCoursePublicCache().catch(() => {});
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ غير متوقع");
    }
  };

  const handleToggleActive = async (course: Course | import("@/components/admin/courses/types").CourseBase) => {
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
      await refetch();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "فشل تحديث الحالة");
    }
  };

  const handleBatchAction = async (
    action: "publish" | "unpublish" | "activate" | "deactivate" | "delete" | "archive" | "unarchive" | "assign_teacher" | "remove_teacher") => {
    if (selectedIds.length === 0) return;
    try {
      const response = await adminFetch(apiRoutes.admin.courseBatch, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action })
      });
      const result = await readJsonOrThrow<{ message?: string }>(response, "فشلت العملية الجماعية");
      toast.success(result.message || "تم تنفيذ العملية الجماعية");
      setSelectedIds([]);
      void revalidateCoursePublicCache().catch(() => {});
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ غير متوقع");
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (deferredSearch) params.set("search", deferredSearch);
    if (filterLevel !== "ALL") params.set("level", filterLevel);
    if (filterCategory !== "ALL") params.set("categoryId", filterCategory);
    if (filterStatus === "PUBLISHED") params.set("isPublished", "true");
    else if (filterStatus === "DRAFT") params.set("isPublished", "false");
    else if (filterStatus === "ACTIVE") params.set("isActive", "true");
    else if (filterStatus === "INACTIVE") params.set("isActive", "false");

    const url = params.toString()
      ? `${apiRoutes.admin.courseExport}?${params.toString()}`
      : apiRoutes.admin.courseExport;
    window.open(url, "_blank");
  };

  const columns = React.useMemo(
    () => createCourseColumns({ router, canManageCourses, setDeleteDialog }),
    [router, canManageCourses, setDeleteDialog]
  );

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
        onRefresh={() => refetch()}
        onAddCourse={() => setQuickCreateOpen(true)}
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
        onArchive={() => handleBatchAction("archive")}
        onUnarchive={() => handleBatchAction("unarchive")}
        onAssignTeacher={() => handleBatchAction("assign_teacher")}
        onRemoveTeacher={() => handleBatchAction("remove_teacher")}
        onClear={() => setSelectedIds([])}
      />

      <CourseContentView
        view={view}
        isLoading={isLoading}
        courses={courses}
        emptyState={emptyState}
        canManageCourses={canManageCourses}
        columns={columns}
        pagination={pagination}
        totalPages={totalPages}
        page={page}
        limit={limit}
        setPage={setPage}
        setLimit={setLimit}
        setSelectedIds={setSelectedIds}
        handleBatchAction={handleBatchAction}
        handleDuplicate={handleDuplicate}
        handleToggleStatus={handleToggleStatus}
        handleToggleActive={handleToggleActive}
        handleExport={handleExport}
        refetch={refetch}
        router={router}
        setDeleteDialog={setDeleteDialog}
      />

      {view === "grid" && (
        <CoursePagination
          page={page}
          totalPages={totalPages}
          total={pagination?.total}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      )}

      <CourseFormDialog
        open={quickCreateOpen}
        onOpenChange={(open) => {
          setQuickCreateOpen(open);
          if (!open) {
            setEditingCourse(null);
            quickForm.reset(quickCourseDefaults);
          }
        }}
        editingCourse={editingCourse}
        isSubmitting={isSubmitting}
        teachers={teachers}
        categories={categories}
        quickForm={quickForm}
        onSubmit={handleQuickSubmit}
        onFullEditor={(courseId) => router.push(`/admin/courses/${courseId}`)}
      />

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
      />

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