"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { FileText, ClipboardList, Clock, Users, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface Exam {
  id: string;
  title: string;
  subject: string;
  questions: number;
  participants: number;
  status: "scheduled" | "active" | "completed" | "draft";
  date: string;
  duration: string;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  submissions: number;
  totalStudents: number;
  status: "pending" | "active" | "closed";
  dueDate: string;
}

interface LatestExamsAssignmentsProps {
  exams: Exam[];
  assignments: Assignment[];
  className?: string;
}

export function LatestExamsAssignments({ exams, assignments, className }: LatestExamsAssignmentsProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {/* Latest Exams */}
      <AdminCard variant="glass" className="border-primary/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>آخر الامتحانات</span>
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>محدث تلقائياً</span>
          </div>
        </div>

        {exams.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
            <FileText className="w-8 h-8 text-gray-700 mx-auto mb-2" />
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
              لا توجد امتحانات
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {exams.map((exam) => {
              const statusConfig = {
                scheduled: { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "مجدول" },
                active: { color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20", label: "نشط" },
                completed: { color: "text-gray-500", bg: "bg-gray-500/10", border: "border-gray-500/20", label: "مكتمل" },
                draft: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "مسودة" },
              };
              const status = statusConfig[exam.status];

              return (
                <div
                  key={exam.id}
                  className={cn("p-4 rounded-xl border transition-all hover:border-primary/30", status.bg, status.border)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn("text-xs font-bold px-2 py-0.5 rounded", status.color, status.bg)}>
                          {status.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{exam.subject}</span>
                      </div>
                      <h4 className="font-bold text-sm">{exam.title}</h4>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {exam.questions} سؤال
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {exam.participants} مشارك
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {exam.duration}
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-muted-foreground">{exam.date}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AdminCard>

      {/* Latest Assignments */}
      <AdminCard variant="glass" className="border-primary/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <span>آخر الواجبات</span>
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>محدث تلقائياً</span>
          </div>
        </div>

        {assignments.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
            <ClipboardList className="w-8 h-8 text-gray-700 mx-auto mb-2" />
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
              لا توجد واجبات
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => {
              const statusConfig = {
                pending: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "قيد الانتظار" },
                active: { color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20", label: "نشط" },
                closed: { color: "text-gray-500", bg: "bg-gray-500/10", border: "border-gray-500/20", label: "مغلق" },
              };
              const status = statusConfig[assignment.status];
              const submissionRate = assignment.totalStudents > 0 
                ? Math.round((assignment.submissions / assignment.totalStudents) * 100) 
                : 0;

              return (
                <div
                  key={assignment.id}
                  className={cn("p-4 rounded-xl border transition-all hover:border-primary/30", status.bg, status.border)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn("text-xs font-bold px-2 py-0.5 rounded", status.color, status.bg)}>
                          {status.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{assignment.subject}</span>
                      </div>
                      <h4 className="font-bold text-sm">{assignment.title}</h4>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {assignment.submissions}/{assignment.totalStudents} تسليم
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {submissionRate}% نسبة التسليم
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-muted-foreground">موعد التسليم</p>
                      <p className="text-xs font-bold">{assignment.dueDate}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
