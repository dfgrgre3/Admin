"use client";

import { useCallback, useState } from "react";
import { assignmentsApi } from "../api";
import type { Assignment } from "../types";

export function useAssignments(handleError: (err: unknown, defaultMessage: string) => never) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const loadAssignments = useCallback(async (_courseId?: string) => {
    try {
      const response = await assignmentsApi.getAssignments();
      if (response.error) throw new Error(response.error);
      setAssignments(response.data || []);
    } catch (err) {
      handleError(err, "فشل تحميل الواجبات");
    }
  }, [handleError]);

  const linkAssignment = useCallback(async (_lessonId: string, _assignmentId: string) => {
    try {
      const response = await assignmentsApi.linkAssignment();
      if (response.error) throw new Error(response.error);
    } catch (err) {
      handleError(err, "فشل ربط الواجب");
    }
  }, [handleError]);

  const unlinkAssignment = useCallback(async (_lessonId: string) => {
    try {
      const response = await assignmentsApi.unlinkAssignment();
      if (response.error) throw new Error(response.error);
    } catch (err) {
      handleError(err, "فشل فك ربط الواجب");
    }
  }, [handleError]);

  return { assignments, loadAssignments, linkAssignment, unlinkAssignment };
}
