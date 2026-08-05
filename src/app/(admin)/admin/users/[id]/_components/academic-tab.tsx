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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
  Award,
  ExternalLink,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { ar } from "date-fns/locale";
import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminUsersApi, type UserEnrollment, type UserCertificateItem } from "@/lib/api/admin-users-api";
import { adminFetch } from "@/lib/api/admin-api";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AcademicTab({ user }: { user: UserDetails }) {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const canManageUsers = hasPermission(PERMISSIONS.USERS_MANAGE);

  const {
    data: enrollmentsData,
    isLoading: loadingEnrollments,
  } = useQuery<{ total: number; avgProgress: number; enrollments: UserEnrollment[] }>({
    queryKey: ["admin", "user", user.id, "enrollments"],
    queryFn: () => adminUsersApi.getEnrollments(user.id),
    staleTime: 30_000,
  });

  const { data: certificatesData, isLoading: loadingCertificates } = useQuery<{
    total: number;
    items: UserCertificateItem[];
  }>({
    queryKey: ["admin", "user", user.id, "certificates"],
    queryFn: () => adminUsersApi.getCertificates(user.id, { limit: 50 }),
    staleTime: 30_000,
  });

  const [enrollDialogOpen, setEnrollDialogOpen] = React.useState(false);
  const [enrollCourseId, setEnrollCourseId] = React.useState("");
  const [enrollIsFree, setEnrollIsFree] = React.useState(false);

  const [unenrollTarget, setUnenrollTarget] = React.useState<UserEnrollment | null>(null);
  const [refundOnUnenroll, setRefundOnUnenroll] = React.useState(false);

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const res = await adminFetch(`/admin/users/${user.id}/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: enrollCourseId, isFree: enrollIsFree }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || data?.message || "فشل التسجيل في الكورس");
      }
    },
    onSuccess: () => {
      toast.success("تم تسجيل المستخدم في الكورس بنجاح");
      setEnrollDialogOpen(false);
      setEnrollCourseId("");
      setEnrollIsFree(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "user", user.id, "enrollments"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const unenrollMutation = useMutation({
    mutationFn: async () => {
      if (!unenrollTarget) return;
      const res = await adminFetch(`/admin/courses/unenroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          courseId: unenrollTarget.courseId,
          refund: refundOnUnenroll,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || data?.message || "فشل حذف التسجيل");
      }
    },
    onSuccess: () => {
      toast.success(refundOnUnenroll ? "تم حذف التسجيل واسترداد المبلغ للرصيد" : "تم حذف التسجيل من الكورس");
      setUnenrollTarget(null);
      setRefundOnUnenroll(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "user", user.id, "enrollments"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
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

      {/* Enrolled Courses with progress bars */}
      <Card className="border-none shadow-lg">
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              الكورسات المسجلة
            </CardTitle>
            <CardDescription>
              {enrollmentsData?.total ?? 0} كورس · متوسط التقدم{" "}
              {enrollmentsData ? Math.round(enrollmentsData.avgProgress) : 0}%
            </CardDescription>
          </div>
          {canManageUsers && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => setEnrollDialogOpen(true)}
            >
              <Plus className="h-3.5 w-3.5 ml-1" />
              تسجيل في كورس
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {loadingEnrollments ? (
            <div className="flex items-center justify-center py-10">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !enrollmentsData || enrollmentsData.enrollments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">لا توجد تسجيلات كورسات لهذا المستخدم</p>
            </div>
          ) : (
            <div className="space-y-3">
              {enrollmentsData.enrollments.map((item) => {
                const pct = Math.round(item.progress);
                return (
                  <div
                    key={item.id}
                    className="group rounded-2xl border bg-muted/20 p-4 hover:border-primary/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <BookOpen className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-bold text-sm truncate">{item.courseName}</span>
                        <Badge
                          variant="outline"
                          className="rounded-full text-[10px] font-bold border-primary/20 bg-primary/5 text-primary"
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-primary">{pct}%</span>
                        {canManageUsers && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-danger hover:text-danger"
                            onClick={() => {
                              setUnenrollTarget(item);
                              setRefundOnUnenroll(false);
                            }}
                            title="حذف التسجيل"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <Progress value={pct} className="h-2" indicatorClassName="bg-primary" />
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      سُجّل في{" "}
                      {isValid(new Date(item.enrolledAt))
                        ? format(new Date(item.enrolledAt), "d MMM yyyy", { locale: ar })
                        : "-"}
                      {item.price > 0 && (
                        <span className="mr-2">· السعر: {item.price} ج.م</span>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificates */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            الشهادات
          </CardTitle>
          <CardDescription>
            {certificatesData?.total ?? 0} شهادة حصل عليها المستخدم
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loadingCertificates ? (
            <div className="flex items-center justify-center py-10">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : certificatesData && certificatesData.items.length > 0 ? (
            <div className="divide-y">
              {certificatesData.items.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between gap-3 p-4 px-6 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                      <Award className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{cert.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {cert.courseName}
                        {cert.grade != null && (
                          <span className="mr-2 text-primary font-bold">
                            {cert.grade >= 50 ? "ناجح" : "راسب"} · {cert.grade}%
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        صدرت في{" "}
                        {isValid(new Date(cert.issuedAt))
                          ? format(new Date(cert.issuedAt), "d MMM yyyy", { locale: ar })
                          : "-"}
                      </p>
                    </div>
                  </div>
                  {cert.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl shrink-0"
                      onClick={() => window.open(cert.url!, "_blank", "noopener,noreferrer")}
                    >
                      <ExternalLink className="h-3.5 w-3.5 ml-1" />
                      عرض
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Award className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">لا توجد شهادات مسجلة لهذا المستخدم</p>
            </div>
          )}
        </CardContent>
      </Card>

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
                  «{user.studyGoal}»
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

      {/* Enroll in a new course dialog */}
      <Dialog open={enrollDialogOpen} onOpenChange={(open) => {
        setEnrollDialogOpen(open);
        if (!open) { setEnrollCourseId(""); setEnrollIsFree(false); }
      }}>
        <DialogContent className="rounded-[2rem] border-white/10 bg-card/95 backdrop-blur-xl max-w-md" dir="rtl">
          <DialogHeader className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
              <Plus className="h-8 w-8" />
            </div>
            <DialogTitle className="text-center text-2xl font-black tracking-tight">
              تسجيل في كورس جديد
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground font-medium px-4">
              أدخل معرّف الكورس (ID) لتسجيل {user.name || user.email} فيه يدويًا.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">معرّف الكورس (Course ID)</label>
              <Input
                className="h-12 rounded-2xl bg-accent/10 border-white/10 px-4 text-sm focus:ring-1 ring-primary outline-none"
                placeholder="مثال: 3f2a1b9c-..."
                value={enrollCourseId}
                onChange={(e) => setEnrollCourseId(e.target.value)}
              />
            </div>
            <label className="flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-bold cursor-pointer">
              <Checkbox checked={enrollIsFree} onCheckedChange={(checked) => setEnrollIsFree(!!checked)} />
              تسجيل مجاني (تجاوز الدفع)
            </label>
          </div>
          <DialogFooter className="mt-6 flex-col-reverse sm:flex-row gap-3 sm:gap-0">
            <Button variant="outline" className="rounded-2xl h-12 flex-1" onClick={() => { setEnrollDialogOpen(false); setEnrollCourseId(""); setEnrollIsFree(false); }} type="button">
              إلغاء
            </Button>
            <Button
              variant="default"
              disabled={!enrollCourseId.trim() || enrollMutation.isPending}
              type="button"
              className="rounded-2xl h-12 flex-1"
              onClick={() => enrollMutation.mutate()}
            >
              {enrollMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
              تسجيل الكورس
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unenroll confirmation with refund option */}
      <Dialog open={!!unenrollTarget} onOpenChange={(open) => { if (!open) { setUnenrollTarget(null); setRefundOnUnenroll(false); } }}>
        <DialogContent className="rounded-[2rem] border-white/10 bg-card/95 backdrop-blur-xl max-w-md" dir="rtl">
          <DialogHeader className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger border border-danger/20">
              <Trash2 className="h-8 w-8" />
            </div>
            <DialogTitle className="text-center text-2xl font-black tracking-tight">
              حذف التسجيل من الكورس
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground font-medium px-4">
              هل أنت متأكد من حذف تسجيل {user.name || user.email} من كورس «{unenrollTarget?.courseName}»؟ سيتم حذف تقدمه في الدروس.
            </DialogDescription>
          </DialogHeader>
          {unenrollTarget && unenrollTarget.price > 0 && (
            <label className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-3 text-xs font-bold cursor-pointer">
              <Checkbox checked={refundOnUnenroll} onCheckedChange={(checked) => setRefundOnUnenroll(!!checked)} />
              استرداد المبلغ ({unenrollTarget.price} ج.م) إلى رصيد المحفظة
            </label>
          )}
          <DialogFooter className="mt-6 flex-col-reverse sm:flex-row gap-3 sm:gap-0">
            <Button variant="outline" className="rounded-2xl h-12 flex-1" onClick={() => { setUnenrollTarget(null); setRefundOnUnenroll(false); }} type="button">
              إلغاء
            </Button>
            <Button
              variant="destructive"
              disabled={unenrollMutation.isPending}
              type="button"
              className="rounded-2xl h-12 flex-1"
              onClick={() => unenrollMutation.mutate()}
            >
              {unenrollMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
              تأكيد الحذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
