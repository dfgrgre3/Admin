"use client";

import { BadgeCheck, CheckCircle, Phone, Send } from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import type { AdminUserListItem } from "@/lib/api/admin-users-api";
import type { VerifyDialogState } from "../_components/list-types";

interface VerificationActionsProps {
  user: AdminUserListItem;
  isDeleted: boolean;
  canManageVerification: boolean;
  setVerifyDialog: (state: VerifyDialogState) => void;
  onSendActivationLink: (user: AdminUserListItem) => void;
}

export function VerificationActions({
  user, isDeleted, canManageVerification, setVerifyDialog, onSendActivationLink,
}: VerificationActionsProps) {
  if (!canManageVerification || isDeleted) return null;
  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuLabel className="text-[11px]">التوثيق</DropdownMenuLabel>
      {!user.emailVerified && (
        <DropdownMenuItem onClick={() => setVerifyDialog({ open: true, user, type: "email" })}>
          <CheckCircle className="ml-2 h-4 w-4 text-success" />
          توثيق البريد
        </DropdownMenuItem>
      )}
      {!user.phoneVerified && (
        <DropdownMenuItem onClick={() => setVerifyDialog({ open: true, user, type: "phone" })}>
          <Phone className="ml-2 h-4 w-4 text-success" />
          توثيق الهاتف
        </DropdownMenuItem>
      )}
      <DropdownMenuItem onClick={() => onSendActivationLink(user)}>
        <Send className="ml-2 h-4 w-4 text-info" />
        إرسال رابط التفعيل
      </DropdownMenuItem>
    </>
  );
}