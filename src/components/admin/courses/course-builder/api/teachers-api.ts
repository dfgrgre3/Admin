"use client";

import { instructorsApi } from "@/lib/api/instructors-api";
import { courseApi } from "@/lib/api/course-api";
import type { Teacher, TeacherAssignment, ApiResponse } from "../types";

// ─── Teachers / Instructors ────────────────────────────────────────────────────
// Real multi-teacher assignment via LmsInstructor (course_instructors_handler.go,
// routes at /api/admin/courses/:id/instructors). The Go response only carries
// {courseId, instructorId, role, permissions} — no joined instructor summary —
// so `instructor` is filled in locally by matching against the already-loaded
// teacher pool from getTeachers() rather than requiring a backend join.

export const teachersApi = {
  async getTeachers(): Promise<ApiResponse<Teacher[]>> {
    const response = await instructorsApi.getInstructors({ limit: 100, status: "APPROVED" });
    const teachers: Teacher[] = (response.instructors || []).map((instructor) => ({
      id: instructor.id,
      name: instructor.name,
      avatar: instructor.avatar || null,
      email: instructor.email,
      specialization: instructor.specialties?.[0] || null,
      status: instructor.status,
    }));
    return { data: teachers, error: undefined };
  },

  async getCourseInstructors(courseId: string, teacherPool: Teacher[]): Promise<ApiResponse<TeacherAssignment[]>> {
    const response = await courseApi.listCourseInstructors(courseId);
    const assignments: TeacherAssignment[] = (response.instructors || []).map((row) => ({
      id: row.instructorId,
      courseId: row.courseId,
      instructorId: row.instructorId,
      role: row.role,
      permissions: row.permissions || undefined,
      instructor: teacherPool.find((t) => t.id === row.instructorId),
    }));
    return { data: assignments, error: undefined };
  },

  async assignInstructor(courseId: string, instructorId: string, role: string): Promise<ApiResponse<void>> {
    await courseApi.addCourseInstructor(courseId, instructorId, role);
    return { data: undefined, error: undefined };
  },

  async removeInstructor(courseId: string, instructorId: string): Promise<ApiResponse<void>> {
    await courseApi.removeCourseInstructor(courseId, instructorId);
    return { data: undefined, error: undefined };
  },
};
