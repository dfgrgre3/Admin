"use client";

import { useCallback, useState } from "react";
import { examsApi } from "../api";
import type { Exam } from "../types";

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

  const linkExam = useCallback(async (_lessonId: string, _examId: string) => {
    try {
      const response = await examsApi.linkExam();
      if (response.error) throw new Error(response.error);
    } catch (err) {
      handleError(err, "فشل ربط الاختبار");
    }
  }, [handleError]);

  const unlinkExam = useCallback(async (_lessonId: string) => {
    try {
      const response = await examsApi.unlinkExam();
      if (response.error) throw new Error(response.error);
    } catch (err) {
      handleError(err, "فشل فك ربط الاختبار");
    }
  }, [handleError]);

  return { exams, loadExams, linkExam, unlinkExam };
}
