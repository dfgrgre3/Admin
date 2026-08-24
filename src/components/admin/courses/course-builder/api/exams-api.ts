"use client";

import { adminApi } from "@/lib/api/admin-api";
import { courseApi } from "@/lib/api/course-api";
import type { Exam, Lesson, ApiResponse } from "../types";
import { lessonToLesson } from "./mappers";

interface ExamApiItem {
  id: string;
  title: string;
  duration: number;
  questionCount: number;
  isActive: boolean;
}

// ─── Exams ──────────────────────────────────────────────────────────────────────
// Listing is real (GET /api/admin/exams) — exams still belong to a legacy
// Subject, not a Course. Linking is now real too: LmsLesson.examId is a loose
// reference to that same Exam table (course_lesson_exam_handler.go, routes at
// .../lessons/:lessonId/exam), one exam per lesson.

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

  async linkExam(courseId: string, sectionId: string, lessonId: string, examId: string): Promise<ApiResponse<Lesson>> {
    const response = await courseApi.linkLessonExam(courseId, sectionId, lessonId, examId);
    return { data: lessonToLesson(response.lesson), error: undefined };
  },

  async unlinkExam(courseId: string, sectionId: string, lessonId: string): Promise<ApiResponse<void>> {
    await courseApi.unlinkLessonExam(courseId, sectionId, lessonId);
    return { data: undefined, error: undefined };
  },
};
