"use client";

import { Bell, LogIn, RotateCcw, Shield, Trash2 } from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import type { AdminUserListItem } from "@/lib/api/admin-users-api";
import type {
  DeleteDialogState, ImpersonateDialogState, MessageDialogState, RestoreDialogState,
} from "../_components/list-types";

interface PermissionsDeleteActionsProps {
  userId: string;
  isDeleted: boolean;
  canSendNotifications: boolean;
  canManageUsers: boolean;
  canAssignPermissions: boolean;
  canRestoreUsers: boolean;
  canDeleteUsers: boolean;
  impersonateBlocked: string | null;
  deleteBlocked: string | null;
  setMessageDialog: (state: MessageDialogState) => void;
  setImpersonateDialog: (state: ImpersonateDialogState) => void;
  setRestoreDialog: (state: RestoreDialogState) => void;
  setDeleteDialog: (state: DeleteDialogState) => void;
  user: AdminUserListItem;
}

export function PermissionsDeleteActions(props: PermissionsDeleteActionsProps) {
  const router = useRouter();
  const {
    userId, isDeleted, canSendNotifications, canManageUsers, canAssignPermissions,
    canRestoreUsers, canDeleteUsers, impersonateBlocked, deleteBlocked,
    setMessageDialog, setImpersonateDialog, setRestoreDialog, setDeleteDialog, user,
  } = props;

  return (
    <>
      {canSendNotifications && !isDeleted && (
        <DropdownMenuItem onClick={() => setMessageDialog({ open: true, users: [user] })}>
          <Bell className="ml-2 h-4 w-4" />
          إرسال إشعار
        </DropdownMenuItem>
      )}
      {canManageUsers && !isDeleted && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setImpersonateDialog({ open: true, user })}
            disabled={!!impersonateBlocked}
          >
            <LogIn className="ml-2 h-4 w-4" />
            تسجيل الدخول كـ
          </DropdownMenuItem>
        </>
      )}
      {canAssignPermissions && !isDeleted && (
        <DropdownMenuItem onClick={() => router.push(`/admin/users/${userId}/permissions`)}>
          <Shield className="ml-2 h-4 w-4" />
          إدارة الصلاحيات
        </DropdownMenuItem>
      )}
      <DropdownMenuSeparator />
      {isDeleted ? (
        canRestoreUsers && (
          <DropdownMenuItem
            onClick={() => setRestoreDialog({ open: true, ids: [userId] })}
            className="text-success"
          >
            <RotateCcw className="ml-2 h-4 w-4" />
            استعادة الحساب
          </DropdownMenuItem>
        )
      ) : (
        canDeleteUsers && (
          <DropdownMenuItem
            onClick={() => setDeleteDialog({ open: true, ids: [userId] })}
            disabled={!!deleteBlocked}
            className="text-destructive"
          >
            <Trash2 className="ml-2 h-4 w-4" />
            حذف (ناعم)
          </DropdownMenuItem>
        )
      )}
    </>
  );
}