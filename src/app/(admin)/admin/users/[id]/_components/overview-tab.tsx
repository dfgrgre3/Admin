"use client";

import type { UserDetails } from "./types";
import { computeLevelProgress } from "./types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
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
  Link2
} from "lucide-react";
import { format, isValid } from "date-fns";
import { ar } from "date-fns/locale";
import * as React from "react";
import { ActivityChart } from "./activity-chart";
import { AdminNotes } from "./admin-notes";

export function OverviewTab({ user }: { user: UserDetails }) {
  const [showAllAchievements, setShowAllAchievements] = React.useState(false);
  const downloadUserData = () => {
    const blob = new Blob([JSON.stringify(user, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `user-${user.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const xpStats = [
    { label: "الدراسة", value: user.studyXP ?? 0, color: "bg-blue-500", icon: BookOpen },
    { label: "المهام", value: user.taskXP ?? 0, color: "bg-green-500", icon: CheckCircle },
    { label: "الامتحانات", value: user.examXP ?? 0, color: "bg-purple-500", icon: Trophy },
    { label: "التحديات", value: user.challengeXP ?? 0, color: "bg-orange-500", icon: Zap },
    { label: "الموسم", value: user.seasonXP ?? 0, color: "bg-red-500", icon: Flame }
  ];

  const engagementStats = [
    { label: "المهام المكتملة", value: user.tasksCompleted ?? 0, icon: CheckCircle, color: "text-green-500" },
    { label: "جلسات المذاكرة", value: user._count?.studySessions ?? 0, icon: BookOpen, color: "text-blue-500" },
    { label: "جلسات بومودورو", value: user.pomodoroSessions ?? 0, icon: Clock, color: "text-orange-500" },
    { label: "أطول تتابع", value: `${user.longestStreak ?? 0} يوم`, icon: Trophy, color: "text-yellow-500" },
    { label: "الإنجازات", value: user._count?.achievements ?? 0, icon: Award, color: "text-purple-500" }
  ];

  const { level, totalXP, levelProgress, xpToNextLevel } = computeLevelProgress(user);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-none shadow-lg">
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div><CardTitle className="flex items-center gap-2 text-lg"><Link2 className="h-5 w-5 text-primary" />الحساب والمصدر</CardTitle><CardDescription>مصدر إنشاء الحساب والحسابات الخارجية المرتبطة</CardDescription></div>
          <Button variant="outline" size="sm" onClick={downloadUserData}><Download className="ml-2 h-4 w-4" />تنزيل البيانات</Button>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-muted/30 p-3"><p className="text-xs text-muted-foreground">مصدر الحساب</p><p className="mt-1 font-bold">{user.authProvider || user.createdBy || "تسجيل مباشر"}</p></div>
          <div className="rounded-xl bg-muted/30 p-3"><p className="text-xs text-muted-foreground">Google</p><p className="mt-1 font-bold">{user.googleId ? "مرتبط" : "غير مرتبط"}</p></div>
          <div className="rounded-xl bg-muted/30 p-3"><p className="flex items-center gap-1 text-xs text-muted-foreground"><Github className="h-3 w-3" />GitHub</p><p className="mt-1 font-bold">{user.githubId ? "مرتبط" : "غير مرتبط"}</p></div>
          <div className="rounded-xl bg-muted/30 p-3"><p className="text-xs text-muted-foreground">آخر تحديث</p><p className="mt-1 font-bold">{isValid(new Date(user.updatedAt)) ? format(new Date(user.updatedAt), "d MMM yyyy HH:mm", { locale: ar }) : "-"}</p></div>
        </CardContent>
      </Card>
      {/* User Bio */}
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
            <p className="text-muted-foreground leading-relaxed">
              {user.bio}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Level Progress Card */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-primary/5 via-card to-card overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">المستوى {level}</h3>
                <p className="text-sm text-muted-foreground">
                  {totalXP.toLocaleString()} XP إجمالي
                </p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground">المتبقي للمستوى التالي</p>
              <p className="text-sm font-bold text-primary">{xpToNextLevel.toLocaleString()} XP</p>
            </div>
          </div>
          <Progress value={levelProgress} className="h-3 rounded-full bg-primary/10" indicatorClassName="bg-gradient-to-r from-primary to-primary/60" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>المستوى {level}</span>
            <span>المستوى {level + 1}</span>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <ActivityChart user={user} />

      {/* XP Distribution & Engagement Stats */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              توزيع نقاط الخبرة (XP)
            </CardTitle>
            <CardDescription>تحليل لمصادر نقاط الخبرة التي اكتسبها المستخدم</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {xpStats.map((xp, i) => {
              const percentage = xp.value / (totalXP || 1) * 100;
              return (
                <div key={i} className="space-y-2 group">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="flex items-center gap-2">
                      <xp.icon className="h-4 w-4 text-muted-foreground" />
                      {xp.label}
                    </span>
                    <span className="font-bold">{xp.value.toLocaleString()} XP</span>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-2.5 rounded-full bg-muted"
                    indicatorClassName={`${xp.color} shadow-lg`}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              مؤشرات التفاعل
            </CardTitle>
            <CardDescription>نظرة مفصلة على تفاعل المستخدم مع المنصة</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {engagementStats.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 px-6 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${item.color.replace('text', 'bg')}/10`}>
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="font-bold text-lg">{item.value}</span>
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
            <CardDescription>الإنجازات التي حصل عليها المستخدم</CardDescription>
          </div>
          {user.achievements && user.achievements.length > 3 && (
            <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setShowAllAchievements((prev) => !prev)}>
              {showAllAchievements ? "عرض أقل" : `عرض الكل (${user.achievements.length})`}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {user.achievements && user.achievements.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {user.achievements.slice(0, showAllAchievements ? undefined : 6).map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-muted/50 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner group-hover:scale-110 transition-transform">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{item.achievement.title}</p>
                    <p className="text-xs text-primary font-medium flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      +{item.achievement.xpReward} XP
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {item.earnedAt && isValid(new Date(item.earnedAt))
                        ? format(new Date(item.earnedAt), "d MMM yyyy", { locale: ar })
                        : "-"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>لا توجد إنجازات مسجلة حالياً</p>
              <p className="text-xs mt-1">عندما يحقق المستخدم إنجازات، ستظهر هنا</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Notes */}
      <AdminNotes notes={user.adminNotes || []} userId={user.id} />
    </div>
  );
}
