"use client";

import { cn } from "@/lib/utils";
import {
  COURSE_STATUS_COLORS,
  COURSE_STATUS_LABELS,
  type CourseStatus,
} from "@/app/(admin)/admin/courses/_components/types";

interface CourseStatusBadgeProps {
  status?: CourseStatus | string | null;
  isPublished?: boolean;
  isActive?: boolean;
  className?: string;
}

/**
 * Displays a colored badge for the course lifecycle status.
 * Normalizes the incoming value to the backend UPPERCASE CourseStatus set and
 * falls back to deriving status from isPublished/isActive for legacy rows.
 */
export function CourseStatusBadge({
  status,
  isPublished,
  isActive,
  className,
}: CourseStatusBadgeProps) {
  const normalized = status ? status.toUpperCase() : undefined;
  const resolvedStatus: CourseStatus =
    normalized && normalized in COURSE_STATUS_LABELS
      ? (normalized as CourseStatus)
      : isActive === false
      ? "ARCHIVED"
      : isPublished
      ? "PUBLISHED"
      : "DRAFT";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        COURSE_STATUS_COLORS[resolvedStatus],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
      {COURSE_STATUS_LABELS[resolvedStatus]}
    </span>
  );
}
