"use client";

import { courseApi } from "@/lib/api/course-api";
import type { Pricing, ApiResponse } from "../types";

// ─── Pricing ────────────────────────────────────────────────────────────────────
// Fully wired to the real Go backend (CourseRESTHandler pricing routes).

export const pricingApi = {
  async getPricing(courseId: string): Promise<ApiResponse<Pricing[]>> {
    const response = await courseApi.getPricing(courseId);
    return { data: response.pricing ? [response.pricing as any] : [], error: undefined };
  },

  async updatePricing(courseId: string, data: Partial<Pricing>[]): Promise<ApiResponse<Pricing[]>> {
    if (data.length > 0) {
      await courseApi.setPricing(courseId, data[0] as any);
    }
    return this.getPricing(courseId);
  },
};
