"use client";

import type { UserDetails } from "./types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  History,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  ShieldCheck,
  Zap,
  Brain,
  Bell,
  ListTodo,
  Layers,
  Timer,
  Target,
  LogIn,
  AlertTriangle,
  Video,
  MapPin,
} from "lucide-react";
import { format, isValid, formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { adminUsersApi, type LoginAttempt, type VideoEngagementResponse } from "@/lib/api/admin-users-api";

export function ActivityTab({ user }: { user: UserDetails }) {
  const totalStudyHours = Math.floor((user.totalStudyTime ?? 0) / 60);
  const totalStudyMins = (user.totalStudyTime ?? 0) % 60;

  const securityCards = [
    {
      label: "البريد الإلكتروني",
      icon: user.emailVerified ? CheckCircle : XCircle,
      status: user.emailVerified ? "موثق" : "غير موثق",
      verified: user.emailVerified,
    },
    {
      label: "التحقق الثنائي",
      icon: ShieldCheck,
      status: user.twoFactorEnabled ? "مفعّل" : "معطّل",
      verified: user.twoFactorEnabled,
    },
  ];

  const countersData = [
    {
      label: "المهام الكلية",
      value: user._count?.tasks ?? 0,
      icon: ListTodo,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "التنبيهات",
      value: user._count?.notifications ?? 0,
      icon: Bell,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "الأهداف المخصصة",
      value: user._count?.customGoals ?? 0,
      icon: Target,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "التذكيرات",
      value: user._count?.reminders ?? 0,
      icon: Timer,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "الجلسات المفتوحة",
      value: user._count?.sessions ?? 0,
      icon: Layers,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      label: "جلسات العمل العميق",
      value: user.deepWorkSessions ?? 0,
      icon: Brain,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
  ];

  const recentSessions = user.studySessions?.slice(0, 10) || [];

  const { data: loginData } = useQuery({
    queryKey: ["admin", "user", user.id, "login-attempts"],
    queryFn: (): Promise<{
      total: number;
      failedCount: number;
      attempts: LoginAttempt[];
    }> => adminUsersApi.getLoginAttempts(user.id),
    staleTime: 30_000,
  });

  const { data: videoData } = useQuery({
    queryKey: ["admin", "user", user.id, "video-engagement"],
    queryFn: (): Promise<VideoEngagementResponse> =>
      adminUsersApi.getVideoEngagement(user.id, { limit: 20 }),
    staleTime: 30_000,
  });

  // Login/logout timeline (successful logins + last login from profile).
  const loginTimeline = (loginData?.attempts ?? [])
    .filter((a) => a.success)
    .slice(0, 12);

  // Failed login attempts only (brute-force detection).
  const failedAttempts = (loginData?.attempts ?? []).filter((a) => !a.success);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Summary metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-none shadow-md bg-gradient-to-br from-blue-500/5 to-card col-span-full sm:col-span-1">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                <Clock className="h-5 w-5" />
              </div>
              <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                إجمالي وقت الدراسة
              </span>
            </div>
            <p className="text-3xl font-black">
              {totalStudyHours}
              <span className="text-lg font-bold text-muted-foreground mr-1">ساعة</span>
              {totalStudyMins > 0 && (
                <>
                  {" "}
                  {totalStudyMins}
                  <span className="text-lg font-bold text-muted-foreground mr-1">د</span>
                </>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              عبر {user._count?.studySessions ?? 0} جلسة مذاكرة
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-orange-500/5 to-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                جلسات بومودورو
              </span>
            </div>
            <p className="text-3xl font-black">{user.pomodoroSessions ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-2">
              تقريباً {Math.round((user.pomodoroSessions ?? 0) * 25 / 60)} ساعة مركّزة
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-green-500/5 to-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-green-500/10 text-green-500">
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                المهام المنجزة
              </span>
            </div>
            <p className="text-3xl font-black">{user.tasksCompleted ?? 0}</p>
            {(user._count?.tasks ?? 0) > 0 && (
              <>
                <Progress
                  value={((user.tasksCompleted ?? 0) / (user._count?.tasks ?? 1)) * 100}
                  className="h-1.5 mt-3 bg-green-500/10"
                  indicatorClassName="bg-green-500"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  من أصل {user._count?.tasks ?? 0} مهمة (
                  {Math.round(((user.tasksCompleted ?? 0) / (user._count?.tasks ?? 1)) * 100)}%)
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Login / Logout Timeline */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LogIn className="h-5 w-5 text-primary" />
            خريطة زمنية للدخول والخروج
          </CardTitle>
          <CardDescription>
            آخر {loginTimeline.length} عملية دخول ناجحة من أصل {loginData?.total ?? 0} حدث تسجيل
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loginTimeline.length > 0 ? (
            <div className="relative pr-4">
              <div className="absolute right-4 top-1 bottom-1 w-px bg-border" />
              <div className="space-y-4">
                {loginTimeline.map((a) => (
                  <div key={a.id} className="relative flex items-start gap-4">
                    <div className="z-10 mt-1 h-7 w-7 shrink-0 rounded-full bg-success/10 text-success flex items-center justify-center ring-4 ring-card">
                      <LogIn className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 rounded-xl border bg-muted/20 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold">دخول ناجح</span>
                        <span className="text-[10px] text-muted-foreground">
                          {a.createdAt && isValid(new Date(a.createdAt))
                            ? formatDistanceToNow(new Date(a.createdAt), { locale: ar, addSuffix: true })
                            : ""}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {a.createdAt && isValid(new Date(a.createdAt))
                            ? format(new Date(a.createdAt), "d MMM yyyy · HH:mm", { locale: ar })
                            : "-"}
                        </span>
                        {a.ip && (
                          <span className="font-mono">{a.ip}</span>
                        )}
                        {a.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {a.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <LogIn className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">لا توجد عمليات دخول مسجلة</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Failed Login Attempts */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle
              className={`h-5 w-5 ${failedAttempts.length > 0 ? "text-danger" : "text-primary"}`}
            />
            محاولات تسجيل الدخول الفاشلة
          </CardTitle>
          <CardDescription>
            {loginData?.failedCount ?? failedAttempts.length} محاولة فاشلة — مؤشر محتمل على محاولة اختراق
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {failedAttempts.length > 0 ? (
            <div className="divide-y">
              {failedAttempts.slice(0, 15).map((a) => (
                <div
                  key={a.id}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-danger/5 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 shrink-0 rounded-full bg-danger/10 text-danger flex items-center justify-center">
                      <XCircle className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold">
                        {a.eventType === "2FA_FAILED" ? "فشل في التحقق الثنائي" : "فشل في تسجيل الدخول"}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 text-[10px] text-muted-foreground mt-0.5">
                        {a.ip && <span className="font-mono">{a.ip}</span>}
                        <span>
                          {a.createdAt && isValid(new Date(a.createdAt))
                            ? format(new Date(a.createdAt), "d MMM yyyy · HH:mm", { locale: ar })
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="destructive" className="rounded-full text-[10px] shrink-0">
                    فشل
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-10 w-10 mx-auto mb-3 opacity-20 text-success" />
              <p className="font-medium">لا توجد محاولات فاشلة — الحساب آمن</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Engagement */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            تفاعل الفيديوهات
          </CardTitle>
          <CardDescription>
            {videoData?.totalVideos ?? 0} فيديو · إجمالي المشاهدة{" "}
            {Math.round((videoData?.totalWatchSeconds ?? 0) / 60)} دقيقة
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {videoData && videoData.videos.length > 0 ? (
            <div className="divide-y">
              {videoData.videos.map((v) => {
                const mins = v.timeSpentMinutes ?? Math.round((v.timeSpentSeconds ?? 0) / 60);
                const pct = v.completed ? 100 : Math.min(100, Math.round((v.lastWatchedPosition ?? 0) * 100));
                return (
                  <div key={v.lessonId} className="p-4 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Video className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{v.status || "فيديو"}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {mins} دقيقة مشاهدة · {pct}% مكتمل
                          {v.completed && " · مكتمل"}
                        </p>
                      </div>
                    </div>
                    <div className="w-28 shrink-0">
                      <Progress value={pct} className="h-1.5" indicatorClassName="bg-primary" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Video className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">لا توجد فيديوهات شوهدت بعد</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Study Sessions */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            جلسات المذاكرة الأخيرة
          </CardTitle>
          <CardDescription>
            آخر {Math.min(10, recentSessions.length)} جلسات من{" "}
            {user._count?.studySessions ?? 0} جلسة إجمالية
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {recentSessions.length > 0 ? (
              recentSessions.map((session) => {
                const focusColor =
                  session.focusScore >= 80
                    ? "text-success"
                    : session.focusScore >= 60
                    ? "text-warning"
                    : "text-danger";
                const focusBg =
                  session.focusScore >= 80
                    ? "bg-green-500/10"
                    : session.focusScore >= 60
                    ? "bg-amber-500/10"
                    : "bg-red-500/10";

                return (
                  <div
                    key={session.id}
                    className="p-5 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-11 w-11 rounded-2xl ${focusBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
                      >
                        <BookOpen className={`h-5 w-5 ${focusColor}`} />
                      </div>
                      <div>
                        <p className="font-black text-sm">
                          {session.subject?.name || "مذاكرة عامة"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {session.startTime && isValid(new Date(session.startTime))
                            ? format(
                                new Date(session.startTime),
                                "d MMMM yyyy · HH:mm",
                                { locale: ar }
                              )
                            : "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-left">
                        <div className="flex items-center gap-1.5 justify-end mb-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-black text-sm">{session.durationMin} د</span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="text-xs text-muted-foreground">تركيز:</span>
                          <span className={`text-xs font-black ${focusColor}`}>
                            {session.focusScore}%
                          </span>
                        </div>
                      </div>
                      <div className={`w-1 h-10 rounded-full ${focusBg}`}>
                        <div
                          className={`rounded-full w-full transition-all ${focusColor.replace("text-", "bg-")}`}
                          style={{ height: `${session.focusScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-14 text-muted-foreground">
                <History className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="font-medium">لا توجد جلسات مذاكرة مسجلة</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Counters + Security */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Platform Counters */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-black flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              إحصائيات المنصة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {countersData.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${item.bg} shrink-0`}>
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-base leading-none">{item.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      {item.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Summary */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-black flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              حالة الحساب والأمان
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {securityCards.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-card border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center ${
                        item.verified
                          ? "bg-success/10 text-success"
                          : "bg-danger/10 text-danger"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <Badge
                    variant={item.verified ? "secondary" : "destructive"}
                    className="rounded-full text-xs"
                  >
                    {item.status}
                  </Badge>
                </div>
              );
            })}

            {/* Last Login */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-card border">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-sm font-medium">آخر تسجيل دخول</span>
                  {user.lastLogin && isValid(new Date(user.lastLogin)) && (
                    <p className="text-[10px] text-muted-foreground">
                      {format(new Date(user.lastLogin), "d MMM yyyy · HH:mm", {
                        locale: ar,
                      })}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-xs font-bold text-muted-foreground">
                {user.lastLogin && isValid(new Date(user.lastLogin))
                  ? formatDistanceToNow(new Date(user.lastLogin), {
                      locale: ar,
                      addSuffix: true,
                    })
                  : "لم يسجل دخول"}
              </span>
            </div>

            {/* Status reason */}
            {user.statusReason && (
              <div className="p-3.5 rounded-xl bg-warning/5 border border-warning/20">
                <p className="text-xs font-black text-warning mb-1">سبب الحالة</p>
                <p className="text-xs text-muted-foreground">{user.statusReason}</p>
                {user.statusExpiresAt && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    ينتهي:{" "}
                    {new Date(user.statusExpiresAt).toLocaleString("ar-EG")}
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
