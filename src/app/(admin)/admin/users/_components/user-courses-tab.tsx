"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Award, TrendingUp } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Course {
  id: string;
  title: string;
  titleAr?: string;
  status: string;
  progress: number;
  enrolledAt: string;
  completedAt?: string;
  grade?: number;
  certificateUrl?: string;
}

interface UserCoursesTabProps {
  userId: string;
}

export function UserCoursesTab({ userId: _userId }: UserCoursesTabProps) {
  const [courses] = React.useState<Course[]>([]);
  const [loading] = React.useState(false);

  if (loading) {
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

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">إجمالي الكورسات</p>
              <p className="text-2xl font-black">{courses.length}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">مكتملة</p>
              <p className="text-2xl font-black">
                {courses.filter((c) => c.status === "COMPLETED").length}
              </p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">قيد التقدم</p>
              <p className="text-2xl font-black">
                {courses.filter((c) => c.status === "IN_PROGRESS").length}
              </p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">متوسط التقدم</p>
              <p className="text-2xl font-black">
                {courses.length > 0
                  ? Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length)
                  : 0}
                %
              </p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Courses List */}
      <AdminCard variant="glass" className="p-6">
        <h3 className="text-xl font-black mb-4">الكورسات المسجل بها</h3>
        {courses.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">لم يسجل في أي كورس بعد</p>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-white">
                      {course.titleAr || course.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      تاريخ التسجيل: {formatDate(course.enrolledAt)}
                    </p>
                    {course.grade && (
                      <p className="text-sm text-muted-foreground">
                        الدرجة: {course.grade}%
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <p className="text-sm font-bold text-muted-foreground">التقدم</p>
                    <p className="text-lg font-black text-primary">{course.progress}%</p>
                  </div>
                  <Badge
                    variant={
                      course.status === "COMPLETED"
                        ? "default"
                        : course.status === "IN_PROGRESS"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {course.status === "COMPLETED"
                      ? "مكتمل"
                      : course.status === "IN_PROGRESS"
                      ? "قيد التقدم"
                      : "لم يبدأ"}
                  </Badge>
                  {course.certificateUrl && (
                    <Badge variant="default" className="gap-1">
                      <Award className="h-3 w-3" />
                      شهادة
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}