"use client";

import { useCallback, useState, type MutableRefObject } from "react";
import { teachersApi } from "../api";
import type { Teacher, TeacherAssignment } from "../types";

interface Options {
  handleError: (err: unknown, defaultMessage: string) => never;
  courseIdRef: MutableRefObject<string | undefined>;
}

/** Real multi-teacher assignment against LmsInstructor (see api/teachers-api.ts).
 * `courseTeachers` can now hold any number of assigned instructors with roles. */
export function useTeachers({ handleError, courseIdRef }: Options) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courseTeachers, setCourseTeachers] = useState<TeacherAssignment[]>([]);

  const loadTeachers = useCallback(async () => {
    try {
      const response = await teachersApi.getTeachers();
      if (response.error) throw new Error(response.error);
      setTeachers(response.data || []);
      return response.data || [];
    } catch (err) {
      handleError(err, "فشل تحميل المعلمين");
      return [];
    }
  }, [handleError]);

  const loadCourseTeachers = useCallback(async (id: string) => {
    try {
      const response = await teachersApi.getCourseInstructors(id, teachers);
      if (response.error) throw new Error(response.error);
      setCourseTeachers(response.data || []);
    } catch (err) {
      handleError(err, "فشل تحميل معلمي الكورس");
    }
  }, [handleError, teachers]);

  const assignTeacher = useCallback(async (instructorId: string, role: string) => {
    const id = courseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");

    try {
      const response = await teachersApi.assignInstructor(id, instructorId, role);
      if (response.error) throw new Error(response.error);
      await loadCourseTeachers(id);
    } catch (err) {
      handleError(err, "فشل تعيين المدرس");
    }
  }, [handleError, loadCourseTeachers, courseIdRef]);

  const removeTeacher = useCallback(async (instructorId: string) => {
    const id = courseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");

    try {
      const response = await teachersApi.removeInstructor(id, instructorId);
      if (response.error) throw new Error(response.error);
      await loadCourseTeachers(id);
    } catch (err) {
      handleError(err, "فشل إزالة المدرس");
    }
  }, [handleError, loadCourseTeachers, courseIdRef]);

  return { teachers, courseTeachers, loadTeachers, loadCourseTeachers, assignTeacher, removeTeacher };
}
