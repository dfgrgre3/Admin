"use client";

import * as React from "react";
import { CourseList, CourseLoadingState } from "../_tabs/_courses/course-list";
import { CourseStats } from "../_tabs/_courses/course-stats";
import type { Course, UserCoursesTabProps } from "../_tabs/_courses/course-types";

export function UserCoursesTab({ userId: _userId }: UserCoursesTabProps) {
  const [courses] = React.useState<Course[]>([]);
  const [loading] = React.useState(false);

  if (loading) return <CourseLoadingState />;

  return (
    <div className="space-y-4">
      <CourseStats courses={courses} />
      <CourseList courses={courses} />
    </div>
  );
}