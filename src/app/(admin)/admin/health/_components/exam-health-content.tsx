"use client";

import { Activity, Zap, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AdminCard, AdminStatsCard } from "@/components/admin/ui/admin-card";
import type { ExamHealth } from "../_types/health";

interface ExamStatsCardsProps {
  exams: ExamHealth | undefined;
}

export function ExamStatsCards({ exams }: ExamStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <AdminStatsCard
        title="إجمالي الامتحانات"
        value={(exams?.totalExams || 0).toLocaleString()}
        description="في النظام"
        icon={Activity}
        color="blue"
      />
      <AdminStatsCard
        title="امتحانات نشطة"
        value={(exams?.activeExams || 0).toLocaleString()}
        description="جارٍ الآن"
        icon={Zap}
        color="yellow"
      />
      <AdminStatsCard
        title="مكتملة بنجاح"
        value={(exams?.completedExams || 0).toLocaleString()}
        description="آخر 24 ساعة"
        icon={CheckCircle}
        color="green"
      />
      <AdminStatsCard
        title="فاشلة"
        value={(exams?.failedExams || 0).toLocaleString()}
        description="تحتاج انتباه"
        icon={XCircle}
        color="red"
      />
    </div>
  );
}

interface ExamSuccessRateProps {
  exams: ExamHealth | undefined;
}

export function ExamSuccessRate({ exams }: ExamSuccessRateProps) {
  const successRate = exams?.successRate || 0;
  const averageDuration = exams?.averageDuration || 0;

  return (
    <AdminCard variant="glass">
      <h3 className="text-xl font-black mb-4">معدل النجاح</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">نسبة النجاح الإجمالية</span>
          <span className="text-2xl font-black text-green-500">{successRate}%</span>
        </div>
        <div className="w-full h-4 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${successRate}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">متوسط مدة الامتحان</span>
          <span className="font-bold">{Math.floor(averageDuration / 60)} دقيقة</span>
        </div>
      </div>
    </AdminCard>
  );
}

interface RecentIssuesListProps {
  exams: ExamHealth | undefined;
}

export function RecentIssuesList({ exams }: RecentIssuesListProps) {
  const recentIssues = exams?.recentIssues || [];

  if (recentIssues.length === 0) return null;

  return (
    <AdminCard variant="glass">
      <h3 className="text-xl font-black mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-yellow-500" />
        مشاكل حديثة
      </h3>
      <div className="space-y-3">
        {recentIssues.map((issue, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 bg-accent/20 rounded-lg border border-border/50"
          >
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={cn(
                  issue.severity === "high" && "bg-red-500/10 text-red-500 border-red-500/20",
                  issue.severity === "medium" && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                  issue.severity === "low" && "bg-blue-500/10 text-blue-500 border-blue-500/20"
                )}
              >
                {issue.severity === "high" && "عالية"}
                {issue.severity === "medium" && "متوسطة"}
                {issue.severity === "low" && "منخفضة"}
              </Badge>
              <div>
                <p className="text-sm font-bold">{issue.issue}</p>
                <p className="text-xs text-muted-foreground">امتحان: {issue.examId}</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(issue.timestamp).toLocaleString("ar-SA")}
            </span>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}