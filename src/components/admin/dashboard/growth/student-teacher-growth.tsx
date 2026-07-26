"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Users, UserPlus, GraduationCap, User, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentTeacherGrowthProps {
  totalStudents: number;
  activeStudents: number;
  newStudentsToday: number;
  newStudentsThisWeek: number;
  studentGrowthRate: number;
  totalTeachers: number;
  activeTeachers: number;
  newTeachersToday: number;
  newTeachersThisWeek: number;
  teacherGrowthRate: number;
  className?: string;
}

export function StudentTeacherGrowth({
  totalStudents,
  activeStudents,
  newStudentsToday,
  newStudentsThisWeek,
  studentGrowthRate,
  totalTeachers,
  activeTeachers,
  newTeachersToday,
  newTeachersThisWeek,
  teacherGrowthRate,
  className
}: StudentTeacherGrowthProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {/* Student Growth */}
      <AdminCard variant="glass" className="border-primary/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span>نمو الطلاب</span>
          </h3>
          <div className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold",
            studentGrowthRate >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
          )}>
            {studentGrowthRate >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(studentGrowthRate)}% نمو
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminStatsCard
            title="إجمالي الطلاب"
            value={totalStudents.toLocaleString()}
            icon={Users}
            color="blue"
            description="طالب مسجل"
            trend={{
              value: newStudentsThisWeek,
              isPositive: newStudentsThisWeek > 0,
              label: "جديد هذا الأسبوع"
            }}
          />
          <AdminStatsCard
            title="الطلاب النشطون"
            value={activeStudents.toLocaleString()}
            icon={TrendingUp}
            color="green"
            description="نشط هذا الأسبوع"
          />
          <AdminStatsCard
            title="طلاب جدد اليوم"
            value={newStudentsToday.toLocaleString()}
            icon={UserPlus}
            color="purple"
            description="تسجيلات اليوم"
          />
          <AdminStatsCard
            title="طلاب جدد أسبوعياً"
            value={newStudentsThisWeek.toLocaleString()}
            icon={GraduationCap}
            color="amber"
            description="هذا الأسبوع"
          />
        </div>
      </AdminCard>

      {/* Teacher Growth */}
      <AdminCard variant="glass" className="border-primary/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <span>نمو المعلمين</span>
          </h3>
          <div className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold",
            teacherGrowthRate >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
          )}>
            {teacherGrowthRate >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(teacherGrowthRate)}% نمو
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminStatsCard
            title="إجمالي المعلمين"
            value={totalTeachers.toLocaleString()}
            icon={User}
            color="blue"
            description="معلم مسجل"
            trend={{
              value: newTeachersThisWeek,
              isPositive: newTeachersThisWeek > 0,
              label: "جديد هذا الأسبوع"
            }}
          />
          <AdminStatsCard
            title="المعلمون النشطون"
            value={activeTeachers.toLocaleString()}
            icon={TrendingUp}
            color="green"
            description="نشط هذا الأسبوع"
          />
          <AdminStatsCard
            title="معلمون جدد اليوم"
            value={newTeachersToday.toLocaleString()}
            icon={UserPlus}
            color="purple"
            description="تسجيلات اليوم"
          />
          <AdminStatsCard
            title="معلمون جدد أسبوعياً"
            value={newTeachersThisWeek.toLocaleString()}
            icon={GraduationCap}
            color="amber"
            description="هذا الأسبوع"
          />
        </div>
      </AdminCard>
    </div>
  );
}
