"use client";

import { courseApi } from "@/lib/api/course-api";
import type { Chapter, ApiResponse } from "../types";
import { sectionToChapter } from "./mappers";

// ─── Chapters (Sections) ───────────────────────────────────────────────────────
// Fully wired to the real Go backend (CourseRESTHandler sections routes).

export const chaptersApi = {
  async getChapters(courseId: string): Promise<ApiResponse<Chapter[]>> {
    const response = await courseApi.listSections(courseId);
    return { data: response.sections.map(sectionToChapter), error: undefined };
  },

  async createChapter(
    courseId: string,
    data: { title: string; orderIndex: number; availableFrom?: string | null; dripDelayDays?: number | null }
  ): Promise<ApiResponse<Chapter>> {
    const response = await courseApi.createSection(courseId, {
      title: data.title,
      orderIndex: data.orderIndex,
      availableFrom: data.availableFrom ? new Date(data.availableFrom).getTime() : undefined,
      dripDelayDays: data.dripDelayDays || undefined,
    });
    return { data: sectionToChapter(response.section), error: undefined };
  },

  async updateChapter(courseId: string, chapterId: string, data: Partial<Chapter>): Promise<ApiResponse<Chapter>> {
    const response = await courseApi.updateSection(courseId, chapterId, {
      title: data.title,
      orderIndex: data.orderIndex,
      availableFrom: data.availableFrom ? new Date(data.availableFrom).getTime() : undefined,
      dripDelayDays: data.dripDelayDays ?? undefined,
    });
    return { data: sectionToChapter(response.section), error: undefined };
  },

  async deleteChapter(courseId: string, chapterId: string): Promise<ApiResponse<void>> {
    await courseApi.deleteSection(courseId, chapterId);
    return { data: undefined, error: undefined };
  },

  async reorderChapters(courseId: string, chapterIds: string[]): Promise<ApiResponse<Chapter[]>> {
    await courseApi.reorderSections(courseId, chapterIds);
    return this.getChapters(courseId);
  },
};
