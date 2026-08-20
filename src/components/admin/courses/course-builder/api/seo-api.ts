"use client";

import { courseApi } from "@/lib/api/course-api";
import type { ApiResponse, SEOData } from "../types";

// ─── SEO ────────────────────────────────────────────────────────────────────────
// SEO fields live directly on the Course record, so this is fully wired to the
// real update-course endpoint (same one BasicInfoStep/PublishStep use).

export const seoApi = {
  async getSEO(courseId: string): Promise<ApiResponse<SEOData>> {
    const course = await courseApi.getCourse(courseId);
    return {
      data: {
        seoTitle: course.course.seoTitle,
        seoDescription: course.course.seoDescription,
        seoKeywords: course.course.seoKeywords || [],
      },
      error: undefined,
    };
  },

  async updateSEO(courseId: string, data: Partial<SEOData>): Promise<ApiResponse<void>> {
    await courseApi.updateCourse(courseId, {
      seoTitle: data.seoTitle || undefined,
      seoDescription: data.seoDescription || undefined,
      seoKeywords: data.seoKeywords,
    });
    return { data: undefined, error: undefined };
  },
};
