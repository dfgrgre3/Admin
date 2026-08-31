"use client";

import { Key, UserCog } from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { AdminUserListItem } from "@/lib/api/admin-users-api";
import type { PasswordDialogState, RoleDialogState } from "../_components/list-types";

interface PasswordRoleActionsProps {
  user: AdminUserListItem;
  isDeleted: boolean;
  canManagePassword: boolean;
  canAssignRoles: boolean;
  passwordBlocked: string | null;
  setPasswordDialog: (state: PasswordDialogState) => void;
  setRoleDialog: (state: RoleDialogState) => void;
}

export function PasswordRoleActions({
  user, isDeleted, canManagePassword, canAssignRoles, passwordBlocked,
  setPasswordDialog, setRoleDialog,
}: PasswordRoleActionsProps) {
  return (
    <>
      {canManagePassword && !isDeleted && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setPasswordDialog({ open: true, user })}
            disabled={!!passwordBlocked}
          >
            <Key className="ml-2 h-4 w-4" />
            تغيير كلمة المرور
          </DropdownMenuItem>
        </>
      )}
      {canAssignRoles && !isDeleted && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setRoleDialog({ open: true, user })}>
            <UserCog className="ml-2 h-4 w-4" />
            تغيير الدور
          </DropdownMenuItem>
        </>
      )}
    </>
  );
}