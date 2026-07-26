"use client";

import { adminFetch } from "@/lib/api/admin-api";
import { apiRoutes } from "@/lib/api/routes";
import type {
  CourseDraft,
  Chapter,
  Lesson,
  Teacher,
  TeacherAssignment,
  Exam,
  Assignment,
  Pricing,
  CertificateTemplate,
  Attachment,
  ApiResponse,
  PaginatedResponse,
  CourseCategory,
  LanguageOption,
} from "./types";

const COURSE_BUILDER_BASE = "/api/admin/courses/builder";

class CourseBuilderApi {
  // ─── Draft Course Operations ──────────────────────────────────────────────

  async getDraft(courseId: string): Promise<ApiResponse<CourseDraft>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}/builder/draft`);
    return response.json();
  }

  async createDraft(data: Partial<CourseDraft>): Promise<ApiResponse<CourseDraft>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/builder/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async updateDraft(courseId: string, data: Partial<CourseDraft>): Promise<ApiResponse<CourseDraft>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}/builder/draft`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async autoSaveDraft(courseId: string, data: Partial<CourseDraft>): Promise<ApiResponse<CourseDraft>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}/builder/autosave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async deleteDraft(courseId: string): Promise<ApiResponse<void>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}/builder/draft`, {
      method: "DELETE",
    });
    return response.json();
  }

  // ─── Course Operations ────────────────────────────────────────────────────

  async getCourse(courseId: string): Promise<ApiResponse<CourseDraft>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}`);
    return response.json();
  }

  async updateCourse(courseId: string, data: Partial<CourseDraft>): Promise<ApiResponse<CourseDraft>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async publishCourse(courseId: string): Promise<ApiResponse<CourseDraft>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}/submit-review`, {
      method: "POST",
    });
    return response.json();
  }

  async unpublishCourse(courseId: string): Promise<ApiResponse<CourseDraft>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Unpublished by admin" }),
    });
    return response.json();
  }

  async archiveCourse(courseId: string): Promise<ApiResponse<CourseDraft>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}/archive`, {
      method: "POST",
    });
    return response.json();
  }

  async unarchiveCourse(courseId: string): Promise<ApiResponse<CourseDraft>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}/unarchive`, {
      method: "POST",
    });
    return response.json();
  }

  async getCoursePreview(courseId: string): Promise<ApiResponse<CourseDraft>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}/preview`);
    return response.json();
  }

  // ─── Categories ────────────────────────────────────────────────────────────

  async getCategories(): Promise<ApiResponse<CourseCategory[]>> {
    const response = await adminFetch(apiRoutes.admin.courseCategories);
    return response.json();
  }

  // ─── Levels ────────────────────────────────────────────────────────────────

  async getLevels(): Promise<ApiResponse<{ value: string; label: string }[]>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/levels`);
    return response.json();
  }

  // ─── Languages ─────────────────────────────────────────────────────────────

  async getLanguages(): Promise<ApiResponse<LanguageOption[]>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/languages`);
    return response.json();
  }

  // ─── Teachers ──────────────────────────────────────────────────────────────

  async getTeachers(): Promise<ApiResponse<Teacher[]>> {
    const response = await adminFetch(apiRoutes.admin.teachers);
    return response.json();
  }

  async getCourseTeachers(courseId: string): Promise<ApiResponse<TeacherAssignment[]>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}/teachers`);
    return response.json();
  }

  async assignTeacher(courseId: string, instructorId: string, role: string): Promise<ApiResponse<TeacherAssignment>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}/teachers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instructorId, role }),
    });
    return response.json();
  }

  async removeTeacher(courseId: string, instructorId: string): Promise<ApiResponse<void>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}/teachers/${instructorId}`, {
      method: "DELETE",
    });
    return response.json();
  }

  // ─── Chapters (Sections) ──────────────────────────────────────────────────

  async getChapters(courseId: string): Promise<ApiResponse<Chapter[]>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}/sections`);
    return response.json();
  }

  async createChapter(courseId: string, data: { title: string; orderIndex: number; availableFrom?: string | null; dripDelayDays?: number | null }): Promise<ApiResponse<Chapter>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async updateChapter(chapterId: string, data: Partial<Chapter>): Promise<ApiResponse<Chapter>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/sections/${chapterId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async deleteChapter(chapterId: string): Promise<ApiResponse<void>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/sections/${chapterId}`, {
      method: "DELETE",
    });
    return response.json();
  }

  async reorderChapters(courseId: string, chapterIds: string[]): Promise<ApiResponse<Chapter[]>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}/sections/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapterIds }),
    });
    return response.json();
  }

  // ─── Lessons ────────────────────────────────────────────────────────────────

  async getLessons(sectionId: string): Promise<ApiResponse<Lesson[]>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/sections/${sectionId}/lessons`);
    return response.json();
  }

  async createLesson(sectionId: string, data: Partial<Lesson>): Promise<ApiResponse<Lesson>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/sections/${sectionId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async updateLesson(lessonId: string, data: Partial<Lesson>): Promise<ApiResponse<Lesson>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/lessons/${lessonId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async deleteLesson(lessonId: string): Promise<ApiResponse<void>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/lessons/${lessonId}`, {
      method: "DELETE",
    });
    return response.json();
  }

  async duplicateLesson(lessonId: string): Promise<ApiResponse<Lesson>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/lessons/${lessonId}/duplicate`, {
      method: "POST",
    });
    return response.json();
  }

  async reorderLessons(sectionId: string, lessonIds: string[]): Promise<ApiResponse<Lesson[]>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/sections/${sectionId}/lessons/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonIds }),
    });
    return response.json();
  }

  // ─── Videos ────────────────────────────────────────────────────────────────

  async uploadVideo(lessonId: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<{ videoUrl: string; metadata: any }>> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("lessonId", lessonId);

    const response = await adminFetch(`${apiRoutes.admin.courses}/lessons/${lessonId}/video`, {
      method: "POST",
      body: formData,
    });

    if (onProgress) {
      // Note: Real progress tracking would need a more complex implementation
      // This is a simplified version
      onProgress(100);
    }

    return response.json();
  }

  async deleteVideo(lessonId: string): Promise<ApiResponse<void>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/lessons/${lessonId}/video`, {
      method: "DELETE",
    });
    return response.json();
  }

  async updateVideo(lessonId: string, data: { videoUrl?: string; visibility?: string }): Promise<ApiResponse<any>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/lessons/${lessonId}/video`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async getVideo(lessonId: string): Promise<ApiResponse<any>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/lessons/${lessonId}/video`);
    return response.json();
  }

  async getProcessingStatus(videoId: string): Promise<ApiResponse<any>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/videos/${videoId}/status`);
    return response.json();
  }

  // ─── Files/Attachments ─────────────────────────────────────────────────────

  async uploadFile(lessonId: string, file: File): Promise<ApiResponse<Attachment>> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("lessonId", lessonId);

    const response = await adminFetch(`${apiRoutes.admin.courses}/lessons/${lessonId}/attachments`, {
      method: "POST",
      body: formData,
    });
    return response.json();
  }

  async deleteFile(attachmentId: string): Promise<ApiResponse<void>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/attachments/${attachmentId}`, {
      method: "DELETE",
    });
    return response.json();
  }

  async downloadFile(attachmentId: string): Promise<Blob> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/attachments/${attachmentId}/download`);
    return response.blob();
  }

  // ─── Exams ─────────────────────────────────────────────────────────────────

  async getExams(courseId?: string): Promise<ApiResponse<Exam[]>> {
    const url = courseId 
      ? `${apiRoutes.admin.exams}?courseId=${courseId}`
      : apiRoutes.admin.exams;
    const response = await adminFetch(url);
    return response.json();
  }

  async linkExam(lessonId: string, examId: string): Promise<ApiResponse<any>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/lessons/${lessonId}/exam`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId }),
    });
    return response.json();
  }

  async unlinkExam(lessonId: string): Promise<ApiResponse<void>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/lessons/${lessonId}/exam`, {
      method: "DELETE",
    });
    return response.json();
  }

  // ─── Assignments ───────────────────────────────────────────────────────────

  async getAssignments(courseId?: string): Promise<ApiResponse<Assignment[]>> {
    const url = courseId
      ? `${apiRoutes.admin.assignments}?courseId=${courseId}`
      : apiRoutes.admin.assignments;
    const response = await adminFetch(url);
    return response.json();
  }

  async linkAssignment(lessonId: string, assignmentId: string): Promise<ApiResponse<any>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/lessons/${lessonId}/assignment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId }),
    });
    return response.json();
  }

  async unlinkAssignment(lessonId: string): Promise<ApiResponse<void>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/lessons/${lessonId}/assignment`, {
      method: "DELETE",
    });
    return response.json();
  }

  // ─── Certificates ──────────────────────────────────────────────────────────

  async getCertificateTemplates(): Promise<ApiResponse<CertificateTemplate[]>> {
    const response = await adminFetch(`${apiRoutes.admin.certificates}/templates`);
    return response.json();
  }

  async assignCertificateTemplate(courseId: string, templateId: string): Promise<ApiResponse<any>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}/certificate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId }),
    });
    return response.json();
  }

  async removeCertificateTemplate(courseId: string): Promise<ApiResponse<void>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}/certificate`, {
      method: "DELETE",
    });
    return response.json();
  }

  // ─── Pricing ────────────────────────────────────────────────────────────────

  async getPricing(courseId: string): Promise<ApiResponse<Pricing[]>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}/pricing`);
    return response.json();
  }

  async updatePricing(courseId: string, data: Partial<Pricing>[]): Promise<ApiResponse<Pricing[]>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}/pricing`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pricings: data }),
    });
    return response.json();
  }

  // ─── SEO ────────────────────────────────────────────────────────────────────

  async getSEO(courseId: string): Promise<ApiResponse<any>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}/seo`);
    return response.json();
  }

  async updateSEO(courseId: string, data: any): Promise<ApiResponse<any>> {
    const response = await adminFetch(`${apiRoutes.admin.courses}/${courseId}/seo`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  }
}

export const courseBuilderApi = new CourseBuilderApi();