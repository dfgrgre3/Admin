"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { StatusBadge } from "@/components/admin/ui/admin-badge";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, Mail, Phone, MapPin, Calendar, Shield, Users, 
  CreditCard, Bell, Activity, Lock, RefreshCw, Edit, 
  Trash2, Link2, UserMinus, Send 
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminParentsApi, type ParentListItem, type ParentStudent } from "@/lib/api/admin-parents-api";
import { adminUsersApi } from "@/lib/api/admin-users-api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserStatus } from "@/types/enums";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { toast } from "sonner";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import dynamic from "next/dynamic";
import { LinkStudentModal } from "@/components/admin/parents/link-student-modal";

const MessageModal = dynamic(() => import("@/components/admin/broadcast/broadcast-modal").then(mod => ({ default: mod.BroadcastModal })), {
  ssr: false,
  loading: () => null,
});

export default function ParentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const parentId = params.id as string;
  const queryClient = useQueryClient();
  const { user: currentUser, hasPermission } = usePermission();
  const canManageParents = hasPermission(PERMISSIONS.PARENTS_MANAGE);

  const [deleteDialog, setDeleteDialog] = React.useState(false);
  const [suspendDialog, setSuspendDialog] = React.useState(false);
  const [activateDialog, setActivateDialog] = React.useState(false);
  const [messageDialog, setMessageDialog] = React.useState(false);
  const [linkStudentDialog, setLinkStudentDialog] = React.useState(false);

  const { data: parent, isLoading: parentLoading, error: parentError, refetch: refetchParent } = useQuery({
    queryKey: ["admin", "parents", parentId],
    queryFn: () => adminParentsApi.get(parentId),
    enabled: !!parentId,
  });

  const { data: studentsData, isLoading: studentsLoading, refetch: refetchStudents } = useQuery({
    queryKey: ["admin", "parents", parentId, "students"],
    queryFn: () => adminParentsApi.getStudents(parentId),
    enabled: !!parentId,
  });

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ["admin", "users", parentId, "activity"],
    queryFn: () => adminUsersApi.getActivity(parentId),
    enabled: !!parentId,
  });

  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["admin", "users", parentId, "enrollments"],
    queryFn: () => adminUsersApi.getEnrollments(parentId),
    enabled: !!parentId,
  });

  const handleDelete = async () => {
    if (!canManageParents) {
      toast.error("غير مصرح بتنفيذ الإجراء");
      return;
    }
    try {
      await adminParentsApi.remove(parentId);
      toast.success("تم حذف ولي الأمر بنجاح");
      router.push("/admin/parents");
    } catch (error) {
      toast.error("فشل حذف ولي الأمر");
    }
  };

  const handleSuspend = async () => {
    if (!canManageParents) {
      toast.error("غير مصرح بتنفيذ الإجراء");
      return;
    }
    try {
      await adminParentsApi.updateStatus(parentId, UserStatus.SUSPENDED);
      toast.success("تم تعليق الحساب بنجاح");
      refetchParent();
    } catch (error) {
      toast.error("فشل تعليق الحساب");
    }
  };

  const handleActivate = async () => {
    if (!canManageParents) {
      toast.error("غير مصرح بتنفيذ الإجراء");
      return;
    }
    try {
      await adminParentsApi.updateStatus(parentId, UserStatus.ACTIVE);
      toast.success("تم تفعيل الحساب بنجاح");
      refetchParent();
    } catch (error) {
      toast.error("فشل تفعيل الحساب");
    }
  };

  const handleLinkStudent = async (studentId: string) => {
    try {
      await adminParentsApi.linkStudent(parentId, studentId);
      toast.success("تم ربط الطالب بنجاح");
      refetchStudents();
      queryClient.invalidateQueries({ queryKey: ["admin", "parents", parentId] });
    } catch (error) {
      toast.error("فشل ربط الطالب");
    }
  };

  const handleUnlinkStudent = async (studentId: string) => {
    try {
      await adminParentsApi.unlinkStudent(parentId, studentId);
      toast.success("تم فك ربط الطالب بنجاح");
      refetchStudents();
      queryClient.invalidateQueries({ queryKey: ["admin", "parents", parentId] });
    } catch (error) {
      toast.error("فشل فك ربط الطالب");
    }
  };

  if (parentLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (parentError || !parent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive font-bold">فشل تحميل بيانات ولي الأمر</p>
        <AdminButton variant="outline" onClick={() => router.push("/admin/parents")}>
          العودة للقائمة
        </AdminButton>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20" dir="rtl">
      <PageHeader
        title={`تفاصيل ولي الأمر: ${parent.name || parent.username || "بدون اسم"}`}
        description="عرض وإدارة بيانات ولي الأمر والطلاب المرتبطين به"
      >
        <div className="flex flex-wrap items-center gap-3">
          <AdminButton variant="outline" icon={Send} onClick={() => setMessageDialog(true)}>
            إرسال رسالة
          </AdminButton>
          <AdminButton variant="outline" icon={Link2} onClick={() => setLinkStudentDialog(true)}>
            ربط طالب
          </AdminButton>
          {canManageParents && (
            <>
              <AdminButton variant="outline" icon={Edit} onClick={() => router.push(`/admin/parents/${parentId}/edit`)}>
                تعديل
              </AdminButton>
              {parent.status === UserStatus.ACTIVE ? (
                <AdminButton variant="outline" icon={Shield} onClick={() => setSuspendDialog(true)}>
                  تعليق
                </AdminButton>
              ) : (
                <AdminButton variant="outline" icon={Shield} onClick={() => setActivateDialog(true)}>
                  تفعيل
                </AdminButton>
              )}
              <AdminButton variant="destructive" icon={Trash2} onClick={() => setDeleteDialog(true)}>
                حذف
              </AdminButton>
            </>
          )}
        </div>
      </PageHeader>

      {/* Parent Overview Card */}
      <div className="admin-glass rounded-3xl p-6 border border-white/10">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <Avatar className="h-24 w-24 border-4 border-primary/20">
            <AvatarImage src={parent.avatar || ""} />
            <AvatarFallback className="font-bold text-3xl bg-primary/10 text-primary">
              {parent.name?.charAt(0) || "P"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black">{parent.name || parent.username || "بدون اسم"}</h2>
              <StatusBadge status={parent.status === UserStatus.ACTIVE ? "active" : "suspended"} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {parent.email}
              </span>
              {parent.phone && (
                <span className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {parent.phone}
                </span>
              )}
              {parent.country && (
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {parent.country}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-xs">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                انضم: {new Date(parent.createdAt).toLocaleDateString("ar-EG")}
              </span>
              {parent.lastLogin && (
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  آخر دخول: {new Date(parent.lastLogin).toLocaleDateString("ar-EG")}
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-2xl">
              <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-black">{parent.linkedStudentsCount || 0}</p>
              <p className="text-xs text-muted-foreground">طالب مرتبط</p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-2xl">
              <Shield className="w-6 h-6 mx-auto mb-2 text-primary" />
              <StatusBadge status={parent.emailVerified ? "verified" : "unverified"} />
              <p className="text-xs text-muted-foreground mt-1">توثيق البريد</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/10 h-12 flex gap-1 mb-6 w-full max-w-full justify-start overflow-x-auto">
          <TabsTrigger value="students" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            الطلاب المرتبطين
          </TabsTrigger>
          <TabsTrigger value="personal" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            البيانات الشخصية
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            النشاط
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl px-5 text-sm font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            الأمان
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <div className="admin-glass rounded-3xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black">الطلاب المرتبطين</h3>
              <AdminButton variant="outline" icon={Link2} onClick={() => setLinkStudentDialog(true)}>
                ربط طالب جديد
              </AdminButton>
            </div>
            {studentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : studentsData?.students && studentsData.students.length > 0 ? (
              <div className="grid gap-4">
                {studentsData.students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-accent/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="font-bold bg-primary/10 text-primary">
                          {student.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-black">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                        <div className="flex gap-4 mt-1 text-xs">
                          <span>الصف: {student.gradeLevel || "غير محدد"}</span>
                          <span>المستوى: {student.level}</span>
                          <span>التقدم: {student.progress.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AdminButton
                        variant="outline"
                        icon={UserMinus}
                        onClick={() => handleUnlinkStudent(student.id)}
                      >
                        فك الربط
                      </AdminButton>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا يوجد طلاب مرتبطين بهذا ولي الأمر</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="personal" className="space-y-4">
          <div className="admin-glass rounded-3xl p-6 border border-white/10">
            <h3 className="text-xl font-black mb-6">البيانات الشخصية</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">الاسم الكامل</p>
                    <p className="font-bold">{parent.name || "غير محدد"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                    <p className="font-bold">{parent.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">رقم الهاتف</p>
                    <p className="font-bold">{parent.phone || "غير محدد"}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">الدولة</p>
                    <p className="font-bold">{parent.country || "غير محدد"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">تاريخ الانضمام</p>
                    <p className="font-bold">{new Date(parent.createdAt).toLocaleDateString("ar-EG")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">آخر دخول</p>
                    <p className="font-bold">
                      {parent.lastLogin ? new Date(parent.lastLogin).toLocaleDateString("ar-EG") : "لم يسجل دخولًا"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="admin-glass rounded-3xl p-6 border border-white/10">
            <h3 className="text-xl font-black mb-6">سجل النشاط</h3>
            {activityLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : activityData?.feed && activityData.feed.length > 0 ? (
              <div className="space-y-3">
                {activityData.feed.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 bg-accent/5 rounded-2xl border border-white/5">
                    <Activity className="w-5 h-5 mt-1 text-primary" />
                    <div className="flex-1">
                      <p className="font-bold">{item.title}</p>
                      {item.detail && <p className="text-sm text-muted-foreground">{item.detail}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(item.timestamp).toLocaleString("ar-EG")}
                      </p>
                    </div>
                    {item.status && <StatusBadge status={item.status === "success" ? "active" : "inactive"} />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا يوجد نشاط مسجل</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="admin-glass rounded-3xl p-6 border border-white/10">
            <h3 className="text-xl font-black mb-6">معلومات الأمان</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-accent/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-bold">توثيق البريد الإلكتروني</p>
                      <p className="text-xs text-muted-foreground">حالة توثيق البريد</p>
                    </div>
                  </div>
                  <StatusBadge status={parent.emailVerified ? "verified" : "unverified"} />
                </div>
                {parent.phone && (
                  <div className="flex items-center justify-between p-4 bg-accent/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-bold">توثيق الهاتف</p>
                        <p className="text-xs text-muted-foreground">حالة توثيق الهاتف</p>
                      </div>
                    </div>
                    <StatusBadge status={parent.phoneVerified ? "verified" : "unverified"} />
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-accent/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-bold">المصادقة الثنائية</p>
                      <p className="text-xs text-muted-foreground">حالة 2FA</p>
                    </div>
                  </div>
                  <StatusBadge status={parent.twoFactorEnabled ? "active" : "inactive"} />
                </div>
                <div className="flex items-center justify-between p-4 bg-accent/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-bold">حالة الحساب</p>
                      <p className="text-xs text-muted-foreground">الحالة الحالية</p>
                    </div>
                  </div>
                  <StatusBadge status={parent.status === UserStatus.ACTIVE ? "active" : "suspended"} />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialogs */}
      <AdminConfirm
        open={deleteDialog}
        onOpenChange={setDeleteDialog}
        title="حذف ولي الأمر"
        description="هل أنت متأكد من حذف هذا الحساب؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="تأكيد الحذف"
        variant="destructive"
        onConfirm={handleDelete}
      />
      <AdminConfirm
        open={suspendDialog}
        onOpenChange={setSuspendDialog}
        title="تعليق الحساب"
        description="هل أنت متأكد من تعليق هذا الحساب؟ لن يتمكن المستخدم من الدخول."
        confirmText="تأكيد التعليق"
        variant="warning"
        onConfirm={handleSuspend}
      />
      <AdminConfirm
        open={activateDialog}
        onOpenChange={setActivateDialog}
        title="تفعيل الحساب"
        description="هل أنت متأكد من تفعيل هذا الحساب؟ سيتمكن المستخدم من الدخول مرة أخرى."
        confirmText="تأكيد التفعيل"
        variant="premium"
        onConfirm={handleActivate}
      />
      <MessageModal
        open={messageDialog}
        onOpenChange={setMessageDialog}
        users={[parent]}
      />
      <LinkStudentModal
        open={linkStudentDialog}
        onOpenChange={setLinkStudentDialog}
        parentId={parentId}
        onLinkStudent={handleLinkStudent}
      />
    </div>
  );
}
