"use client";

import { cn } from "@/lib/utils";
import {
  COURSE_STATUS_COLORS,
  COURSE_STATUS_LABELS,
  type CourseStatus,
} from "@/app/(admin)/admin/courses/_components/types";

interface CourseStatusBadgeProps {
  status?: CourseStatus;
  isPublished?: boolean;
  isActive?: boolean;
  className?: string;
}

/**
 * Displays a colored badge for the course lifecycle status.
 * Falls back to deriving status from isPublished/isActive for legacy data.
 */
export function CourseStatusBadge({
  status,
  isPublished,
  isActive,
  className,
}: CourseStatusBadgeProps) {
  const resolvedStatus: CourseStatus =
    status ?? (isActive === false ? "archived" : isPublished ? "published" : "draft");

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
