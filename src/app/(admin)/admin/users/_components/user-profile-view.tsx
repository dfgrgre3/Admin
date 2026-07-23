"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CreditCard,
  BookOpen,
  Award,
  Ticket,
  FileText,
  Activity,
  Monitor,
  Flag,
  Settings,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  Building2,
  GraduationCap,
  UserCheck,
  UserX,
  Globe,
} from "lucide-react";
import { formatNumber, formatCurrency, formatDate } from "@/lib/utils";
import type { AdminUserListItem } from "@/lib/api/admin-users-api";
import { UserCoursesTab } from "./user-courses-tab";
import { UserPaymentsTab } from "./user-payments-tab";
import { UserActivityTab } from "./user-activity-tab";
import { UserCertificatesTab } from "./user-certificates-tab";
import { UserTicketsTab } from "./user-tickets-tab";
import { UserDevicesTab } from "./user-devices-tab";
import { UserReportsTab } from "./user-reports-tab";
import { UserNotesTab } from "./user-notes-tab";
import { UserCustomFieldsTab } from "./user-custom-fields-tab";
import { UserAuditLogTab } from "./user-audit-log-tab";

interface UserProfileViewProps {
  user: AdminUserListItem;
  onClose: () => void;
  onEdit: () => void;
  onImpersonate: () => void;
  onDelete: () => void;
}

export function UserProfileView({
  user,
  onClose,
  onEdit,
  onImpersonate,
  onDelete,
}: UserProfileViewProps) {
  const [activeTab, setActiveTab] = React.useState("overview");

  const getUserTypeLabel = (role: string) => {
    const types: Record<string, { label: string; icon: any; color: string }> = {
      STUDENT: { label: "طالب", icon: GraduationCap, color: "blue" },
      TEACHER: { label: "مدرس", icon: UserCheck, color: "green" },
      ADMIN: { label: "مدير", icon: Shield, color: "red" },
      MODERATOR: { label: "مشرف", icon: Users, color: "yellow" },
      STAFF: { label: "موظف", icon: UserCheck, color: "purple" },
      PARENT: { label: "ولي أمر", icon: Users, color: "cyan" },
      COMPANY: { label: "شركة/جهة", icon: Building2, color: "orange" },
      GUEST: { label: "ضيف/زائر", icon: Globe, color: "zinc" },
    };
    return types[role] || { label: role, icon: User, color: "gray" };
  };

  const userType = getUserTypeLabel(user.role);
  const UserTypeIcon = userType.icon;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-4 border-primary/20">
            <AvatarImage src={user.avatar || ""} />
            <AvatarFallback className="text-2xl font-black bg-primary/10 text-primary">
              {user.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-3xl font-black">{user.name || user.username || "بدون اسم"}</h2>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="gap-1">
                <UserTypeIcon className="h-3 w-3" />
                {userType.label}
              </Badge>
              <Badge variant={user.status === "ACTIVE" ? "default" : "secondary"}>
                {user.status === "ACTIVE" ? "نشط" : user.status === "SUSPENDED" ? "موقوف" : "محظور"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all"
          >
            تعديل
          </button>
          <button
            onClick={onImpersonate}
            className="px-4 py-2 bg-card border border-border rounded-xl font-bold hover:bg-card/80 transition-all"
          >
            تسجيل دخول كـ
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold hover:bg-red-500/20 transition-all"
          >
            حذف
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-card rounded-xl transition-all"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">النقاط</p>
              <p className="text-2xl font-black">{formatNumber(user.totalXP || 0)}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">الكورسات</p>
              <p className="text-2xl font-black">{user._count?.tasks || 0}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">الإنجازات</p>
              <p className="text-2xl font-black">{user._count?.achievements || 0}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold">الأنشطة</p>
              <p className="text-2xl font-black">{user._count?.tasks || 0}</p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/10">
          <TabsTrigger value="overview" className="rounded-xl">نظرة عامة</TabsTrigger>
          <TabsTrigger value="courses">الكورسات</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات</TabsTrigger>
          <TabsTrigger value="certificates">الشهادات</TabsTrigger>
          <TabsTrigger value="tickets">التذاكر</TabsTrigger>
          <TabsTrigger value="activity">سجل النشاط</TabsTrigger>
          <TabsTrigger value="devices">الأجهزة</TabsTrigger>
          <TabsTrigger value="reports">البلاغات</TabsTrigger>
          <TabsTrigger value="notes">ملاحظات داخلية</TabsTrigger>
          <TabsTrigger value="custom_fields">حقول مخصصة</TabsTrigger>
          <TabsTrigger value="audit_log">سجل التدقيق</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <AdminCard variant="glass" className="p-6">
            <h3 className="text-xl font-black mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              البيانات الشخصية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground font-bold">الاسم الكامل</p>
                <p className="font-bold">{user.name || "غير محدد"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold">البريد الإلكتروني</p>
                <p className="font-bold flex items-center gap-2">
                  {user.email}
                  {user.emailVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold">الهاتف</p>
                <p className="font-bold flex items-center gap-2">
                  {user.phone || "غير محدد"}
                  {user.phoneVerified && <CheckCircle className="h-4 w-4 text-green-500" />}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold">الدولة</p>
                <p className="font-bold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {user.country || "غير محدد"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold">تاريخ التسجيل</p>
                <p className="font-bold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(user.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold">آخر دخول</p>
                <p className="font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {user.lastLogin ? formatDate(user.lastLogin) : "لم يسجل دخول"}
                </p>
              </div>
            </div>
          </AdminCard>

          <AdminCard variant="glass" className="p-6">
            <h3 className="text-xl font-black mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              الأمان والتحقق
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="font-bold">توثيق البريد الإلكتروني</span>
                {user.emailVerified ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    موثق
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    غير موثق
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="font-bold">توثيق الهاتف</span>
                {user.phoneVerified ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    موثق
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    غير موثق
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="font-bold">المصادقة الثنائية (2FA)</span>
                {user.twoFactorEnabled ? (
                  <Badge variant="default" className="gap-1">
                    <Lock className="h-3 w-3" />
                    مفعّل
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <Unlock className="h-3 w-3" />
                    غير مفعّل
                  </Badge>
                )}
              </div>
            </div>
          </AdminCard>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <UserCoursesTab userId={user.id} />
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <UserPaymentsTab userId={user.id} />
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          <UserCertificatesTab userId={user.id} />
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <UserTicketsTab userId={user.id} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <UserActivityTab userId={user.id} />
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <UserDevicesTab userId={user.id} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <UserReportsTab userId={user.id} />
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <UserNotesTab userId={user.id} />
        </TabsContent>

        <TabsContent value="custom_fields" className="space-y-4">
          <UserCustomFieldsTab userId={user.id} />
        </TabsContent>

        <TabsContent value="audit_log" className="space-y-4">
          <UserAuditLogTab userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}