"use client";

import { adminApi } from "@/lib/api/admin-api";
import type { ApiResponse, CourseCategory, LanguageOption } from "../types";

interface CategoryApiItem {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

// ─── Reference data ────────────────────────────────────────────────────────────

export const referenceApi = {
  /** Wired to the real /api/admin/course-categories endpoint (GET GetCategoriesForAdmin). */
  async getCategories(): Promise<ApiResponse<CourseCategory[]>> {
    const response = await adminApi.get<{ items?: CategoryApiItem[]; categories?: CategoryApiItem[] }>("/course-categories");
    const items = response.items || response.categories || [];
    const categories: CourseCategory[] = items.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      parentId: null,
    }));
    return { data: categories, error: undefined };
  },

  // Course level/language are fixed enums on the Go Course model (no dedicated
  // reference table), so these stay static rather than round-tripping the network.
  async getLevels(): Promise<ApiResponse<{ value: string; label: string }[]>> {
    return {
      data: [
        { value: "BEGINNER", label: "مبتدئ" },
        { value: "INTERMEDIATE", label: "متوسط" },
        { value: "ADVANCED", label: "متقدم" },
      ],
      error: undefined,
    };
  },

  async getLanguages(): Promise<ApiResponse<LanguageOption[]>> {
    return {
      data: [
        { code: "ar", name: "العربية" } as any,
        { code: "en", name: "English" } as any,
      ],
      error: undefined,
    };
  },
};
