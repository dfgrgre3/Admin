"use client";

import { courseApi } from "@/lib/api/course-api";
import type { Attachment, ApiResponse } from "../types";
import { uploadWithProgress } from "./videos-api";

// ─── Files / Attachments ────────────────────────────────────────────────────────
// Upload goes through the generic /api/admin/upload storage endpoint (same as
// videos), then the resulting URL/size/type are saved as an attachment row via
// the real Go backend routes on the hexagonal Course/Section/Lesson model
// (POST/DELETE .../courses/:id/sections/:sectionId/lessons/:lessonId/attachments).
// List comes back embedded on the lesson itself (Lesson.attachments), same as
// the video mediaUrl pattern — no separate list endpoint is needed.

export const filesApi = {
  async uploadFile(
    courseId: string,
    sectionId: string,
    lessonId: string,
    file: File,
    onProgress?: (pct: number) => void
  ): Promise<ApiResponse<Attachment>> {
    const uploaded = await uploadWithProgress(file, "lesson-attachment", "document", onProgress);
    const response = await courseApi.addLessonAttachment(courseId, sectionId, lessonId, {
      title: file.name,
      fileUrl: uploaded.fileUrl,
      fileType: uploaded.mimeType,
      fileSize: uploaded.fileSize,
    });
    return { data: response.attachment, error: undefined };
  },

  async deleteFile(courseId: string, sectionId: string, lessonId: string, attachmentId: string): Promise<ApiResponse<void>> {
    await courseApi.deleteLessonAttachment(courseId, sectionId, lessonId, attachmentId);
    return { data: undefined, error: undefined };
  },
};
