"use client";

import type { UserDetails, UserStatus } from "./types";
import { roleLabels, resolveGradeLabel, statusLabels, statusColors, computeLevelProgress } from "./types";
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
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminBadge } from "@/components/admin/ui/admin-badge";
import { format, isValid } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import * as React from "react";

export function UserProfileSidebar({
  user,
  setActiveTab,
  router,
  onChangePassword,
  canManage = false
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
        description: "هذه الميزة قيد التطوير حالياً"
      });
    }
  };

  return (
    <div className="lg:col-span-1 space-y-8">
      <Card className="border-none shadow-2xl bg-gradient-to-b from-card to-card/50 overflow-hidden admin-glass">
        <div className="h-32 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 bg-[url('/patterns/topography.svg')] bg-repeat" />
           <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        </div>
        <div className="px-6 pb-8 text-center -mt-16 flex flex-col items-center">
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-background shadow-2xl transition-transform duration-300 group-hover:scale-105">
              <AvatarImage src={user.avatar || undefined} className="object-cover" />
              <AvatarFallback className="text-4xl bg-primary/10 text-primary font-bold">
                {user.name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            {user.emailVerified &&
            <div className="absolute bottom-1 right-1 bg-background rounded-full p-1 border shadow-sm">
                <CheckCircle className="h-6 w-6 text-success fill-success/10" />
              </div>
            }
          </div>

          <div className="mt-6 space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {user.name || "مستخدم غير معروف"}
            </CardTitle>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <span className="text-sm font-medium">@{user.username || "بدون_اسم"}</span>
            </div>
          </div>

          <div className="mt-6 w-full space-y-4">
            <div className="flex flex-wrap justify-center gap-2">
              <AdminBadge color={user.role === 'ADMIN' ? 'red' : user.role === 'TEACHER' ? 'blue' : 'green'} variant="solid" className="px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                {roleLabels[user.role] || user.role}
              </AdminBadge>
              {user.gradeLevel &&
                <AdminBadge color="purple" variant="outline" className="px-4 py-1.5 rounded-full font-black text-[10px] border-white/10">
                  {resolveGradeLabel(user.gradeLevel)}
                </AdminBadge>
              }
              {user.status && user.status !== "ACTIVE" && (
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black border ${statusColors[user.status] || ''}`}>
                  {user.status === "SUSPENDED" ? <AlertTriangle className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                  {statusLabels[user.status] || user.status}
                </span>
              )}
            </div>

            <div className="pt-6 border-t w-full space-y-4 text-right">
              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{user.email}</p>
                  <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                </div>
              </div>

              {user.phone &&
              <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-green-500/10 text-green-600">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{user.phone}</p>
                    <p className="text-xs text-muted-foreground">رقم الهاتف</p>
                  </div>
                </div>
              }

              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">
                    {user.createdAt && isValid(new Date(user.createdAt))
                      ? format(new Date(user.createdAt), "d MMMM yyyy", { locale: ar })
                      : "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">تاريخ الانضمام</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-primary">المستوى {level}</span>
              <span className="text-xs text-muted-foreground">{xpToNextLevel} XP للمستوى القادم</span>
            </div>
            <Progress value={levelProgress} className="h-2 rounded-full bg-primary/10" />
          </div>
        </div>
      </Card>

      {canManage && <Card className="border-none shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Settings className="h-4 w-4" />
            إجراءات سريعة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start rounded-xl gap-2 h-11"
            onClick={() => setActiveTab("settings")}>
            <Edit className="h-4 w-4" />
            تعديل البيانات
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start rounded-xl gap-2 h-11"
            onClick={handleChangePassword}>
            <KeyRound className="h-4 w-4" />
            تغيير كلمة المرور
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start rounded-xl gap-2 h-11"
            onClick={() => router.push(`/admin/users/${user.id}/permissions`)}>
            <ShieldCheck className="h-4 w-4" />
            إدارة الصلاحيات
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start rounded-xl gap-2 h-11"
            onClick={() => setActiveTab("security")}>
            <Shield className="h-4 w-4" />
            الأمان والحظر
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start rounded-xl gap-2 h-11"
            onClick={() => router.push(`/admin/users/${user.id}/edit`)}>
            <ArrowRight className="h-4 w-4" />
            تعديل متقدم
          </Button>
        </CardContent>
      </Card>}
    </div>
  );
}
