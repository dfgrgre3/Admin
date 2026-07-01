"use client";

import { adminFetch } from "@/lib/api/admin-api";
import { adminUsersApi } from "@/lib/api/admin-users-api";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  Activity,
  BookOpen,
  History,
  Settings,
  Trash2,
  Lock,
  Shield,
  CreditCard
} from "lucide-react";
import { toast } from "sonner";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { logger } from '@/lib/logger';
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { UserDetails } from "./_components/types";
import { pickEditableUserFields } from "./_components/types";
import { UserSkeleton } from "./_components/user-skeleton";
import { UserProfileSidebar } from "./_components/user-profile-sidebar";
import { UserStatsGrid } from "./_components/user-stats-grid";
import { OverviewTab } from "./_components/overview-tab";
import { AcademicTab } from "./_components/academic-tab";
import { ActivityTab } from "./_components/activity-tab";
import { SettingsTab } from "./_components/settings-tab";
import { SecurityTab } from "./_components/security-tab";
import { BillingTab } from "./_components/billing-tab";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { getUserActionBlockReason } from "@/lib/user-action-guards";
import { useUIState } from "@/hooks/use-ui-state";

const RESERVED_ROUTE_SEGMENTS = new Set(["edit", "new", "create", "permissions"]);

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, hasPermission } = usePermission();
  const canManageUsers = hasPermission(PERMISSIONS.USERS_MANAGE);
  const userId = params.id as string;

  const [user, setUser] = React.useState<UserDetails | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [, setIsEditing] = React.useState(false);
  const [activeTab, setActiveTab] = useUIState<string>("user-detail-active-tab", "overview");
  const [editedUser, setEditedUser] = React.useState<Partial<UserDetails>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [resettingPassword, setResettingPassword] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const handleResetPassword = async () => {
    if (!user || !canManageUsers) {
      toast.error("غير مصرح بتنفيذ الإجراء");
      return;
    }
    const resetBlock = getUserActionBlockReason(currentUser, user, "reset-password");
    if (resetBlock) {
      toast.error(resetBlock);
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    setResettingPassword(true);
    try {
      const response = await adminFetch(`/admin/users/${userId}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      if (response.ok) {
        toast.success("تم تغيير كلمة مرور المستخدم بنجاح وجلساته النشطة ألغيت");
        setPasswordDialogOpen(false);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await response.json();
        toast.error(data.error || data.message || "حدث خطأ أثناء تغيير كلمة المرور");
      }
    } catch (error) {
      logger.error("Error resetting password:", error);
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setResettingPassword(false);
    }
  };

  const fetchUser = React.useCallback(async () => {
    if (!userId || RESERVED_ROUTE_SEGMENTS.has(userId)) {
      router.replace("/admin/users");
      setLoading(false);
      return;
    }
    try {
      const data = await adminUsersApi.get(userId);
      setUser(data);
      setEditedUser(data);
    } catch (error) {
      logger.error("Error fetching user:", error);
      toast.error("المستخدم غير موجود");
      router.push("/admin/users");
    } finally {
      setLoading(false);
    }
  }, [userId, router]);

  React.useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleUpdate = async () => {
    if (!user || !canManageUsers) {
      toast.error("غير مصرح بتنفيذ الإجراء");
      return;
    }
    const updateBlock = getUserActionBlockReason(currentUser, user, "role-change");
    if (updateBlock) {
      toast.error(updateBlock);
      return;
    }
    setSaving(true);
    try {
      const response = await adminFetch(`/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pickEditableUserFields(editedUser))
      });

      if (response.ok) {
        toast.success("تم تحديث بيانات المستخدم بنجاح");
        setIsEditing(false);
        fetchUser();
      } else {
        const data = await response.json();
        toast.error(data.message || "حدث خطأ أثناء التحديث");
      }
    } catch (error) {
      logger.error("Error updating user:", error);
      toast.error("حدث خطأ أثناء تحديث بيانات المستخدم");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !canManageUsers) {
      toast.error("غير مصرح بتنفيذ الإجراء");
      return;
    }
    const deleteBlock = getUserActionBlockReason(currentUser, user, "delete");
    if (deleteBlock) {
      toast.error(deleteBlock);
      return;
    }
    try {
      const response = await adminFetch(`/admin/users/${userId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast.success("تم حذف المستخدم بنجاح");
        router.push("/admin/users");
      } else {
        toast.error("حدث خطأ أثناء حذف المستخدم");
      }
    } catch (error) {
      logger.error("Error deleting user:", error);
      toast.error("حدث خطأ في الاتصال بالخادم");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (loading) return <UserSkeleton />;
  if (!user) return null;

  return (
    <div className="space-y-8 pb-10" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title={user.name || "تفاصيل المستخدم"}
          description={`إدارة بيانات ونشاط ${user.name || user.email}`}
          className="p-0" />

        <div className="flex items-center gap-3">
          <AdminButton variant="outline" className="rounded-2xl border-white/10" onClick={() => router.push("/admin/users")} icon={ArrowRight}>
            قائمة المستخدمين
          </AdminButton>
          {canManageUsers && !getUserActionBlockReason(currentUser, user, "delete") && <AdminButton
            variant="destructive"
            className="rounded-2xl shadow-xl shadow-danger/20"
            onClick={() => setDeleteDialogOpen(true)}
            icon={Trash2}
          >
            حذف المستخدم
          </AdminButton>}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <UserProfileSidebar
          user={user}
          setActiveTab={setActiveTab}
          router={router}
          onChangePassword={() => setPasswordDialogOpen(true)}
          canManage={canManageUsers}
        />

        <div className="lg:col-span-3 space-y-8">
          <UserStatsGrid user={user} />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <div className="bg-card p-1.5 rounded-2xl border shadow-sm inline-flex w-full md:w-auto">
              <TabsList className="bg-transparent h-10 w-full md:w-auto">
                <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg flex items-center gap-2 px-6">
                  <Activity className="h-4 w-4" />
                  نظرة عامة
                </TabsTrigger>
                <TabsTrigger value="academic" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg flex items-center gap-2 px-6">
                  <BookOpen className="h-4 w-4" />
                  الأداء الأكاديمي
                </TabsTrigger>
                <TabsTrigger value="activity" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg flex items-center gap-2 px-6">
                  <History className="h-4 w-4" />
                  سجل النشاط
                </TabsTrigger>
                {canManageUsers && <TabsTrigger value="settings" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg flex items-center gap-2 px-6">
                  <Settings className="h-4 w-4" />
                  الإعدادات
                </TabsTrigger>}
                <TabsTrigger value="security" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg flex items-center gap-2 px-6">
                  <Shield className="h-4 w-4" />
                  الأمان
                </TabsTrigger>
                <TabsTrigger value="billing" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg flex items-center gap-2 px-6">
                  <CreditCard className="h-4 w-4" />
                  المالية
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview">
              <OverviewTab user={user} />
            </TabsContent>

            <TabsContent value="academic">
              <AcademicTab user={user} />
            </TabsContent>

            <TabsContent value="activity">
              <ActivityTab user={user} />
            </TabsContent>

            {canManageUsers && <TabsContent value="settings">
              <SettingsTab
                user={user}
                editedUser={editedUser}
                setEditedUser={setEditedUser}
                handleUpdate={handleUpdate}
                setIsEditing={setIsEditing}
                saving={saving}
              />
            </TabsContent>}

            <TabsContent value="security">
              <SecurityTab
                user={user}
                actionBlockReason={!canManageUsers
                  ? "غير مصرح لك بإدارة المستخدمين"
                  : getUserActionBlockReason(currentUser, user, "suspend")}
                onUserChange={(updatedUser) => {
                  setUser(updatedUser);
                  setEditedUser(updatedUser);
                }}
              />
            </TabsContent>
            <TabsContent value="billing">
              <BillingTab user={user} canManage={canManageUsers} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AdminConfirm
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="حذف المستخدم نهائياً؟"
        description="هل أنت متأكد من حذف هذا المستخدم؟ سيتم مسح جميع بياناته ونشاطه من المنصة ولا يمكن التراجع عن هذا الإجراء."
        confirmText="تأكيد الحذف"
        variant="destructive"
      />

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="rounded-[2rem] border-white/10 bg-card/95 backdrop-blur-xl max-w-md" dir="rtl">
          <DialogHeader className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
              <Lock className="h-8 w-8" />
            </div>
            <DialogTitle className="text-center text-2xl font-black tracking-tight">
              تغيير كلمة المرور
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground font-medium px-4">
              أدخل كلمة المرور الجديدة للمسؤول {user.name || user.email}. سيتم فرض تسجيل الخروج من كافة الأجهزة تلقائياً بعد تغييرها.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">كلمة المرور الجديدة</label>
              <Input
                type="password"
                className="h-12 rounded-2xl bg-accent/10 border-white/10 px-4 text-sm focus:ring-1 ring-primary outline-none"
                placeholder="أدخل 8 أحرف على الأقل..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">تأكيد كلمة المرور</label>
              <Input
                type="password"
                className="h-12 rounded-2xl bg-accent/10 border-white/10 px-4 text-sm focus:ring-1 ring-primary outline-none"
                placeholder="أعد كتابة كلمة المرور..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="mt-6 flex-col-reverse sm:flex-row gap-3 sm:gap-0">
            <AdminButton variant="outline" className="rounded-2xl h-12 flex-1" onClick={() => setPasswordDialogOpen(false)}>
              إلغاء
            </AdminButton>
            <AdminButton
              variant="default"
              loading={resettingPassword}
              onClick={handleResetPassword}
              className="rounded-2xl h-12 flex-1"
            >
              حفظ كلمة المرور
            </AdminButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);
}
