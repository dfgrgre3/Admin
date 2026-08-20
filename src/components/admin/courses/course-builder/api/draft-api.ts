"use client";

import { courseApi } from "@/lib/api/course-api";
import type { CourseDraft, ApiResponse } from "../types";
import { courseToDraft } from "./mappers";

// ─── Draft / Course lifecycle ─────────────────────────────────────────────────
// Fully wired to the real Go backend via courseApi (create/update/publish/etc.
// all hit genuine, existing endpoints).

export const draftApi = {
  async getDraft(courseId: string): Promise<ApiResponse<CourseDraft>> {
    const response = await courseApi.getCourse(courseId);
    return { data: courseToDraft(response.course), error: undefined };
  },

  async createDraft(data: Partial<CourseDraft>): Promise<ApiResponse<CourseDraft>> {
    const response = await courseApi.createCourse({
      title: data.title || "",
      slug: data.slug || "",
      shortDescription: data.shortDescription || undefined,
      longDescription: data.longDescription || undefined,
      coverImageUrl: data.coverImageUrl || undefined,
      promoVideoUrl: data.promoVideoUrl || undefined,
      level: data.level || "BEGINNER",
      language: data.language || "ar",
      estimatedDurationMins: data.estimatedDurationMins || undefined,
      hasCertificate: data.hasCertificate,
      certificateTemplate: data.certificateTemplate || undefined,
      maxStudents: data.maxStudents || undefined,
      seoTitle: data.seoTitle || undefined,
      seoDescription: data.seoDescription || undefined,
      seoKeywords: data.seoKeywords || undefined,
      prerequisitesText: data.prerequisitesText || undefined,
      targetAudience: data.targetAudience || undefined,
      learningOutcomes: data.learningOutcomes || undefined,
      primaryInstructorId: data.primaryInstructorId || "",
      categoryIds: data.categoryIds,
    });
    return { data: courseToDraft(response.course), error: undefined };
  },

  async updateDraft(courseId: string, data: Partial<CourseDraft>): Promise<ApiResponse<CourseDraft>> {
    const response = await courseApi.updateCourse(courseId, {
      title: data.title || undefined,
      slug: data.slug || undefined,
      shortDescription: data.shortDescription || undefined,
      longDescription: data.longDescription || undefined,
      coverImageUrl: data.coverImageUrl || undefined,
      promoVideoUrl: data.promoVideoUrl || undefined,
      level: data.level,
      language: data.language,
      estimatedDurationMins: data.estimatedDurationMins || undefined,
      hasCertificate: data.hasCertificate,
      certificateTemplate: data.certificateTemplate || undefined,
      maxStudents: data.maxStudents || undefined,
      isFeatured: data.isFeatured,
      isTrending: data.isTrending,
      isNew: data.isNew,
      seoTitle: data.seoTitle || undefined,
      seoDescription: data.seoDescription || undefined,
      seoKeywords: data.seoKeywords || undefined,
      prerequisitesText: data.prerequisitesText || undefined,
      targetAudience: data.targetAudience || undefined,
      learningOutcomes: data.learningOutcomes || undefined,
      primaryInstructorId: data.primaryInstructorId || undefined,
      categoryIds: data.categoryIds,
    });
    return { data: courseToDraft(response.course), error: undefined };
  },

  async autoSaveDraft(courseId: string, data: Partial<CourseDraft>): Promise<ApiResponse<CourseDraft>> {
    return this.updateDraft(courseId, data);
  },

  async deleteDraft(courseId: string): Promise<ApiResponse<void>> {
    await courseApi.deleteCourse(courseId);
    return { data: undefined, error: undefined };
  },

  async getCourse(courseId: string): Promise<ApiResponse<CourseDraft>> {
    return this.getDraft(courseId);
  },

  async updateCourse(courseId: string, data: Partial<CourseDraft>): Promise<ApiResponse<CourseDraft>> {
    return this.updateDraft(courseId, data);
  },

  async publishCourse(courseId: string): Promise<ApiResponse<CourseDraft>> {
    await courseApi.submitForReview(courseId);
    const course = await courseApi.getCourse(courseId);
    return { data: courseToDraft(course.course), error: undefined };
  },

  async unpublishCourse(courseId: string): Promise<ApiResponse<CourseDraft>> {
    await courseApi.rejectCourse(courseId, "admin", "Unpublished by admin");
    const course = await courseApi.getCourse(courseId);
    return { data: courseToDraft(course.course), error: undefined };
  },

  async archiveCourse(courseId: string): Promise<ApiResponse<CourseDraft>> {
    await courseApi.archiveCourse(courseId);
    const course = await courseApi.getCourse(courseId);
    return { data: courseToDraft(course.course), error: undefined };
  },

  async unarchiveCourse(courseId: string): Promise<ApiResponse<CourseDraft>> {
    await courseApi.unarchiveCourse(courseId);
    const course = await courseApi.getCourse(courseId);
    return { data: courseToDraft(course.course), error: undefined };
  },

  async getCoursePreview(courseId: string): Promise<ApiResponse<CourseDraft>> {
    // No dedicated preview endpoint exists; the full course record is the
    // most accurate "as the student will see it" snapshot available today.
    return this.getCourse(courseId);
  },
};
