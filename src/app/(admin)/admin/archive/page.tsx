"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { ArchivedHeader } from "@/components/admin/archive/archived-header";
import { ArchivedStats } from "@/components/admin/archive/archived-stats";
import { ArchivedBulkBar } from "@/components/admin/archive/archived-bulk-bar";
import { ArchivedToolbar } from "@/components/admin/archive/archived-toolbar";
import { ArchivedTable } from "@/components/admin/archive/archived-table";
import { ArchivedPagination } from "@/components/admin/archive/archived-pagination";
import { ArchivedDetailDialog } from "@/components/admin/archive/archived-detail-dialog";
import { ArchivedCourseRow, ArchivedCoursesResponse } from "@/components/admin/archive/types";
import { toArchivedRow } from "@/components/admin/archive/utils";
import { adminFetch } from "@/lib/api/admin-api";
import { throwIfApiError } from "@/lib/api/api-error-utils";
import { apiRoutes } from "@/lib/api/routes";
import { useDebounce } from "@/hooks/use-debounce";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";

/**
 * صفحة «الأرشيف» — إدارة الدورات المؤرشفة فعلياً في الباكند.
 *
 * الواجهة مقيدة بما يدعمه الباكند الحقيقي:
 *  - الحالة الوحيدة التي تمثل «مؤرشف» هي CourseStatus = ARCHIVED على الكورسات.
 *  - الاستعادة تعيد الكورس إلى حالة DRAFT (POST /courses/:id/unarchive).
 *  - الحذف ينقل الكورس إلى سلة المحذوفات (DELETE /courses/:id).
 *  - لا توجد بيانات وهمية، ولا أنواع عناصر مخترعة، ولا حقول لا يعرفها الباكند
 *  (مثل سبب الأرشفة أو الشخص الذي أرشف — الباكند لا يخزنها).
 */
export default function ArchivePage() {
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.SUBJECTS_MANAGE);

  // ── الحالة المحلية ─────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [filterLanguage, setFilterLanguage] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<ArchivedCourseRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ArchivedCourseRow | null>(null);
  const [detailTarget, setDetailTarget] = useState<ArchivedCourseRow | null>(null);

  // ── جلب البيانات ───────────────────────────────────────────
  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["admin", "archive", "courses", page, perPage, debouncedSearch, filterLevel, filterLanguage],
    queryFn: async (): Promise<ArchivedCoursesResponse> => {
      const params = new URLSearchParams({
        status: "ARCHIVED",
        page: String(page),
        limit: String(perPage),
      });
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (filterLevel !== "ALL") params.set("level", filterLevel);
      if (filterLanguage !== "ALL") params.set("language", filterLanguage);

      const response = await adminFetch(`${apiRoutes.admin.courses}?${params.toString()}`);
      if (!response.ok) throw new Error("فشل تحميل الدورات المؤرشفة");

      const body = (await response.json()) as {
        success?: boolean;
        data?: Record<string, unknown>;
        courses?: unknown[];
        pagination?: Record<string, unknown>;
      };
      const d = (body?.data ?? body) as Record<string, unknown>;
      const rawItems = Array.isArray(d.courses)
        ? (d.courses as Record<string, unknown>[])
        : Array.isArray(body.courses)
          ? (body.courses as Record<string, unknown>[])
          : [];
      const pagination = (d.pagination ?? body.pagination ?? {}) as Record<string, unknown>;

      const total = Number(pagination.total ?? rawItems.length);
      const totalPages = pagination.totalPages
        ? Number(pagination.totalPages)
        : Math.max(1, Math.ceil(total / perPage));

      return {
        items: rawItems.map(toArchivedRow),
        total,
        totalPages,
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });

  const courses = data?.items ?? [];
  const totalArchived = data?.total ?? 0;
  const totalPages = Math.max(1, data?.totalPages ?? 1);

  const invalidateAfterMutation = () => {
    void refetch();
  };

  // ── التحديد الجماعي ────────────────────────────────────────
  const toggleSelectAll = () => {
    if (selectedIds.length === courses.length && courses.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(courses.map((c) => c.id));
    }
  };
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBulkAction = async (action: "unarchive" | "delete") => {
    if (selectedIds.length === 0) return;
    setBusyId("bulk");
    try {
      const response = await adminFetch(apiRoutes.admin.courseBatch, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action }),
      });
      await throwIfApiError(response, `فشلت العملية الجماعية: ${action}`);
      toast.success("تمت العملية بنجاح");
      setSelectedIds([]);
      invalidateAfterMutation();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشلت العملية الجماعية");
    } finally {
      setBusyId(null);
    }
  };

  // ── إجراءات فردية ──────────────────────────────────────────
  const handleRestore = async () => {
    if (!restoreTarget) return;
    const target = restoreTarget;
    setBusyId(target.id);
    try {
      const response = await adminFetch(
        `${apiRoutes.admin.courses}/${target.id}/unarchive`,
        { method: "POST" },
      );
      await throwIfApiError(response, "فشلت استعادة الدورة من الأرشيف");
      toast.success("تمت استعادة الدورة", {
        description: `أُعيدت "${target.title}" إلى حالة مسودة (DRAFT) وأصبحت متاحة للإدارة من صفحة الدورات.`,
      });
      setRestoreTarget(null);
      invalidateAfterMutation();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشلت استعادة الدورة");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setBusyId(target.id);
    try {
      const response = await adminFetch(`${apiRoutes.admin.courses}/${target.id}`, {
        method: "DELETE",
      });
      await throwIfApiError(response, "تعذر حذف الدورة");
      toast.success("تم حذف الدورة", {
        description: `نُقلت "${target.title}" إلى سلة المحذوفات ولن تظهر بعد الآن في القوائم.`,
      });
      setDeleteTarget(null);
      invalidateAfterMutation();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر حذف الدورة");
    } finally {
      setBusyId(null);
    }
  };

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const params = new URLSearchParams({ status: "ARCHIVED" });
      const response = await adminFetch(`${apiRoutes.admin.courseExport}?${params.toString()}`);
      if (!response.ok) throw new Error("تعذر تصدير الدورات المؤرشفة");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `archived-courses-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("تم تصدير الدورات المؤرشفة بنجاح");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تصدير الدورات المؤرشفة");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div dir="rtl" className="space-y-8 pb-10">
      {/* ── الترويسة ─────────────────────────────────────────── */}
      <ArchivedHeader
        total={totalArchived}
        onRefresh={() => void refetch()}
        isFetching={isFetching}
        onExport={() => void handleExport()}
        isExporting={isExporting}
      />

      {/* ── لوحة الإحصائيات ─────────────────────────────────── */}
      <ArchivedStats totalArchived={totalArchived} />

      {/* ── بطاقة الجدول ─────────────────────────────────────── */}
      <Card className="overflow-hidden border-border/50">
        <ArchivedBulkBar
          selectedCount={selectedIds.length}
          totalCount={courses.length}
          busy={busyId === "bulk"}
          onRestore={() => void handleBulkAction("unarchive")}
          onDelete={() => void handleBulkAction("delete")}
          onClear={() => setSelectedIds([])}
        />

        <ArchivedToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          filterLevel={filterLevel}
          onFilterLevelChange={(value) => {
            setFilterLevel(value);
            setPage(1);
          }}
          filterLanguage={filterLanguage}
          onFilterLanguageChange={(value) => {
            setFilterLanguage(value);
            setPage(1);
          }}
          total={totalArchived}
          perPage={perPage}
          onPerPageChange={(value) => {
            setPerPage(value);
            setPage(1);
          }}
        />

        <ArchivedTable
          courses={courses}
          isLoading={isLoading}
          isError={isError}
          refetch={() => void refetch()}
          debouncedSearch={debouncedSearch}
          busyId={busyId}
          canManage={canManage}
          onRestore={setRestoreTarget}
          onDelete={setDeleteTarget}
          onDetail={setDetailTarget}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
        />

        <ArchivedPagination
          page={page}
          totalPages={totalPages}
          shown={courses.length}
          total={totalArchived}
          hidden={isLoading || isError || courses.length === 0}
          isFetching={isFetching}
          onPageChange={setPage}
        />
      </Card>

      {/* ── نافذة التفاصيل (بيانات حقيقية من الباكند فقط) ─────── */}
      <ArchivedDetailDialog
        open={!!detailTarget}
        course={detailTarget}
        canManage={canManage}
        onOpenChange={(open) => !open && setDetailTarget(null)}
        onRestore={(course) => {
          setRestoreTarget(course);
          setDetailTarget(null);
        }}
      />

      {/* ── تأكيد الاستعادة ──────────────────────────────────── */}
      <ConfirmDialog
        open={!!restoreTarget}
        onOpenChange={(open) => !open && setRestoreTarget(null)}
        onConfirm={() => void handleRestore()}
        title="استعادة الدورة من الأرشيف"
        description={
          restoreTarget
            ? `سيتم إرجاع "${restoreTarget.title}" إلى حالة مسودة (DRAFT) لتتمكن من إدارتها ونشرها من صفحة الدورات.`
            : ""
        }
        confirmText="استعادة الدورة"
        loading={!!restoreTarget && busyId === restoreTarget.id}
      />

      {/* ── تأكيد الحذف ──────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        title="حذف الدورة"
        description={
          deleteTarget
            ? `سيتم حذف "${deleteTarget.title}" من الأرشيف ونقلها إلى سلة المحذوفات. لا يمكن التراجع عن هذا الإجراء من هذه الصفحة.`
            : ""
        }
        confirmText="حذف الدورة"
        variant="destructive"
        loading={!!deleteTarget && busyId === deleteTarget.id}
      />
    </div>
  );
}
