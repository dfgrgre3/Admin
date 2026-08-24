"use client";

import { courseApi } from "@/lib/api/course-api";
import type { Assignment, ApiResponse } from "../types";
import { assignmentToAssignment } from "./mappers";

// ─── Assignments ────────────────────────────────────────────────────────────────
// Real course-scoped assignment catalog via LmsAssignment (course_assignment_handler.go,
// routes at /api/admin/courses/:id/assignments[...]). One assignment can be
// linked to at most one lesson (LmsAssignment.lessonId); linking/unlinking
// leaves the assignment in the course's catalog either way.

export const assignmentsApi = {
  async getAssignments(courseId: string): Promise<ApiResponse<Assignment[]>> {
    const response = await courseApi.listCourseAssignments(courseId);
    return { data: (response.assignments || []).map(assignmentToAssignment), error: undefined };
  },

  async createAssignment(courseId: string, data: { title: string; description?: string; dueDate?: number; maxScore?: number }): Promise<ApiResponse<Assignment>> {
    const response = await courseApi.createCourseAssignment(courseId, data);
    return { data: assignmentToAssignment(response.assignment), error: undefined };
  },

  async deleteAssignment(courseId: string, assignmentId: string): Promise<ApiResponse<void>> {
    await courseApi.deleteCourseAssignment(courseId, assignmentId);
    return { data: undefined, error: undefined };
  },

  async linkAssignment(courseId: string, assignmentId: string, lessonId: string): Promise<ApiResponse<Assignment>> {
    const response = await courseApi.linkAssignment(courseId, assignmentId, lessonId);
    return { data: assignmentToAssignment(response.assignment), error: undefined };
  },

  async unlinkAssignment(courseId: string, assignmentId: string): Promise<ApiResponse<void>> {
    await courseApi.unlinkAssignment(courseId, assignmentId);
    return { data: undefined, error: undefined };
  },
};
