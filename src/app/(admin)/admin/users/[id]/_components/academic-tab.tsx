"use client";

import type { UserDetails } from "./types";
import {
  resolveGradeLabel,
  resolveEducationTypeLabel,
} from "./types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  GraduationCap,
  School,
  Target,
  Trophy,
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { ar } from "date-fns/locale";
import * as React from "react";

export function AcademicTab({ user }: { user: UserDetails }) {
  const sortedExams = React.useMemo(
    () =>
      [...(user.examResults || [])].sort(
        (a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime()
      ),
    [user.examResults]
  );

  const avgScore = React.useMemo(() => {
    if (!sortedExams.length) return 0;
    return Math.round(
      sortedExams.reduce((s, r) => s + r.score, 0) / sortedExams.length
    );
  }, [sortedExams]);

  const passedCount = sortedExams.filter((r) => r.score >= 50).length;
  const failedCount = sortedExams.length - passedCount;
  const passRate = sortedExams.length ? Math.round((passedCount / sortedExams.length) * 100) : 0;

  // Trend: compare last 3 vs previous 3
  const trend = React.useMemo(() => {
    if (sortedExams.length < 4) return "stable";
    const recent = sortedExams.slice(0, 3).reduce((s, r) => s + r.score, 0) / 3;
    const older = sortedExams.slice(3, 6).reduce((s, r) => s + r.score, 0) / Math.min(3, sortedExams.slice(3, 6).length);
    if (recent > older + 5) return "up";
    if (recent < older - 5) return "down";
    return "stable";
  }, [sortedExams]);

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up" ? "text-success" : trend === "down" ? "text-danger" : "text-muted-foreground";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md bg-card/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                <BarChart3 className="h-5 w-5" />
              </div>
              <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">متوسط الدرجات</span>
            </div>
            <p className={`text-3xl font-black ${avgScore >= 50 ? "text-success" : "text-danger"}`}>
              {avgScore}%
            </p>
            <div className="flex items-center gap-1 mt-2">
              <TrendIcon className={`h-3.5 w-3.5 ${trendColor}`} />
              <span className={`text-xs font-medium ${trendColor}`}>
                {trend === "up" ? "في ارتفاع" : trend === "down" ? "في انخفاض" : "مستقر"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-card/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-green-500/10 text-green-500">
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">الاختبارات الناجحة</span>
            </div>
            <p className="text-3xl font-black text-success">{passedCount}</p>
            <Progress
              value={passRate}
              className="h-1.5 mt-2 bg-green-500/10"
              indicatorClassName="bg-green-500"
            />
            <p className="text-[10px] text-muted-foreground mt-1">{passRate}% نسبة النجاح</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-card/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                <XCircle className="h-5 w-5" />
              </div>
              <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">الاختبارات الراسبة</span>
            </div>
            <p className="text-3xl font-black text-danger">{failedCount}</p>
            <p className="text-[10px] text-muted-foreground mt-3">
              من أصل {sortedExams.length} اختبار
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-card/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Trophy className="h-5 w-5" />
              </div>
              <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">أعلى درجة</span>
            </div>
            <p className="text-3xl font-black text-amber-500">
              {sortedExams.length ? Math.max(...sortedExams.map((r) => r.score)) : 0}%
            </p>
            <p className="text-[10px] text-muted-foreground mt-3">
              أدنى:{" "}
              {sortedExams.length ? Math.min(...sortedExams.map((r) => r.score)) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Exam Results Table */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            نتائج الاختبارات
          </CardTitle>
          <CardDescription>
            جميع نتائج الاختبارات مرتبة من الأحدث
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-muted/50 text-xs font-black uppercase text-muted-foreground tracking-wider">
                <tr>
                  <th className="px-6 py-4">الاختبار</th>
                  <th className="px-6 py-4">المادة</th>
                  <th className="px-6 py-4">الدرجة</th>
                  <th className="px-6 py-4 text-center">الحالة</th>
                  <th className="px-6 py-4">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedExams.length > 0 ? (
                  sortedExams.map((result) => (
                    <tr
                      key={result.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-6 py-4 font-bold text-sm">
                        {result.exam.title}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge
                          variant="outline"
                          className="rounded-full text-[10px] font-bold border-primary/20 bg-primary/5 text-primary"
                        >
                          {result.exam.subject.name}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-lg font-black ${
                              result.score >= 50 ? "text-success" : "text-danger"
                            }`}
                          >
                            {result.score}%
                          </span>
                          <div className="w-16">
                            <Progress
                              value={result.score}
                              className="h-1.5"
                              indicatorClassName={result.score >= 50 ? "bg-success" : "bg-danger"}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge
                          variant={result.score >= 50 ? "secondary" : "destructive"}
                          className="rounded-full px-3"
                        >
                          {result.score >= 50 ? "ناجح" : "راسب"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {result.takenAt && isValid(new Date(result.takenAt))
                          ? format(new Date(result.takenAt), "d MMM yyyy", {
                              locale: ar,
                            })
                          : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground">
                      <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p className="font-medium">لا توجد نتائج اختبارات مسجلة حالياً</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Education & Subjects */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Education Info */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              بيانات التعليم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "المرحلة الدراسية",
                  value: resolveGradeLabel(user.gradeLevel),
                  icon: GraduationCap,
                },
                {
                  label: "نوع التعليم",
                  value: resolveEducationTypeLabel(user.educationType),
                  icon: BookOpen,
                },
                {
                  label: "الشعبة",
                  value: user.section || "غير محدد",
                  icon: Target,
                },
                {
                  label: "المدرسة",
                  value: user.school || "غير محدد",
                  icon: School,
                  fullWidth: !user.section && !user.school,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`bg-muted/30 p-4 rounded-2xl hover:bg-muted/50 transition-colors ${item.fullWidth ? "col-span-2" : ""}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      {item.label}
                    </p>
                  </div>
                  <p className="font-black text-sm truncate" title={item.value}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {user.studyGoal && (
              <div className="mt-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-3.5 w-3.5 text-primary" />
                  <p className="text-[10px] text-primary font-black uppercase tracking-wider">
                    هدف الدراسة
                  </p>
                </div>
                <p className="text-sm italic font-medium text-muted-foreground">
                  "{user.studyGoal}"
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interested Subjects */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              المواد المهتم بها
            </CardTitle>
            <CardDescription>
              {user.interestedSubjects?.length ?? 0} مادة مختارة ·{" "}
              {user._count?.subjectEnrollments ?? 0} تسجيل فعلي
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.interestedSubjects?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.interestedSubjects.map((subject, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="px-4 py-2 rounded-xl border-primary/20 bg-primary/5 text-primary font-bold text-xs hover:bg-primary/10 transition-colors cursor-default"
                  >
                    {subject}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">لا توجد مواد مختارة</p>
              </div>
            )}

            {/* Subscription info */}
            {(user.activeSubscriptionId || user.subscriptionExpiresAt) && (
              <div className="mt-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                <p className="text-xs font-black text-amber-600 uppercase tracking-wider mb-1">
                  الاشتراك
                </p>
                <p className="text-sm font-bold">
                  {user.activeSubscriptionId || "اشتراك نشط"}
                </p>
                {user.subscriptionExpiresAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ينتهي:{" "}
                    {format(new Date(user.subscriptionExpiresAt), "d MMMM yyyy", {
                      locale: ar,
                    })}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
