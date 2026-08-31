"use client";

import { Award, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Course } from "./course-types";
import { getCourseStatusLabel, getCourseStatusVariant } from "./course-status";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          <BookOpen className="h-6 w-6" />
        </div>
        <div>
          <p className="font-bold text-white">{course.titleAr || course.title}</p>
          <p className="text-sm text-muted-foreground">
            تاريخ التسجيل: {formatDate(course.enrolledAt)}
          </p>
          {course.grade ? (
            <p className="text-sm text-muted-foreground">الدرجة: {course.grade}%</p>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-left">
          <p className="text-sm font-bold text-muted-foreground">التقدم</p>
          <p className="text-lg font-black text-primary">{course.progress}%</p>
        </div>
        <Badge variant={getCourseStatusVariant(course.status)}>
          {getCourseStatusLabel(course.status)}
        </Badge>
        {course.certificateUrl ? (
          <Badge variant="default" className="gap-1">
            <Award className="h-3 w-3" />
            شهادة
          </Badge>
        ) : null}
      </div>
    </div>
  );
}