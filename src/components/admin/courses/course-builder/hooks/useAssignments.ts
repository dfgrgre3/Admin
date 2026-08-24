"use client";

import { useCallback, useState } from "react";
import { assignmentsApi } from "../api";
import type { Assignment } from "../types";

export function useAssignments(handleError: (err: unknown, defaultMessage: string) => never) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const loadAssignments = useCallback(async (courseId?: string) => {
    if (!courseId) {
      setAssignments([]);
      return;
    }
    try {
      const response = await assignmentsApi.getAssignments(courseId);
      if (response.error) throw new Error(response.error);
      setAssignments(response.data || []);
    } catch (err) {
      handleError(err, "فشل تحميل الواجبات");
    }
  }, [handleError]);

  // Each mutation below already gets the updated assignment back from the
  // backend, so the local list is patched directly instead of refetching the
  // whole course catalog — halves the network calls per action.
  const createAssignment = useCallback(async (courseId: string, data: { title: string; description?: string; dueDate?: number; maxScore?: number }) => {
    try {
      const response = await assignmentsApi.createAssignment(courseId, data);
      if (response.error) throw new Error(response.error);
      if (response.data) {
        setAssignments((prev) => [...prev, response.data as Assignment]);
      }
      return response.data || null;
    } catch (err) {
      handleError(err, "فشل إنشاء الواجب");
      return null;
    }
  }, [handleError]);

  const deleteAssignment = useCallback(async (courseId: string, assignmentId: string) => {
    try {
      const response = await assignmentsApi.deleteAssignment(courseId, assignmentId);
      if (response.error) throw new Error(response.error);
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    } catch (err) {
      handleError(err, "فشل حذف الواجب");
    }
  }, [handleError]);

  const linkAssignment = useCallback(async (courseId: string, assignmentId: string, lessonId: string) => {
    try {
      const response = await assignmentsApi.linkAssignment(courseId, assignmentId, lessonId);
      if (response.error) throw new Error(response.error);
      setAssignments((prev) => prev.map((a) => (a.id === assignmentId ? { ...a, lessonId } : a)));
    } catch (err) {
      handleError(err, "فشل ربط الواجب");
    }
  }, [handleError]);

  const unlinkAssignment = useCallback(async (courseId: string, assignmentId: string) => {
    try {
      const response = await assignmentsApi.unlinkAssignment(courseId, assignmentId);
      if (response.error) throw new Error(response.error);
      setAssignments((prev) => prev.map((a) => (a.id === assignmentId ? { ...a, lessonId: undefined } : a)));
    } catch (err) {
      handleError(err, "فشل فك ربط الواجب");
    }
  }, [handleError]);

  return { assignments, loadAssignments, createAssignment, deleteAssignment, linkAssignment, unlinkAssignment };
}
