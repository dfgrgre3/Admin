"use client";

import { Ban, CheckCircle } from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { UserStatus } from "@/types/enums";
import type { AdminUserListItem } from "@/lib/api/admin-users-api";
import type { ActivateDialogState, SuspendDialogState } from "../_components/list-types";

interface StatusActionsProps {
  user: AdminUserListItem;
  isDeleted: boolean;
  canSuspendUsers: boolean;
  suspendBlocked: string | null;
  setSuspendDialog: (state: SuspendDialogState) => void;
  setActivateDialog: (state: ActivateDialogState) => void;
}

export function StatusActions({
  user, isDeleted, canSuspendUsers, suspendBlocked,
  setSuspendDialog, setActivateDialog,
}: StatusActionsProps) {
  if (!canSuspendUsers || isDeleted) return null;

  const canSuspend = user.status !== UserStatus.SUSPENDED && user.status !== UserStatus.BANNED;
  const canActivate = user.status === UserStatus.SUSPENDED
    || user.status === UserStatus.BANNED
    || user.status === UserStatus.INACTIVE;

  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuLabel className="text-[11px]">الحالة</DropdownMenuLabel>
      {canSuspend && (
        <DropdownMenuItem
          onClick={() => setSuspendDialog({ open: true, ids: [user.id] })}
          disabled={!!suspendBlocked}
        >
          <Ban className="ml-2 h-4 w-4 text-warning" />
          تعليق الحساب
        </DropdownMenuItem>
      )}
      {canActivate && (
        <DropdownMenuItem onClick={() => setActivateDialog({ open: true, ids: [user.id] })}>
          <CheckCircle className="ml-2 h-4 w-4 text-success" />
          تفعيل الحساب
        </DropdownMenuItem>
      )}
    </>
  );
}