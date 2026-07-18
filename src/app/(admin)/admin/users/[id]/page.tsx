"use client";

import { adminFetch } from "@/lib/api/admin-api";
import { adminUsersApi } from "@/lib/api/admin-users-api";
import { apiRoutes } from "@/lib/api/routes";
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
  CreditCard,
  LifeBuoy,
  LogIn
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordResetSchema, type PasswordResetFormData } from "@/lib/validations/user-schemas";

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
import { SupportNotesTab } from "./_components/support-notes-tab";
import { SecurityActivitySection } from "./_components/security-activity";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { getUserActionBlockReason } from "@/lib/user-action-guards";
import { useUIState } from "@/hooks/use-ui-state";

const RESERVED_ROUTE_SEGMENTS = new Set(["edit", "new", "create", "permissions"]);

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: currentUser, hasPermission } = usePermission();
  const canManageUsers = hasPermission(PERMISSIONS.USERS_MANAGE);
  const userId = params.id as string;

  const [activeTab, setActiveTab] = useUIState<string>("user-detail-active-tab", "overview");
  const [editedUser, setEditedUser] = React.useState<Partial<UserDetails>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = React.useState(false);
  const [impersonateDialogOpen, setImpersonateDialogOpen] = React.useState(false);
  const [impersonating, setImpersonating] = React.useState(false);

  // React Hook Form + Zod for password reset
  const {
    register,
    handleSubmit,
    watch,
    reset: resetPasswordForm,
    formState: { errors, isValid, dirtyFields },
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
    mode: "onChange",
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Watch password fields to determine if button should be enabled
  const newPasswordValue = watch("newPassword");
  const confirmPasswordValue = watch("confirmPassword");
  const isPasswordFormValid =
    dirtyFields.newPassword &&
    dirtyFields.confirmPassword &&
    !errors.newPassword &&
    !errors.confirmPassword &&
    newPasswordValue === confirmPasswordValue &&
    newPasswordValue.length >= 8;

  // Tanstack Query for fetching user data with AbortSignal support
  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<UserDetails>({
    queryKey: ["admin", "user", userId],
    queryFn: async ({ signal }) => {
      if (!userId || RESERVED_ROUTE_SEGMENTS.has(userId)) {
        router.replace("/admin/users");
        throw new Error("Invalid user ID");
      }
      return adminUsersApi.get(userId, { signal });
    },
    retry: 1,
    staleTime: 30_000, // 30 seconds before refetch
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    meta: {
      errorMessage: "المستخدم غير موجود",
    },
  });

  // Handle query errors
  React.useEffect(() => {
    if (isError) {
      const errMsg = error instanceof Error ? error.message : "المستخدم غير موجود";
      logger.error("Error fetching user:", error);
      toast.error(errMsg);
      if (errMsg === "المستخدم غير موجود") {
        router.push("/admin/users");
      }
    }
  }, [isError, error, router]);

  // Update mutation using TanStack Query
  const updateMutation = useMutation({
    mutationFn: async (userData: Partial<UserDetails>) => {
      const response = await adminFetch(`/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pickEditableUserFields(userData)),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "فشل تحديث البيانات");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("تم تحديث بيانات المستخدم بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin", "user", userId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "حدث خطأ أثناء تحديث البيانات");
    },
  });

  // Delete mutation using TanStack Query
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("المستخدم غير موجود");
      const response = await adminFetch(`/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "فشل حذف المستخدم");
      }
    },
    onSuccess: () => {
      toast.success("تم حذف المستخدم بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      router.push("/admin/users");
    },
    onError: (err: Error) => {
      toast.error(err.message || "حدث خطأ أثناء حذف المستخدم");
    },
    onSettled: () => {
      setDeleteDialogOpen(false);
    },
  });

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
    updateMutation.mutate(editedUser);
  };

  const handleDelete = () => {
    if (!user || !canManageUsers) {
      toast.error("غير مصرح بتنفيذ الإجراء");
      return;
    }
    const deleteBlock = getUserActionBlockReason(currentUser, user, "delete");
    if (deleteBlock) {
      toast.error(deleteBlock);
      return;
    }
    deleteMutation.mutate();
  };

  const handleResetPassword = handleSubmit(async (formData: PasswordResetFormData) => {
    if (!user || !canManageUsers) {
      toast.error("غير مصرح بتنفيذ الإجراء");
      return;
    }
    const resetBlock = getUserActionBlockReason(currentUser, user, "reset-password");
    if (resetBlock) {
      toast.error(resetBlock);
      return;
    }

    try {
      const response = await adminFetch(`/admin/users/${userId}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: formData.newPassword }),
      });
      if (response.ok) {
        toast.success("تم تغيير كلمة مرور المستخدم بنجاح وجلساته النشطة ألغيت");
        setPasswordDialogOpen(false);
        resetPasswordForm();
      } else {
        const data = await response.json();
        toast.error(data.error || data.message || "حدث خطأ أثناء تغيير كلمة المرور");
      }
    } catch (error) {
      logger.error("Error resetting password:", error);
      toast.error("خطأ في الاتصال بالخادم");
    }
  });

  const handleImpersonate = async (targetUserId: string, targetName: string) => {
    if (!user) return;
    const blocked = getUserActionBlockReason(currentUser, user, "impersonate");
    if (!canManageUsers || blocked) {
      toast.error(blocked || "غير مصرح بتنفيذ الإجراء");
      return;
    }
    setImpersonating(true);
    try {
      const res = await adminFetch(apiRoutes.admin.impersonateById(targetUserId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        credentials: "include",
      });
      if (res.ok) {
        toast.success(`تم تبديل الهوية إلى ${targetName}، جاري التوجيه...`);
        window.location.href = "/";
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "فشل في تبديل الهوية");
      }
    } catch (error) {
      logger.error("فشل تبديل الهوية", error);
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setImpersonating(false);
      setImpersonateDialogOpen(false);
    }
  };

  if (isLoading) return <UserSkeleton />;
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
          onImpersonate={() => setImpersonateDialogOpen(true)}
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
                <TabsTrigger value="support" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg flex items-center gap-2 px-6">
                  <LifeBuoy className="h-4 w-4" />
                  الدعم والملاحظات
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
              <div className="mt-8">
                <SecurityActivitySection user={user} />
              </div>
            </TabsContent>

            {canManageUsers && <TabsContent value="settings">
              <SettingsTab
                user={user}
                editedUser={editedUser}
                setEditedUser={setEditedUser}
                handleUpdate={handleUpdate}
                setIsEditing={() => {}}
                saving={updateMutation.isPending}
              />
            </TabsContent>}

            <TabsContent value="security">
              <SecurityTab
                user={user}
                actionBlockReason={!canManageUsers
                  ? "غير مصرح لك بإدارة المستخدمين"
                  : getUserActionBlockReason(currentUser, user, "suspend")}
                onUserChange={(updatedUser) => {
                  setEditedUser(updatedUser);
                  queryClient.invalidateQueries({ queryKey: ["admin", "user", userId] });
                }}
              />
            </TabsContent>
            <TabsContent value="billing">
              <BillingTab user={user} canManage={canManageUsers} />
            </TabsContent>
            <TabsContent value="support">
              <SupportNotesTab user={user} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AdminConfirm
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
        title="حذف المستخدم نهائياً؟"
        description="هل أنت متأكد من حذف هذا المستخدم؟ سيتم مسح جميع بياناته ونشاطه من المنصة ولا يمكن التراجع عن هذا الإجراء."
        confirmText="تأكيد الحذف"
        variant="destructive"
      />

      <Dialog open={passwordDialogOpen} onOpenChange={(open) => {
        setPasswordDialogOpen(open);
        if (!open) resetPasswordForm();
      }}>
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
          <form onSubmit={handleResetPassword}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">كلمة المرور الجديدة</label>
                <Input
                  type="password"
                  className={`h-12 rounded-2xl bg-accent/10 border-white/10 px-4 text-sm focus:ring-1 ring-primary outline-none ${errors.newPassword ? "border-destructive" : ""}`}
                  placeholder="أدخل 8 أحرف على الأقل..."
                  {...register("newPassword")}
                />
                {errors.newPassword && (
                  <p className="text-xs text-destructive font-medium mt-1">{errors.newPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">تأكيد كلمة المرور</label>
                <Input
                  type="password"
                  className={`h-12 rounded-2xl bg-accent/10 border-white/10 px-4 text-sm focus:ring-1 ring-primary outline-none ${errors.confirmPassword ? "border-destructive" : ""}`}
                  placeholder="أعد كتابة كلمة المرور..."
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive font-medium mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
              {newPasswordValue && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[
                      newPasswordValue.length >= 8,
                      /[A-Z]/.test(newPasswordValue),
                      /[a-z]/.test(newPasswordValue),
                      /[0-9]/.test(newPasswordValue),
                      /[!@#$%^&*(),.?":{}|<>]/.test(newPasswordValue),
                    ].map((pass, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          pass ? "bg-success" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <ul className="text-[10px] space-y-0.5 text-muted-foreground">
                    <li className={newPasswordValue.length >= 8 ? "text-success" : ""}>✓ 8 أحرف على الأقل</li>
                    <li className={/[A-Z]/.test(newPasswordValue) ? "text-success" : ""}>✓ حرف كبير (A-Z)</li>
                    <li className={/[a-z]/.test(newPasswordValue) ? "text-success" : ""}>✓ حرف صغير (a-z)</li>
                    <li className={/[0-9]/.test(newPasswordValue) ? "text-success" : ""}>✓ رقم (0-9)</li>
                    <li className={/[!@#$%^&*(),.?":{}|<>]/.test(newPasswordValue) ? "text-success" : ""}>✓ رمز خاص</li>
                  </ul>
                </div>
              )}
            </div>
            <DialogFooter className="mt-6 flex-col-reverse sm:flex-row gap-3 sm:gap-0">
              <AdminButton variant="outline" className="rounded-2xl h-12 flex-1" onClick={() => setPasswordDialogOpen(false)} type="button">
                إلغاء
              </AdminButton>
              <AdminButton
                variant="default"
                disabled={!isPasswordFormValid}
                type="submit"
                className="rounded-2xl h-12 flex-1"
              >
                حفظ كلمة المرور
              </AdminButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AdminConfirm
        open={impersonateDialogOpen}
        onOpenChange={setImpersonateDialogOpen}
        title="تبديل الهوية (Impersonate)"
        description={`أنت على وشك الدخول بهوية المستخدم ${user.name || user.email}. ستتمكن من رؤية المنصة تماماً كما يراها لحل مشاكل الدعم الفني. سيُسجّل هذا الإجراء في سجل التدقيق.`}
        confirmText="تأكيد الدخول"
        variant="premium"
        onConfirm={() => handleImpersonate(user.id, user.name || user.email)}
        loading={impersonating}
      />
    </div>);
}