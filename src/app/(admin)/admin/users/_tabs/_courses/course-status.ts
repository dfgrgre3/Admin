import type { CourseStatus } from "./course-types";

export const COURSE_STATUS_LABELS: Record<string, string> = {
  COMPLETED: "مكتمل",
  IN_PROGRESS: "قيد التقدم",
  NOT_STARTED: "لم يبدأ",
};

export const COURSE_STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline"
> = {
  COMPLETED: "default",
  IN_PROGRESS: "secondary",
  NOT_STARTED: "outline",
};

export function getCourseStatusLabel(status: CourseStatus): string {
  return COURSE_STATUS_LABELS[status] ?? status;
}

export function getCourseStatusVariant(
  status: CourseStatus,
): "default" | "secondary" | "outline" {
  return COURSE_STATUS_VARIANTS[status] ?? "outline";
}