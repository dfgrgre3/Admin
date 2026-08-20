"use client";

import { courseApi } from "@/lib/api/course-api";
import type { Lesson, ApiResponse } from "../types";
import { lessonToLesson } from "./mappers";

interface LessonInput {
  title: string;
  type: "VIDEO" | "TEXT" | "AUDIO" | "FILE" | "EXTERNAL_LINK" | "INTERACTIVE_QUIZ";
  content?: string | null;
  mediaUrl?: string | null;
  durationSeconds?: number;
  isFreePreview?: boolean;
  orderIndex?: number;
  availabilityType?: "CALENDAR_DATE" | "ENROLLMENT_RELATIVE";
  availableFrom?: string | null;
  dripDelayDays?: number | null;
}

function toBackendPayload(data: Partial<LessonInput>) {
  return {
    content: data.content ?? undefined,
    mediaUrl: data.mediaUrl ?? undefined,
    durationSeconds: data.durationSeconds,
    isFreePreview: data.isFreePreview,
    orderIndex: data.orderIndex,
    availabilityType: data.availabilityType,
    availableFrom: data.availableFrom ? new Date(data.availableFrom).getTime() : undefined,
    dripDelayDays: data.dripDelayDays ?? undefined,
  };
}

// ─── Lessons ────────────────────────────────────────────────────────────────────
// Fully wired to the real Go backend (CourseRESTHandler lessons routes).

export const lessonsApi = {
  async getLessons(courseId: string, sectionId: string): Promise<ApiResponse<Lesson[]>> {
    const response = await courseApi.listLessons(courseId, sectionId);
    return { data: (response.lessons || []).map(lessonToLesson), error: undefined };
  },

  async createLesson(courseId: string, sectionId: string, data: Partial<LessonInput>): Promise<ApiResponse<Lesson>> {
    const response = await courseApi.createLesson(courseId, sectionId, {
      title: data.title || "",
      type: data.type || "TEXT",
      ...toBackendPayload(data),
    });
    return { data: lessonToLesson(response.lesson), error: undefined };
  },

  async updateLesson(courseId: string, sectionId: string, lessonId: string, data: Partial<LessonInput>): Promise<ApiResponse<Lesson>> {
    const response = await courseApi.updateLesson(courseId, sectionId, lessonId, {
      title: data.title,
      type: data.type,
      ...toBackendPayload(data),
    });
    return { data: lessonToLesson(response.lesson), error: undefined };
  },

  async deleteLesson(courseId: string, sectionId: string, lessonId: string): Promise<ApiResponse<void>> {
    await courseApi.deleteLesson(courseId, sectionId, lessonId);
    return { data: undefined, error: undefined };
  },

  async reorderLessons(courseId: string, sectionId: string, lessonIds: string[]): Promise<ApiResponse<Lesson[]>> {
    await courseApi.reorderLessons(courseId, sectionId, lessonIds);
    return this.getLessons(courseId, sectionId);
  },
};
