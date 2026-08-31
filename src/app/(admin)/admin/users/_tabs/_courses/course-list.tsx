"use client";

import { AdminCard } from "@/components/admin/ui/admin-card";
import type { Course } from "./course-types";
import { CourseCard } from "./course-card";

interface CourseListProps {
  courses: Course[];
}

export function CourseList({ courses }: CourseListProps) {
  return (
    <AdminCard variant="glass" className="p-6">
      <h3 className="text-xl font-black mb-4">الكورسات المسجل بها</h3>
      {courses.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">لم يسجل في أي كورس بعد</p>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </AdminCard>
  );
}

export function CourseLoadingState() {
  return (
    <AdminCard variant="glass" className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-white/5 rounded w-1/3"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    </AdminCard>
  );
}