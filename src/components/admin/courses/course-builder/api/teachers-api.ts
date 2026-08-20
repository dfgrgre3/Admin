"use client";

import { instructorsApi } from "@/lib/api/instructors-api";
import { courseApi } from "@/lib/api/course-api";
import type { Teacher, ApiResponse } from "../types";

// ─── Teachers / Instructors ────────────────────────────────────────────────────
// The Go backend has a real "add instructor to course with a role" domain
// method (CourseService.AddInstructor / repo.AddCourseInstructor), but it is
// not wired to any REST route yet — so multi-teacher assignment with roles
// cannot be reached from the admin panel today. What *is* reachable is the
// single `primaryInstructorId` field on Course itself, so that's what this
// module wires up for real. See TeachersStep.tsx for the simplified UI that
// matches this reality.

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

  /** Returns the course's current primary instructor id, or undefined if none set. */
  async getPrimaryInstructorId(courseId: string): Promise<ApiResponse<string | undefined>> {
    const response = await courseApi.getCourse(courseId);
    return { data: response.course.primaryInstructorId || undefined, error: undefined };
  },

  async setPrimaryInstructor(courseId: string, instructorId: string): Promise<ApiResponse<void>> {
    await courseApi.updateCourse(courseId, { primaryInstructorId: instructorId });
    return { data: undefined, error: undefined };
  },
};
