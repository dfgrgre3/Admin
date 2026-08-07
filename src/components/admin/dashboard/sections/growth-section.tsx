"use client";

import * as React from "react";
import { StudentTeacherGrowth } from "@/components/admin/dashboard/growth/student-teacher-growth";
import type { DashboardTeachersData, DashboardUsersData } from "@/lib/dashboard-payload-mapper";

interface GrowthSectionProps {
  users: DashboardUsersData;
  teachers: DashboardTeachersData;
}

export const GrowthSection = React.memo(function GrowthSection({ users, teachers }: GrowthSectionProps) {
  return (
    <StudentTeacherGrowth
      totalStudents={users.totalUsers}
      activeStudents={users.activeStudents}
      newStudentsToday={users.newUsersToday}
      newStudentsThisWeek={users.newUsersThisWeek}
      studentGrowthRate={users.studentGrowthRate}
      totalTeachers={teachers.totalTeachers}
      activeTeachers={teachers.activeTeachers}
      newTeachersToday={teachers.newTeachersToday}
      newTeachersThisWeek={teachers.newTeachersThisWeek}
      teacherGrowthRate={teachers.teacherGrowthRate}
    />
  );
});
