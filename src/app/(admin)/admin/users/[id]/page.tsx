"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { useUIState } from "@/hooks/use-ui-state";
import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { getUserActionBlockReason } from "@/lib/user-action-guards";

import type { UserDetails } from "./_components/types";
import { UserSkeleton } from "./_components/user-skeleton";
import { UserProfileSidebar } from "./_components/user-profile-sidebar";
import { UserStatsGrid } from "./_components/user-stats-grid";
import { UserDetailTabs } from "./_components/user-detail-tabs";
import { UserDetailHeader } from "./_components/user-detail-header";
import { PasswordResetDialog } from "./_components/password-reset-dialog";
import {
  useUserDetails,
  useUserMutations,
  usePasswordReset,
  useImpersonate,
} from "./_hooks/use-user-actions";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, hasPermission } = usePermission();
  const userId = params.id as string;
  const canManageUsers = hasPermission(PERMISSIONS.USERS_MANAGE);
  const canViewAudit = canManageUsers || hasPermission(PERMISSIONS.USERS_VIEW_AUDIT_LOG);

  const [activeTab, setActiveTab] = useUIState<string>("user-detail-active-tab", "overview");
  const [editedUser, setEditedUser] = React.useState<Partial<UserDetails>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = React.useState(false);
  const [impersonateDialogOpen, setImpersonateDialogOpen] = React.useState(false);

  const { data: user, isLoading, isError, error } = useUserDetails(userId);
  const { updateMutation, deleteMutation, validateAction, queryClient } = useUserMutations(
    userId,
    currentUser,
    canManageUsers,
  );
  const submitPassword = usePasswordReset(userId, user, currentUser, canManageUsers);
  const { impersonate, impersonating } = useImpersonate(currentUser, canManageUsers);

  React.useEffect(() => {
    if (isError) {
      const errMsg = error instanceof Error ? error.message : "المستخدم غير موجود";
      logger.error("Error fetching user:", error);
      toast.error(errMsg);
      if (errMsg === "المستخدم غير موجود") router.push("/admin/users");
    }
  }, [isError, error, router]);

  const handleSave = () => {
    if (!validateAction(user, "role-change")) return;
    updateMutation.mutate(editedUser);
  };

  const handleDelete = () => {
    if (!validateAction(user, "delete")) return;
    deleteMutation.mutate();
  };

  const handleSecurityChange = (updatedUser: Partial<UserDetails>) => {
    setEditedUser(updatedUser);
    queryClient.invalidateQueries({ queryKey: ["admin", "user", userId] });
  };

  if (isLoading) return <UserSkeleton />;
  if (!user) return null;

  return (
    <div className="space-y-8 pb-10" dir="rtl">
      <UserDetailHeader
        user={user}
        onBack={() => router.push("/admin/users")}
        onDelete={() => setDeleteDialogOpen(true)}
        canDelete={canManageUsers && !getUserActionBlockReason(currentUser, user, "delete")}
      />

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
          <UserDetailTabs
            user={user}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            canManageUsers={canManageUsers}
            canViewAudit={canViewAudit}
            saving={updateMutation.isPending}
            editedUser={editedUser}
            setEditedUser={setEditedUser}
            onSave={handleSave}
            onSecurityChange={handleSecurityChange}
            securityBlockReason={!canManageUsers ? "غير مصرح لك بإدارة المستخدمين" : getUserActionBlockReason(currentUser, user, "suspend") ?? undefined}
          />
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

      <PasswordResetDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        userName={user.name || user.email || ""}
        onSubmit={submitPassword}
      />

      <AdminConfirm
        open={impersonateDialogOpen}
        onOpenChange={setImpersonateDialogOpen}
        title="تبديل الهوية (Impersonate)"
        description={`أنت على وشك الدخول بهوية المستخدم ${user.name || user.email}. ستتمكن من رؤية المنصة تماماً كما يراها لحل مشاكل الدعم الفني. سيُسجّل هذا الإجراء في سجل التدقيق.`}
        confirmText="تأكيد الدخول"
        variant="premium"
        onConfirm={() => impersonate(user.id, user.name || user.email || "", user)}
        loading={impersonating}
      />
    </div>
  );
}