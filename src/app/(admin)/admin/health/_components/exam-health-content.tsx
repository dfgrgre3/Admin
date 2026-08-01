"use client";

import { Activity, Zap, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AdminCard, AdminStatsCard } from "@/components/admin/ui/admin-card";
import type { ExamHealth } from "../_types/health";

interface ExamStatsCardsProps {
  exams: ExamHealth | undefined;
}

const numberFormatter = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 1 });

export function ExamStatsCards({ exams }: ExamStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <AdminStatsCard
        title="إجمالي الامتحانات"
        value={exams ? exams.totalExams.toLocaleString("ar-EG") : "—"}
        description="امتحانات مسجلة في النظام"
        icon={Activity}
        color="blue"
      />
      <AdminStatsCard
        title="امتحانات مفعّلة"
        value={exams ? exams.enabledExams.toLocaleString("ar-EG") : "—"}
        description="متاحة للاستخدام وليست جلسات جارية"
        icon={Zap}
        color="yellow"
      />
      <AdminStatsCard
        title="محاولات ناجحة"
        value={exams ? exams.passedAttempts.toLocaleString("ar-EG") : "—"}
        description="خلال النطاق المحدد"
        icon={CheckCircle}
        color="green"
      />
      <AdminStatsCard
        title="محاولات راسبة"
        value={exams ? exams.failedAttempts.toLocaleString("ar-EG") : "—"}
        description="خلال النطاق المحدد"
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
  if (!exams) return null;

  const successRate = Math.min(100, Math.max(0, exams.successRate));

  return (
    <AdminCard variant="glass">
      <h3 className="mb-4 text-xl font-black">نتائج المحاولات</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">نسبة المحاولات الناجحة في النطاق</span>
          <span className="text-2xl font-black text-green-500">{numberFormatter.format(successRate)}%</span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${successRate}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">متوسط المدة المحددة للامتحانات</span>
          <span className="font-bold">{numberFormatter.format(exams.averageDuration)} دقيقة</span>
        </div>
      </div>
    </AdminCard>
  );
}

interface RecentIssuesListProps {
  exams: ExamHealth | undefined;
}

export function RecentIssuesList({ exams }: RecentIssuesListProps) {
  const recentIssues = exams?.recentIssues ?? [];

  if (recentIssues.length === 0) return null;

  return (
    <AdminCard variant="glass">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-black">
        <AlertTriangle className="h-5 w-5 text-yellow-500" />
        أعلى الامتحانات في المحاولات الراسبة
      </h3>
      <div className="space-y-3">
        {recentIssues.map((issue) => (
          <div
            key={`${issue.examId}-${issue.timestamp}`}
            className="flex items-center justify-between rounded-lg border border-border/50 bg-accent/20 p-3"
          >
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={cn(
                  issue.severity === "high" && "border-red-500/20 bg-red-500/10 text-red-500",
                  issue.severity === "medium" && "border-yellow-500/20 bg-yellow-500/10 text-yellow-500",
                  issue.severity === "low" && "border-blue-500/20 bg-blue-500/10 text-blue-500"
                )}
              >
                {issue.severity === "high" && "عدد مرتفع"}
                {issue.severity === "medium" && "عدد متوسط"}
                {issue.severity === "low" && "عدد منخفض"}
              </Badge>
              <div>
                <p className="text-sm font-bold">{issue.issue}</p>
                <p className="text-xs text-muted-foreground">الامتحان: {issue.examId}</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(issue.timestamp).toLocaleString("ar-EG")}
            </span>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}
