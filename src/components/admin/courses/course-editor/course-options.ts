export interface CourseOption {
  id: string;
  name: string;
  nameAr?: string | null;
}

interface CourseListPayload {
  items?: unknown;
  subjects?: unknown;
  courses?: unknown;
  data?: unknown;
}

/**
 * Normalizes both legacy array responses and paginated subject-list responses.
 */
export function extractCourseOptions(payload: unknown): CourseOption[] {
  if (Array.isArray(payload)) {
    return payload as CourseOption[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const listPayload = payload as CourseListPayload;
  const candidates = [
    listPayload.items,
    listPayload.subjects,
    listPayload.courses,
    listPayload.data,
  ];

  for (const candidate of candidates) {
    const courses = extractCourseOptions(candidate);
    if (courses.length > 0 || Array.isArray(candidate)) {
      return courses;
    }
  }

  return [];
}