"use client";

import { useCallback, useState, type MutableRefObject } from "react";
import { teachersApi } from "../api";
import type { Teacher, TeacherAssignment } from "../types";

interface Options {
  handleError: (err: unknown, defaultMessage: string) => never;
  courseIdRef: MutableRefObject<string | undefined>;
}

/** The backend only stores a single `primaryInstructorId` on the course (no
 * multi-teacher table is wired to any route — see api/teachers-api.ts), so
 * `courseTeachers` here is always 0 or 1 entries. The "role" argument on
 * assignTeacher is accepted for UI compatibility but is not persisted. */
export function useTeachers({ handleError, courseIdRef }: Options) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courseTeachers, setCourseTeachers] = useState<TeacherAssignment[]>([]);

  const loadTeachers = useCallback(async () => {
    try {
      const response = await teachersApi.getTeachers();
      if (response.error) throw new Error(response.error);
      setTeachers(response.data || []);
    } catch (err) {
      handleError(err, "فشل تحميل المعلمين");
    }
  }, [handleError]);

  const buildAssignment = useCallback((instructorId: string | undefined, pool: Teacher[]): TeacherAssignment[] => {
    if (!instructorId) return [];
    const instructor = pool.find((t) => t.id === instructorId);
    return [{
      id: instructorId,
      courseId: courseIdRef.current || "",
      instructorId,
      role: "المدرس الرئيسي",
      instructor,
    }];
  }, [courseIdRef]);

  const loadCourseTeachers = useCallback(async (id: string) => {
    try {
      const response = await teachersApi.getPrimaryInstructorId(id);
      if (response.error) throw new Error(response.error);
      setCourseTeachers(buildAssignment(response.data, teachers));
    } catch (err) {
      handleError(err, "فشل تحميل معلمي الكورس");
    }
  }, [handleError, teachers, buildAssignment]);

  const assignTeacher = useCallback(async (instructorId: string, _role: string) => {
    const id = courseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");

    try {
      const response = await teachersApi.setPrimaryInstructor(id, instructorId);
      if (response.error) throw new Error(response.error);
      setCourseTeachers(buildAssignment(instructorId, teachers));
    } catch (err) {
      handleError(err, "فشل تعيين المدرس");
    }
  }, [handleError, teachers, buildAssignment, courseIdRef]);

  const removeTeacher = useCallback(async (_instructorId: string) => {
    const id = courseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");

    try {
      const response = await teachersApi.setPrimaryInstructor(id, "");
      if (response.error) throw new Error(response.error);
      setCourseTeachers([]);
    } catch (err) {
      handleError(err, "فشل إزالة المدرس");
    }
  }, [handleError, courseIdRef]);

  return { teachers, courseTeachers, loadTeachers, loadCourseTeachers, assignTeacher, removeTeacher };
}
