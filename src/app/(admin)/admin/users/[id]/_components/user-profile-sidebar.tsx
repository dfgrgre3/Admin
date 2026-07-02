"use client";

import type { UserDetails } from "./types";
import {
  roleLabels,
  resolveGradeLabel,
  statusLabels,
  statusColors,
  computeLevelProgress,
} from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Mail,
  Phone,
  Calendar,
  Settings,
  Edit,
  Lock,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  Shield,
  Ban,
  AlertTriangle,
  MapPin,
  GraduationCap,
  Clock,
  Globe,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminBadge } from "@/components/admin/ui/admin-badge";
import { format, isValid, formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import * as React from "react";

export function UserProfileSidebar({
  user,
  setActiveTab,
  router,
  onChangePassword,
  canManage = false,
}: {
  user: UserDetails;
  setActiveTab: (tab: string) => void;
  router: ReturnType<typeof import("next/navigation").useRouter>;
  onChangePassword?: () => void;
  canManage?: boolean;
}) {
  const { level, levelProgress, xpToNextLevel } = computeLevelProgress(user);

  const handleChangePassword = () => {
    if (onChangePassword) {
      onChangePassword();
    } else {
      toast.info("سيتم توجيهك إلى صفحة تغيير كلمة المرور", {
        description: "هذه الميزة قيد التطوير حالياً",
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`تم نسخ ${label}`);
    });
  };

  const lastLoginText = user.lastLogin && isValid(new Date(user.lastLogin))
    ? formatDistanceToNow(new Date(user.lastLogin), { locale: ar, addSuffix: true })
    : "لم يسجل دخول بعد";

  const isOnline = user.lastLogin
    ? (Date.now() - new Date(user.lastLogin).getTime()) < 5 * 60 * 1000
    : false;

  return (
    <div className="lg:col-span-1 space-y-6">
      {/* Profile Card */}
      <Card className="border-none shadow-2xl bg-gradient-to-b from-card to-card/50 overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-br from-primary/40 via-primary/20 to-transparent relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_30%_40%,white_1px,transparent_1px)] bg-[size:20px_20px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        </div>

        {/* Avatar + Identity */}
        <div className="px-6 pb-6 text-center -mt-16 flex flex-col items-center">
          <div className="relative group">
            {/* Online indicator */}
            {isOnline && (
              <span className="absolute top-1 right-1 z-10 h-4 w-4 rounded-full border-2 border-background bg-green-500 shadow-sm shadow-green-500/50" />
            )}
            <Avatar className="h-28 w-28 border-4 border-background shadow-2xl transition-transform duration-300 group-hover:scale-105">
              <AvatarImage src={user.avatar || undefined} className="object-cover" />
              <AvatarFallback className="text-3xl bg-primary/10 text-primary font-black">
                {user.name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            {user.emailVerified && (
              <div className="absolute bottom-1 right-1 bg-background rounded-full p-1 border shadow-sm">
                <CheckCircle className="h-5 w-5 text-success fill-success/10" />
              </div>
            )}
          </div>

          <div className="mt-5 space-y-1 w-full">
            <h2 className="text-xl font-black tracking-tight leading-tight">
              {user.name || "مستخدم غير معروف"}
            </h2>
            <button
              className="flex items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors mx-auto group/copy"
              onClick={() => copyToClipboard(user.username || user.id, "اسم المستخدم")}
            >
              <span className="text-sm font-medium">@{user.username || "بدون_اسم"}</span>
              <Copy className="h-3 w-3 opacity-0 group-hover/copy:opacity-70 transition-opacity" />
            </button>
          </div>

          {/* Badges */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <AdminBadge
              color={
                user.role === "ADMIN" ? "red" : user.role === "TEACHER" ? "blue" : "green"
              }
              variant="solid"
              className="px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]"
            >
              {roleLabels[user.role] || user.role}
            </AdminBadge>
            {user.gradeLevel && (
              <AdminBadge
                color="purple"
                variant="outline"
                className="px-4 py-1.5 rounded-full font-black text-[10px] border-white/10"
              >
                {resolveGradeLabel(user.gradeLevel)}
              </AdminBadge>
            )}
            {user.status && user.status !== "ACTIVE" && (
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black border ${statusColors[user.status] || ""}`}
              >
                {user.status === "SUSPENDED" ? (
                  <AlertTriangle className="h-3 w-3" />
                ) : (
                  <Ban className="h-3 w-3" />
                )}
                {statusLabels[user.status] || user.status}
              </span>
            )}
          </div>

          {/* Level Progress */}
          <div className="mt-6 w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-black text-primary flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" />
                المستوى {level}
              </span>
              <span className="text-xs text-muted-foreground">{xpToNextLevel.toLocaleString()} XP</span>
            </div>
            <Progress
              value={levelProgress}
              className="h-2 rounded-full bg-primary/10"
            />
            <p className="text-[10px] text-muted-foreground mt-1 text-center">
              للوصول للمستوى {level + 1}
            </p>
          </div>

          {/* Contact & Info */}
          <div className="pt-5 border-t w-full space-y-3 text-right mt-4">
            {/* Email */}
            <div
              className="flex items-center gap-3 text-sm group/item cursor-pointer hover:bg-muted/30 rounded-xl p-2 -mx-2 transition-colors"
              onClick={() => copyToClipboard(user.email, "البريد الإلكتروني")}
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                <Mail className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate text-xs">{user.email}</p>
                <p className="text-[10px] text-muted-foreground">البريد الإلكتروني</p>
              </div>
              <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover/item:opacity-70 shrink-0 transition-opacity" />
            </div>

            {/* Phone */}
            {user.phone && (
              <div
                className="flex items-center gap-3 text-sm group/item cursor-pointer hover:bg-muted/30 rounded-xl p-2 -mx-2 transition-colors"
                onClick={() => copyToClipboard(user.phone!, "رقم الهاتف")}
              >
                <div className="p-2 rounded-lg bg-green-500/10 text-green-600 shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate text-xs">{user.phone}</p>
                  <p className="text-[10px] text-muted-foreground">رقم الهاتف</p>
                </div>
                <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover/item:opacity-70 shrink-0 transition-opacity" />
              </div>
            )}

            {/* Country */}
            {user.country && (
              <div className="flex items-center gap-3 text-sm p-2 -mx-2">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 shrink-0">
                  <Globe className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-xs">{user.country}</p>
                  <p className="text-[10px] text-muted-foreground">الدولة</p>
                </div>
              </div>
            )}

            {/* School */}
            {user.school && (
              <div className="flex items-center gap-3 text-sm p-2 -mx-2">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate text-xs" title={user.school}>
                    {user.school}
                  </p>
                  <p className="text-[10px] text-muted-foreground">المدرسة</p>
                </div>
              </div>
            )}

            {/* Join date */}
            <div className="flex items-center gap-3 text-sm p-2 -mx-2">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 shrink-0">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-xs">
                  {user.createdAt && isValid(new Date(user.createdAt))
                    ? format(new Date(user.createdAt), "d MMMM yyyy", { locale: ar })
                    : "-"}
                </p>
                <p className="text-[10px] text-muted-foreground">تاريخ الانضمام</p>
              </div>
            </div>

            {/* Last login */}
            <div className="flex items-center gap-3 text-sm p-2 -mx-2">
              <div className={`p-2 rounded-lg shrink-0 ${isOnline ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                  {lastLoginText}
                  {isOnline && (
                    <Badge className="text-[8px] bg-green-500/10 text-green-600 border-none h-3.5 px-1.5 font-black">
                      متصل الآن
                    </Badge>
                  )}
                </p>
                <p className="text-[10px] text-muted-foreground">آخر تسجيل دخول</p>
              </div>
            </div>
          </div>

          {/* User ID */}
          <button
            className="mt-4 w-full flex items-center justify-center gap-2 text-[9px] text-muted-foreground/60 hover:text-muted-foreground font-mono transition-colors group/id"
            onClick={() => copyToClipboard(user.id, "معرف المستخدم")}
          >
            <span>ID: {user.id}</span>
            <Copy className="h-2.5 w-2.5 opacity-0 group-hover/id:opacity-70 transition-opacity" />
          </button>
        </div>
      </Card>

      {/* Quick Actions */}
      {canManage && (
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-black flex items-center gap-2">
              <Settings className="h-4 w-4" />
              إجراءات سريعة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl gap-3 h-11 text-sm font-medium hover:bg-primary/5 hover:border-primary/30 transition-all"
              onClick={() => setActiveTab("settings")}
            >
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Edit className="h-3.5 w-3.5" />
              </div>
              تعديل البيانات
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl gap-3 h-11 text-sm font-medium hover:bg-amber-500/5 hover:border-amber-500/30 transition-all"
              onClick={handleChangePassword}
            >
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                <KeyRound className="h-3.5 w-3.5" />
              </div>
              تغيير كلمة المرور
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl gap-3 h-11 text-sm font-medium hover:bg-blue-500/5 hover:border-blue-500/30 transition-all"
              onClick={() => router.push(`/admin/users/${user.id}/permissions`)}
            >
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              إدارة الصلاحيات
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl gap-3 h-11 text-sm font-medium hover:bg-red-500/5 hover:border-red-500/30 transition-all"
              onClick={() => setActiveTab("security")}
            >
              <div className="p-1.5 rounded-lg bg-red-500/10 text-red-600">
                <Shield className="h-3.5 w-3.5" />
              </div>
              الأمان والحظر
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl gap-3 h-11 text-sm font-medium hover:bg-muted/60 transition-all"
              onClick={() => router.push(`/admin/users/${user.id}/edit`)}
            >
              <div className="p-1.5 rounded-lg bg-muted text-muted-foreground">
                <ExternalLink className="h-3.5 w-3.5" />
              </div>
              تعديل متقدم
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl gap-3 h-11 text-sm font-medium hover:bg-muted/60 transition-all"
              onClick={() => router.push(`/admin/users/${user.id}`)}
            >
              <div className="p-1.5 rounded-lg bg-muted text-muted-foreground">
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
              عرض الملف الشخصي
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
