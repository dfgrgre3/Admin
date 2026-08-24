"use client";

import { useCallback, useState } from "react";
import { examsApi } from "../api";
import type { Exam, Lesson } from "../types";

export function useExams(handleError: (err: unknown, defaultMessage: string) => never) {
  const [exams, setExams] = useState<Exam[]>([]);

  const loadExams = useCallback(async (_courseId?: string) => {
    try {
      const response = await examsApi.getExams();
      if (response.error) throw new Error(response.error);
      setExams(response.data || []);
    } catch (err) {
      handleError(err, "فشل تحميل الاختبارات");
    }
  }, [handleError]);

  const linkExam = useCallback(async (courseId: string, sectionId: string, lessonId: string, examId: string): Promise<Lesson | null> => {
    try {
      const response = await examsApi.linkExam(courseId, sectionId, lessonId, examId);
      if (response.error) throw new Error(response.error);
      return response.data || null;
    } catch (err) {
      handleError(err, "فشل ربط الاختبار");
      return null;
    }
  }, [handleError]);

  const unlinkExam = useCallback(async (courseId: string, sectionId: string, lessonId: string) => {
    try {
      const response = await examsApi.unlinkExam(courseId, sectionId, lessonId);
      if (response.error) throw new Error(response.error);
    } catch (err) {
      handleError(err, "فشل فك ربط الاختبار");
    }
  }, [handleError]);

  return { exams, loadExams, linkExam, unlinkExam };
}
