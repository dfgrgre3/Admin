"use client";

import { adminApi } from "@/lib/api/admin-api";
import type { Exam, ApiResponse } from "../types";
import { unsupported } from "./mappers";

interface ExamApiItem {
  id: string;
  title: string;
  duration: number;
  questionCount: number;
  isActive: boolean;
}

// ─── Exams ──────────────────────────────────────────────────────────────────────
// Listing is real (GET /api/admin/exams). Exams in this backend belong to a
// Subject, not a Course or Lesson — there is no field anywhere to record
// "this exam is linked to this lesson" — so linking/unlinking stays
// unsupported until the backend grows that relation.

export const examsApi = {
  async getExams(): Promise<ApiResponse<Exam[]>> {
    const response = await adminApi.get<{ items?: ExamApiItem[]; exams?: ExamApiItem[] }>("/exams", { limit: 100 });
    const items = response.items || response.exams || [];
    const exams: Exam[] = items.map((item) => ({
      id: item.id,
      title: item.title,
      type: "QUIZ",
      questionsCount: item.questionCount,
      duration: item.duration,
      isPublished: item.isActive,
    }));
    return { data: exams, error: undefined };
  },

  async linkExam(): Promise<ApiResponse<null>> {
    return unsupported<null>("ربط الاختبارات بالدروس");
  },

  async unlinkExam(): Promise<ApiResponse<void>> {
    return unsupported<void>("فك ربط الاختبارات");
  },
};
