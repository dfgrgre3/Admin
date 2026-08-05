"use client";

import * as React from "react";
import { AnimatePresence, m } from "framer-motion";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { CheckCircle2 } from "lucide-react";

import { CourseCard } from "./course-card";
import { CourseListItem } from "./course-list-item";
import { CourseEmptyState } from "./course-empty-state";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { cn } from "@/lib/utils";
import type { CourseBase } from "./types";

// ─── Loading Skeletons ────────────────────────────────────────────────────────

function CourseGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border bg-card/60 overflow-hidden animate-pulse"
          style={{ animationDelay: `${i * 75}ms` }}
        >
          <div className="aspect-video bg-muted/50" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-muted/50 rounded-lg w-3/4" />
            <div className="h-3 bg-muted/50 rounded-lg w-1/2" />
            <div className="grid grid-cols-3 gap-2">
              <div className="h-8 bg-muted/50 rounded-xl" />
              <div className="h-8 bg-muted/50 rounded-xl" />
              <div className="h-8 bg-muted/50 rounded-xl" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 flex-1 bg-muted/50 rounded-xl" />
              <div className="h-9 flex-1 bg-muted/50 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CourseListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-2xl border bg-card/60 p-4 animate-pulse"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="h-16 w-28 rounded-xl bg-muted/50" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted/50 rounded-lg w-1/3" />
            <div className="h-3 bg-muted/50 rounded-lg w-1/4" />
          </div>
          <div className="hidden md:flex gap-6">
            <div className="h-4 w-12 bg-muted/50 rounded-lg" />
            <div className="h-4 w-12 bg-muted/50 rounded-lg" />
            <div className="h-4 w-12 bg-muted/50 rounded-lg" />
          </div>
          <div className="h-5 w-16 bg-muted/50 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

// ─── CourseContentView ────────────────────────────────────────────────────────

interface CourseContentViewProps {
  view: "grid" | "list";
  isLoading: boolean;
  courses: CourseBase[];
  emptyState?: React.ReactNode;
  canManageCourses: boolean;
  handleDuplicate: (course: CourseBase) => void;
  handleToggleStatus: (course: CourseBase) => void;
  handleToggleActive?: (course: CourseBase) => void;
  router: AppRouterInstance;
  setDeleteDialog: (dialog: { open: boolean; id: string | null }) => void;
  selectedIds?: string[];
  setSelectedIds?: React.Dispatch<React.SetStateAction<string[]>>;
  // Legacy props kept for backward compatibility
  columns?: unknown;
  pagination?: unknown;
  totalPages?: number;
  page?: number;
  limit?: number;
  setPage?: (page: number) => void;
  setLimit?: (limit: number) => void;
  handleBatchAction?: (action: "publish" | "unpublish" | "activate" | "deactivate" | "delete") => void;
  handleExport?: () => void;
  refetch?: () => void;
}

export function CourseContentView({
  view,
  isLoading,
  courses,
  emptyState,
  canManageCourses,
  handleDuplicate,
  handleToggleStatus,
  handleToggleActive,
  router,
  setDeleteDialog,
  selectedIds = [],
  setSelectedIds,
}: CourseContentViewProps) {

  const handleSelect = React.useCallback(
    (id: string) => {
      setSelectedIds?.((prev) =>
        prev.includes(id)
          ? prev.filter((sid) => sid !== id)
          : [...prev, id]
      );
    },
    [setSelectedIds]
  );

  const handleSelectAll = React.useCallback(() => {
    if (!setSelectedIds) return;
    const allIds = courses.map((c) => c.id);
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allIds);
    }
  }, [courses, selectedIds, setSelectedIds]);

  const allSelected = courses.length > 0 && courses.every((c) => selectedIds.includes(c.id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  // Grid view
  if (view === "grid") {
    if (isLoading) return <CourseGridSkeleton />;

    if (courses.length === 0) {
      return <>{emptyState || <CourseEmptyState />}</>;
    }

    return (
      <div className="space-y-4">
        {/* Select All Bar */}
        {canManageCourses && setSelectedIds && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <button
              onClick={handleSelectAll}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border",
                allSelected
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : someSelected
                    ? "bg-muted/50 border-primary/20 text-primary"
                    : "bg-muted/30 border-border/40 text-muted-foreground hover:text-foreground hover:border-border/60",
              )}
            >
              <div
                className={cn(
                  "h-4 w-4 rounded-md border-2 flex items-center justify-center transition-all",
                  allSelected
                    ? "border-primary bg-primary"
                    : someSelected
                      ? "border-primary bg-primary/20"
                      : "border-border/60",
                )}
              >
                {(allSelected || someSelected) && (
                  <CheckCircle2 className={cn("h-3 w-3", allSelected ? "text-white" : "text-primary")} />
                )}
              </div>
              {allSelected ? "إلغاء تحديد الكل" : "تحديد الكل"}
            </button>
            {selectedIds.length > 0 && (
              <m.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-xs font-black text-primary"
              >
                {selectedIds.length} دورة محددة
              </m.span>
            )}
          </m.div>
        )}

        <m.div
          layout
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {courses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                index={index}
                isSelected={selectedIds.includes(course.id)}
                onSelect={canManageCourses ? handleSelect : undefined}
                onEdit={
                  canManageCourses
                    ? (c) => router.push(`/admin/courses/${c.id}/edit`)
                    : undefined
                }
                onDuplicate={canManageCourses ? handleDuplicate : undefined}
                onDelete={
                  canManageCourses
                    ? (c) => setDeleteDialog({ open: true, id: c.id })
                    : undefined
                }
                onToggleStatus={canManageCourses ? handleToggleStatus : undefined}
                onToggleActive={canManageCourses ? handleToggleActive : undefined}
              />
            ))}
          </AnimatePresence>
        </m.div>
      </div>
    );
  }

  // List view
  if (isLoading) return <CourseListSkeleton />;

  if (courses.length === 0) {
    return <>{emptyState || <CourseEmptyState />}</>;
  }

  return (
    <div className="space-y-3">
      {/* Select All Bar for List */}
      {canManageCourses && setSelectedIds && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 mb-1"
        >
          <button
            onClick={handleSelectAll}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border",
              allSelected
                ? "bg-primary/10 border-primary/20 text-primary"
                : someSelected
                  ? "bg-muted/50 border-primary/20 text-primary"
                  : "bg-muted/30 border-border/40 text-muted-foreground hover:text-foreground hover:border-border/60",
            )}
          >
            <div
              className={cn(
                "h-4 w-4 rounded-md border-2 flex items-center justify-center transition-all",
                allSelected
                  ? "border-primary bg-primary"
                  : someSelected
                    ? "border-primary bg-primary/20"
                    : "border-border/60",
              )}
            >
              {(allSelected || someSelected) && (
                <CheckCircle2 className={cn("h-3 w-3", allSelected ? "text-white" : "text-primary")} />
              )}
            </div>
            {allSelected ? "إلغاء تحديد الكل" : "تحديد الكل"}
          </button>
          {selectedIds.length > 0 && (
            <m.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-xs font-black text-primary"
            >
              {selectedIds.length} دورة محددة
            </m.span>
          )}
        </m.div>
      )}

      <AnimatePresence mode="popLayout">
        {courses.map((course, index) => (
          <CourseListItem
            key={course.id}
            course={course}
            index={index}
            isSelected={selectedIds.includes(course.id)}
            onSelect={canManageCourses ? handleSelect : undefined}
            onEdit={
              canManageCourses
                ? (c) => router.push(`/admin/courses/${c.id}/edit`)
                : undefined
            }
            onDuplicate={canManageCourses ? handleDuplicate : undefined}
            onDelete={
              canManageCourses
                ? (c) => setDeleteDialog({ open: true, id: c.id })
                : undefined
            }
            onToggleStatus={canManageCourses ? handleToggleStatus : undefined}
            onToggleActive={canManageCourses ? handleToggleActive : undefined}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}