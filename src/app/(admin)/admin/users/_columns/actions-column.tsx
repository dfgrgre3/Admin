"use client";

import { Loader2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { UserStatus } from "@/types/enums";
import { getUserActionBlockReason } from "@/lib/user-action-guards";
import type { AdminUserListItem } from "@/lib/api/admin-users-api";
import type { ColumnDef } from "@tanstack/react-table";
import type { UseUserListColumnsParams } from "./column-types";
import { ViewEditActions } from "./actions-view-edit";
import { VerificationActions } from "./actions-verification";
import { StatusActions } from "./actions-status";
import { PasswordRoleActions } from "./actions-password-role";
import { RelatedDataActions } from "./actions-related-data";
import { PermissionsDeleteActions } from "./actions-permissions-delete";

export function createActionsColumn(params: UseUserListColumnsParams): ColumnDef<AdminUserListItem> {
  const {
    currentUser, actionLoadingId,
    canUpdateUsers, canManageVerification, canSuspendUsers, canManagePassword, canAssignRoles,
    canViewSessions, canTerminateSessions, canViewActivity, canViewAudit, canViewOrders,
    canViewFinancial, canViewCertificates, canViewSupport, canSendNotifications, canManageUsers,
    canAssignPermissions, canRestoreUsers, canDeleteUsers,
    setVerifyDialog, onSendActivationLink, setSuspendDialog, setActivateDialog, setPasswordDialog,
    setRoleDialog, onTerminateAllSessions, setMessageDialog, setImpersonateDialog,
    setRestoreDialog, setDeleteDialog,
  } = params;

  return {
    id: "actions",
    header: "الإجراءات",
    cell: ({ row }) => {
      const user = row.original;
      const deleteBlock = getUserActionBlockReason(currentUser, user, "delete");
      const suspendBlock = getUserActionBlockReason(currentUser, user, "suspend");
      const impersonateBlock = getUserActionBlockReason(currentUser, user, "impersonate");
      const passwordBlock = getUserActionBlockReason(currentUser, user, "reset-password");
      const isDeleted = user.status === UserStatus.DELETED;
      const loadingThis = actionLoadingId === user.id;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <AdminButton variant="ghost" size="icon-sm" className="h-8 w-8" disabled={loadingThis}>
              {loadingThis ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
            </AdminButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 max-h-[420px] overflow-y-auto">
            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ViewEditActions userId={user.id} canUpdateUsers={canUpdateUsers} isDeleted={isDeleted} />
            <VerificationActions
              user={user}
              isDeleted={isDeleted}
              canManageVerification={canManageVerification}
              setVerifyDialog={setVerifyDialog}
              onSendActivationLink={onSendActivationLink}
            />
            <StatusActions
              user={user}
              isDeleted={isDeleted}
              canSuspendUsers={canSuspendUsers}
              suspendBlocked={suspendBlock}
              setSuspendDialog={setSuspendDialog}
              setActivateDialog={setActivateDialog}
            />
            <PasswordRoleActions
              user={user}
              isDeleted={isDeleted}
              canManagePassword={canManagePassword}
              canAssignRoles={canAssignRoles}
              passwordBlocked={passwordBlock}
              setPasswordDialog={setPasswordDialog}
              setRoleDialog={setRoleDialog}
            />
            <RelatedDataActions
              userId={user.id}
              isDeleted={isDeleted}
              canViewSessions={canViewSessions}
              canTerminateSessions={canTerminateSessions}
              canViewActivity={canViewActivity}
              canViewAudit={canViewAudit}
              canViewOrders={canViewOrders}
              canViewFinancial={canViewFinancial}
              canViewCertificates={canViewCertificates}
              canViewSupport={canViewSupport}
              onTerminateAllSessions={onTerminateAllSessions}
            />
            <PermissionsDeleteActions
              userId={user.id}
              isDeleted={isDeleted}
              canSendNotifications={canSendNotifications}
              canManageUsers={canManageUsers}
              canAssignPermissions={canAssignPermissions}
              canRestoreUsers={canRestoreUsers}
              canDeleteUsers={canDeleteUsers}
              impersonateBlocked={impersonateBlock}
              deleteBlocked={deleteBlock}
              setMessageDialog={setMessageDialog}
              setImpersonateDialog={setImpersonateDialog}
              setRestoreDialog={setRestoreDialog}
              setDeleteDialog={setDeleteDialog}
              user={user}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  };
}