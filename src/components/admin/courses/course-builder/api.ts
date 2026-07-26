"use client";

import { courseApi, type Course, type Section, type Lesson, type Pricing, type Enrollment } from "@/lib/api/course-api";
import type {
  CourseDraft,
  Chapter,
  Teacher,
  TeacherAssignment,
  Exam,
  Assignment,
  CertificateTemplate,
  Attachment,
  ApiResponse,
  PaginatedResponse,
  CourseCategory,
  LanguageOption,
} from "./types";

// Helper to convert Course to CourseDraft
const courseToDraft = (course: Course): CourseDraft => ({
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

const sectionToChapter = (section: Section): Chapter => ({
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

const lessonToLesson = (lesson: Lesson): Lesson => ({
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
  subtitles: [],
  quizzes: [],
} as any);

class CourseBuilderApi {
  // ─── Draft Course Operations ──────────────────────────────────────────────

  async getDraft(courseId: string): Promise<ApiResponse<CourseDraft>> {
    const response = await courseApi.getCourse(courseId);
    return {
      data: courseToDraft(response.course),
      error: undefined,
    };
  }

  async createDraft(data: Partial<CourseDraft>): Promise<ApiResponse<CourseDraft>> {
    const response = await courseApi.createCourse({
      title: data.title || '',
      slug: data.slug || '',
      shortDescription: data.shortDescription || undefined,
      longDescription: data.longDescription || undefined,
      coverImageUrl: data.coverImageUrl || undefined,
      promoVideoUrl: data.promoVideoUrl || undefined,
      level: data.level || 'BEGINNER',
      language: data.language || 'ar',
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
      primaryInstructorId: data.primaryInstructorId || '',
      categoryIds: data.categoryIds,
    });
    return {
      data: courseToDraft(response.course),
      error: undefined,
    };
  }

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
    return {
      data: courseToDraft(response.course),
      error: undefined,
    };
  }

  async autoSaveDraft(courseId: string, data: Partial<CourseDraft>): Promise<ApiResponse<CourseDraft>> {
    // Use updateDraft for auto-save
    return this.updateDraft(courseId, data);
  }

  async deleteDraft(courseId: string): Promise<ApiResponse<void>> {
    await courseApi.deleteCourse(courseId);
    return { data: undefined, error: undefined };
  }

  // ─── Course Operations ────────────────────────────────────────────────────

  async getCourse(courseId: string): Promise<ApiResponse<CourseDraft>> {
    return this.getDraft(courseId);
  }

  async updateCourse(courseId: string, data: Partial<CourseDraft>): Promise<ApiResponse<CourseDraft>> {
    return this.updateDraft(courseId, data);
  }

  async publishCourse(courseId: string): Promise<ApiResponse<CourseDraft>> {
    const response = await courseApi.submitForReview(courseId);
    // Get updated course
    const course = await courseApi.getCourse(courseId);
    return {
      data: courseToDraft(course.course),
      error: undefined,
    };
  }

  async unpublishCourse(courseId: string): Promise<ApiResponse<CourseDraft>> {
    const response = await courseApi.rejectCourse(courseId, 'admin', 'Unpublished by admin');
    const course = await courseApi.getCourse(courseId);
    return {
      data: courseToDraft(course.course),
      error: undefined,
    };
  }

  async archiveCourse(courseId: string): Promise<ApiResponse<CourseDraft>> {
    const response = await courseApi.archiveCourse(courseId);
    const course = await courseApi.getCourse(courseId);
    return {
      data: courseToDraft(course.course),
      error: undefined,
    };
  }

  async unarchiveCourse(courseId: string): Promise<ApiResponse<CourseDraft>> {
    const response = await courseApi.unarchiveCourse(courseId);
    const course = await courseApi.getCourse(courseId);
    return {
      data: courseToDraft(course.course),
      error: undefined,
    };
  }

  async getCoursePreview(courseId: string): Promise<ApiResponse<CourseDraft>> {
    // For now, use getCourse - preview would need separate endpoint
    return this.getCourse(courseId);
  }

  // ─── Categories ────────────────────────────────────────────────────────────

  async getCategories(): Promise<ApiResponse<CourseCategory[]>> {
    // Placeholder - would need dedicated categories API
    return { data: [], error: undefined };
  }

  // ─── Levels ────────────────────────────────────────────────────────────────

  async getLevels(): Promise<ApiResponse<{ value: string; label: string }[]>> {
    return {
      data: [
        { value: 'BEGINNER', label: 'Beginner' },
        { value: 'INTERMEDIATE', label: 'Intermediate' },
        { value: 'ADVANCED', label: 'Advanced' },
      ],
      error: undefined,
    };
  }

  // ─── Languages ─────────────────────────────────────────────────────────────

  async getLanguages(): Promise<ApiResponse<LanguageOption[]>> {
    return {
      data: [
        { code: 'ar', name: 'Arabic' } as any,
        { code: 'en', name: 'English' } as any,
      ],
      error: undefined,
    };
  }

  // ─── Teachers ──────────────────────────────────────────────────────────────

  async getTeachers(): Promise<ApiResponse<Teacher[]>> {
    // Placeholder - would need dedicated teachers API
    return { data: [], error: undefined };
  }

  async getCourseTeachers(courseId: string): Promise<ApiResponse<TeacherAssignment[]>> {
    // Placeholder - would need dedicated API
    return { data: [], error: undefined };
  }

  async assignTeacher(courseId: string, instructorId: string, role: string): Promise<ApiResponse<TeacherAssignment>> {
    // Placeholder - would need to implement via courseApi
    return { data: null as any, error: undefined };
  }

  async removeTeacher(courseId: string, instructorId: string): Promise<ApiResponse<void>> {
    // Placeholder - would need to implement via courseApi
    return { data: undefined, error: undefined };
  }

  // ─── Chapters (Sections) ──────────────────────────────────────────────────

  async getChapters(courseId: string): Promise<ApiResponse<Chapter[]>> {
    const response = await courseApi.listSections(courseId);
    return {
      data: response.sections.map(sectionToChapter),
      error: undefined,
    };
  }

  async createChapter(courseId: string, data: { title: string; orderIndex: number; availableFrom?: string | null; dripDelayDays?: number | null }): Promise<ApiResponse<Chapter>> {
    const response = await courseApi.createSection(courseId, {
      title: data.title,
      orderIndex: data.orderIndex,
      availableFrom: data.availableFrom ? new Date(data.availableFrom).getTime() : undefined,
      dripDelayDays: data.dripDelayDays || undefined,
    });
    return {
      data: sectionToChapter(response.section),
      error: undefined,
    };
  }

  async updateChapter(chapterId: string, data: Partial<Chapter>): Promise<ApiResponse<Chapter>> {
    // Placeholder - would need updateSection implementation
    return { data: null as any, error: undefined };
  }

  async deleteChapter(chapterId: string): Promise<ApiResponse<void>> {
    // Placeholder - would need deleteSection implementation
    return { data: undefined, error: undefined };
  }

  async reorderChapters(courseId: string, chapterIds: string[]): Promise<ApiResponse<Chapter[]>> {
    await courseApi.reorderSections(courseId, chapterIds);
    return this.getChapters(courseId);
  }

  // ─── Lessons ────────────────────────────────────────────────────────────────

  async getLessons(sectionId: string): Promise<ApiResponse<Lesson[]>> {
    // Placeholder - would need listLessons implementation
    return { data: [], error: undefined };
  }

  async createLesson(sectionId: string, data: Partial<Lesson>): Promise<ApiResponse<Lesson>> {
    // Placeholder - would need createLesson implementation
    return { data: null as any, error: undefined };
  }

  async updateLesson(lessonId: string, data: Partial<Lesson>): Promise<ApiResponse<Lesson>> {
    // Placeholder - would need updateLesson implementation
    return { data: null as any, error: undefined };
  }

  async deleteLesson(lessonId: string): Promise<ApiResponse<void>> {
    // Placeholder - would need deleteLesson implementation
    return { data: undefined, error: undefined };
  }

  async duplicateLesson(lessonId: string): Promise<ApiResponse<Lesson>> {
    // Placeholder - would need duplicateLesson implementation
    return { data: null as any, error: undefined };
  }

  async reorderLessons(sectionId: string, lessonIds: string[]): Promise<ApiResponse<Lesson[]>> {
    // Placeholder - would need reorderLessons implementation
    return { data: [], error: undefined };
  }

  // ─── Videos ────────────────────────────────────────────────────────────────

  async uploadVideo(lessonId: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<{ videoUrl: string; metadata: any }>> {
    // Placeholder - would need video upload implementation
    if (onProgress) onProgress(100);
    return { data: { videoUrl: '', metadata: null }, error: undefined };
  }

  async deleteVideo(lessonId: string): Promise<ApiResponse<void>> {
    // Placeholder
    return { data: undefined, error: undefined };
  }

  async updateVideo(lessonId: string, data: { videoUrl?: string; visibility?: string }): Promise<ApiResponse<any>> {
    // Placeholder
    return { data: null, error: undefined };
  }

  async getVideo(lessonId: string): Promise<ApiResponse<any>> {
    // Placeholder
    return { data: null, error: undefined };
  }

  async getProcessingStatus(videoId: string): Promise<ApiResponse<any>> {
    // Placeholder
    return { data: null, error: undefined };
  }

  // ─── Files/Attachments ─────────────────────────────────────────────────────

  async uploadFile(lessonId: string, file: File): Promise<ApiResponse<Attachment>> {
    // Placeholder
    return { data: null as any, error: undefined };
  }

  async deleteFile(attachmentId: string): Promise<ApiResponse<void>> {
    // Placeholder
    return { data: undefined, error: undefined };
  }

  async downloadFile(attachmentId: string): Promise<Blob> {
    // Placeholder
    return new Blob();
  }

  // ─── Exams ─────────────────────────────────────────────────────────────────

  async getExams(courseId?: string): Promise<ApiResponse<Exam[]>> {
    // Placeholder
    return { data: [], error: undefined };
  }

  async linkExam(lessonId: string, examId: string): Promise<ApiResponse<any>> {
    // Placeholder
    return { data: null, error: undefined };
  }

  async unlinkExam(lessonId: string): Promise<ApiResponse<void>> {
    // Placeholder
    return { data: undefined, error: undefined };
  }

  // ─── Assignments ───────────────────────────────────────────────────────────

  async getAssignments(courseId?: string): Promise<ApiResponse<Assignment[]>> {
    // Placeholder
    return { data: [], error: undefined };
  }

  async linkAssignment(lessonId: string, assignmentId: string): Promise<ApiResponse<any>> {
    // Placeholder
    return { data: null, error: undefined };
  }

  async unlinkAssignment(lessonId: string): Promise<ApiResponse<void>> {
    // Placeholder
    return { data: undefined, error: undefined };
  }

  // ─── Certificates ──────────────────────────────────────────────────────────

  async getCertificateTemplates(): Promise<ApiResponse<CertificateTemplate[]>> {
    // Placeholder
    return { data: [], error: undefined };
  }

  async assignCertificateTemplate(courseId: string, templateId: string): Promise<ApiResponse<any>> {
    // Placeholder
    return { data: null, error: undefined };
  }

  async removeCertificateTemplate(courseId: string): Promise<ApiResponse<void>> {
    // Placeholder
    return { data: undefined, error: undefined };
  }

  // ─── Pricing ────────────────────────────────────────────────────────────────

  async getPricing(courseId: string): Promise<ApiResponse<Pricing[]>> {
    const response = await courseApi.getPricing(courseId);
    return {
      data: response.pricing ? [response.pricing] : [],
      error: undefined,
    };
  }

  async updatePricing(courseId: string, data: Partial<Pricing>[]): Promise<ApiResponse<Pricing[]>> {
    if (data.length > 0) {
      await courseApi.setPricing(courseId, data[0] as any);
    }
    return this.getPricing(courseId);
  }

  // ─── SEO ────────────────────────────────────────────────────────────────────

  async getSEO(courseId: string): Promise<ApiResponse<any>> {
    // Placeholder - SEO is part of course data
    const course = await courseApi.getCourse(courseId);
    return {
      data: {
        seoTitle: course.course.seoTitle,
        seoDescription: course.course.seoDescription,
        seoKeywords: course.course.seoKeywords,
      },
      error: undefined,
    };
  }

  async updateSEO(courseId: string, data: any): Promise<ApiResponse<any>> {
    // Placeholder - update via updateCourse
    return { data: null, error: undefined };
  }
}

export const courseBuilderApi = new CourseBuilderApi();