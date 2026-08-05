"use client";

import type { UserDetails } from "./types";
import { computeLevelProgress } from "./types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Award,
  User as UserIcon,
  TrendingUp,
  Target,
  CheckCircle,
  BookOpen,
  Clock,
  Sparkles,
  Star,
  Zap,
  Flame,
  Download,
  Github,
  Link2,
  Calendar,
  BarChart3,
  Hash,
} from "lucide-react";
import { format, isValid, formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import * as React from "react";
import dynamic from "next/dynamic";
import { AdminNotes } from "./admin-notes";
import { LazySection } from "@/components/admin/ui/lazy-section";

const ActivityChart = dynamic(() => import("./activity-chart").then(mod => mod.ActivityChart), { ssr: false, loading: () => <div className="h-[200px] w-full animate-pulse bg-muted/30 rounded-3xl" /> });

export function OverviewTab({ user }: { user: UserDetails }) {
  const [showAllAchievements, setShowAllAchievements] = React.useState(false);

  const downloadUserData = () => {
    const blob = new Blob([JSON.stringify(user, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `user-${user.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const xpStats = [
    { label: "الدراسة", value: user.studyXP ?? 0, color: "bg-blue-500", textColor: "text-blue-500", icon: BookOpen },
    { label: "المهام", value: user.taskXP ?? 0, color: "bg-green-500", textColor: "text-green-500", icon: CheckCircle },
    { label: "الامتحانات", value: user.examXP ?? 0, color: "bg-purple-500", textColor: "text-purple-500", icon: Trophy },
    { label: "التحديات", value: user.challengeXP ?? 0, color: "bg-orange-500", textColor: "text-orange-500", icon: Zap },
    { label: "الموسم", value: user.seasonXP ?? 0, color: "bg-red-500", textColor: "text-red-500", icon: Flame },
  ];

  const engagementStats = [
    { label: "المهام المكتملة", value: user.tasksCompleted ?? 0, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "جلسات المذاكرة", value: user._count?.studySessions ?? 0, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "جلسات بومودورو", value: user.pomodoroSessions ?? 0, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "أطول تتابع", value: `${user.longestStreak ?? 0} يوم`, icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "الإنجازات", value: user._count?.achievements ?? 0, icon: Award, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "الجلسات النشطة", value: user._count?.sessions ?? 0, icon: BarChart3, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  ];

  const { level, totalXP, levelProgress, xpToNextLevel } = computeLevelProgress(user);

  const accountInfo = [
    {
      label: "مصدر الحساب",
      value: user.authProvider || user.createdBy || "تسجيل مباشر",
      icon: Link2,
    },
    {
      label: "Google",
      value: user.googleId ? "مرتبط" : "غير مرتبط",
      icon: Link2,
      highlight: !!user.googleId,
    },
    {
      label: "GitHub",
      value: user.githubId ? "مرتبط" : "غير مرتبط",
      icon: Github,
      highlight: !!user.githubId,
    },
    {
      label: "آخر تحديث",
      value:
        isValid(new Date(user.updatedAt))
          ? formatDistanceToNow(new Date(user.updatedAt), { locale: ar, addSuffix: true })
          : "-",
      icon: Calendar,
    },
    {
      label: "تاريخ الانضمام",
      value:
        isValid(new Date(user.createdAt))
          ? format(new Date(user.createdAt), "d MMMM yyyy", { locale: ar })
          : "-",
      icon: Calendar,
    },
    {
      label: "معرف المستخدم",
      value: user.id,
      icon: Hash,
      mono: true,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Account & Source */}
      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="flex-row items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Link2 className="h-5 w-5 text-primary" />
              الحساب والمصدر
            </CardTitle>
            <CardDescription>
              مصدر إنشاء الحساب والحسابات الخارجية المرتبطة
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl gap-2 shrink-0"
            onClick={downloadUserData}
          >
            <Download className="h-4 w-4" />
            تنزيل البيانات
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {accountInfo.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                  <item.icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-muted-foreground font-medium mb-0.5">
                    {item.label}
                  </p>
                  <p
                    className={`font-bold text-xs truncate ${
                      item.highlight ? "text-primary" : ""
                    } ${item.mono ? "font-mono text-[10px] text-muted-foreground" : ""}`}
                    title={item.value}
                  >
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      {user.bio && (
        <Card className="border-none shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" />
              نبذة تعريفية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{user.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Level Progress */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-primary/5 via-card to-card overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black">المستوى {level}</h3>
                <p className="text-sm text-muted-foreground">
                  {totalXP.toLocaleString()} XP إجمالي
                </p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground">المتبقي للمستوى التالي</p>
              <p className="text-sm font-black text-primary">
                {xpToNextLevel.toLocaleString()} XP
              </p>
            </div>
          </div>
          <Progress
            value={levelProgress}
            label="التقدم نحو المستوى التالي"
            className="h-3 rounded-full bg-primary/10"
            indicatorClassName="bg-gradient-to-r from-primary to-primary/60"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>المستوى {level}</span>
            <span className="font-medium text-primary">{Math.round(levelProgress)}%</span>
            <span>المستوى {level + 1}</span>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <LazySection minHeight={260} rootMargin="250px">
        <ActivityChart user={user} />
      </LazySection>

      {/* XP Distribution & Engagement Stats */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* XP Distribution */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              توزيع نقاط الخبرة (XP)
            </CardTitle>
            <CardDescription>
              تحليل لمصادر نقاط الخبرة التي اكتسبها المستخدم
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {xpStats.map((xp, i) => {
              const percentage = (xp.value / (totalXP || 1)) * 100;
              return (
                <div key={i} className="space-y-1.5 group">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="flex items-center gap-2">
                      <xp.icon className={`h-4 w-4 ${xp.textColor}`} />
                      {xp.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </span>
                      <span className="font-black">
                        {xp.value.toLocaleString()} XP
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <Progress
                      value={percentage}
                      label={`نسبة ${xp.label}`}
                      className="h-2.5 rounded-full bg-muted"
                      indicatorClassName={`${xp.color} shadow-md`}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Engagement Stats */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              مؤشرات التفاعل
            </CardTitle>
            <CardDescription>
              نظرة مفصلة على تفاعل المستخدم مع المنصة
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {engagementStats.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 px-6 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${item.bg}`}>
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="font-black text-lg">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="border-none shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              آخر الإنجازات
            </CardTitle>
            <CardDescription>
              الإنجازات التي حصل عليها المستخدم
            </CardDescription>
          </div>
          {user.achievements && user.achievements.length > 6 && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl"
              onClick={() => setShowAllAchievements((prev) => !prev)}
            >
              {showAllAchievements
                ? "عرض أقل"
                : `عرض الكل (${user.achievements.length})`}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {user.achievements && user.achievements.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {user.achievements
                .slice(0, showAllAchievements ? undefined : 6)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-muted/50 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner group-hover:scale-110 transition-transform">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm truncate">
                        {item.achievement.title}
                      </p>
                      <p className="text-xs text-primary font-medium flex items-center gap-1 mt-0.5">
                        <Sparkles className="h-3 w-3" />
                        +{item.achievement.xpReward} XP
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {item.earnedAt && isValid(new Date(item.earnedAt))
                          ? format(new Date(item.earnedAt), "d MMM yyyy", {
                              locale: ar,
                            })
                          : "-"}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">لا توجد إنجازات مسجلة حالياً</p>
              <p className="text-xs mt-1 opacity-70">
                عندما يحقق المستخدم إنجازات، ستظهر هنا
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exam Results Summary */}
      {user.examResults && user.examResults.length > 0 && (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              آخر نتائج الاختبارات
            </CardTitle>
            <CardDescription>
              آخر {Math.min(5, user.examResults.length)} نتائج من{" "}
              {user.examResults.length} اختبار
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {user.examResults.slice(0, 5).map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-4 px-6 hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <p className="font-bold text-sm">{result.exam.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {result.exam.subject.name} ·{" "}
                      {result.takenAt && isValid(new Date(result.takenAt))
                        ? format(new Date(result.takenAt), "d MMM yyyy", {
                            locale: ar,
                          })
                        : "-"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xl font-black ${
                        result.score >= 50 ? "text-success" : "text-danger"
                      }`}
                    >
                      {result.score}%
                    </span>
                    <Badge
                      variant={result.score >= 50 ? "secondary" : "destructive"}
                      className="rounded-full"
                    >
                      {result.score >= 50 ? "ناجح" : "راسب"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Notes */}
      <AdminNotes notes={user.adminNotes || []} userId={user.id} />
    </div>
  );
}
