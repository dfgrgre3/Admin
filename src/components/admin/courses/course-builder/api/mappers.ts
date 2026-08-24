"use client";

import type { Course, Section, Lesson as ApiLesson, CourseAssignment } from "@/lib/api/course-api";
import type { CourseDraft, Chapter, Lesson, Assignment } from "../types";

// ─── Backend → Course Builder model mappers ───────────────────────────────────
// These adapt the Go LMS response shapes (Course/Section/Lesson from
// @/lib/api/course-api) to the course-builder's own draft-oriented types.

export const courseToDraft = (course: Course): CourseDraft => ({
  id: course.id,
  title: course.title,
  slug: course.slug,
  shortDescription: course.shortDescription || undefined,
  longDescription: course.longDescription || undefined,
  coverImageUrl: course.coverImageUrl || undefined,
  promoVideoUrl: course.promoVideoUrl || undefined,
  status: course.status as any,
  level: course.level,
  language: course.language,
  estimatedDurationMins: course.estimatedDurationMins,
  hasCertificate: course.hasCertificate,
  certificateTemplate: course.certificateTemplate || undefined,
  maxStudents: course.maxStudents || undefined,
  isFeatured: course.isFeatured,
  isTrending: course.isTrending,
  isNew: course.isNew,
  seoTitle: course.seoTitle || undefined,
  seoDescription: course.seoDescription || undefined,
  seoKeywords: course.seoKeywords || [],
  prerequisitesText: course.prerequisitesText || undefined,
  targetAudience: course.targetAudience || undefined,
  learningOutcomes: course.learningOutcomes || [],
  primaryInstructorId: course.primaryInstructorId,
  updatedAt: course.updatedAt,
  pricings: course.pricings || [],
  version: course.version,
  categoryIds: [],
  sections: course.sections?.map(sectionToChapter) || [],
  instructors: [],
} as any);

export const sectionToChapter = (section: Section): Chapter => ({
  id: section.id,
  courseId: section.courseId,
  title: section.title,
  orderIndex: section.orderIndex,
  availableFrom: section.availableFrom ? String(section.availableFrom) : undefined,
  dripDelayDays: section.dripDelayDays || undefined,
  createdAt: section.createdAt,
  updatedAt: section.updatedAt,
  lessons: section.lessons?.map(lessonToLesson) || [],
} as any);

export const lessonToLesson = (lesson: ApiLesson): Lesson => ({
  id: lesson.id,
  sectionId: lesson.sectionId,
  title: lesson.title,
  type: lesson.type,
  content: lesson.content || undefined,
  mediaUrl: lesson.mediaUrl || undefined,
  durationSeconds: lesson.durationSeconds,
  isFreePreview: lesson.isFreePreview,
  orderIndex: lesson.orderIndex,
  availabilityType: lesson.availabilityType,
  availableFrom: lesson.availableFrom ? Number(lesson.availableFrom) : undefined,
  dripDelayDays: lesson.dripDelayDays || undefined,
  createdAt: lesson.createdAt,
  updatedAt: lesson.updatedAt,
  attachments: lesson.attachments || [],
  examId: lesson.examId || undefined,
  // The backend does not yet return interactive-quiz links on the lesson
  // payload, and subtitles have no dedicated model, so these stay empty
  // rather than being faked. Attachments and the exam link (above) are real
  // — see files-api.ts and exams-api.ts.
  subtitles: [],
  quizzes: [],
} as any);

export const assignmentToAssignment = (row: CourseAssignment): Assignment => ({
  id: row.id,
  title: row.title,
  description: row.description ?? undefined,
  dueDate: row.dueDate ?? undefined,
  maxScore: row.maxScore,
  courseId: row.courseId,
  lessonId: row.lessonId ?? undefined,
});

/** Standard "not supported by the backend yet" response for a feature that has
 * no reachable endpoint. Keeping a single helper makes every such gap read
 * the same way in the UI (via the existing error Alert components). */
export function unsupported<T>(featureNameAr: string): { data: T | undefined; error: string } {
  return { data: undefined, error: `${featureNameAr} غير مدعوم حالياً من الخادم (الميزة غير متوفرة في الـ backend بعد)` };
}
