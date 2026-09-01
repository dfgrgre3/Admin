import type { AdminUserListItem } from "@/lib/api/admin-users-api";
import type { UserActionActor } from "@/lib/user-action-guards";
import type {
  ActivateDialogState,
  ImpersonateDialogState,
  MessageDialogState,
  PasswordDialogState,
  RestoreDialogState,
  RoleDialogState,
  SuspendDialogState,
  VerifyDialogState,
  DeleteDialogState,
} from "../_components/list-types";

export interface ColumnPermissions {
  currentUser: UserActionActor | null | undefined;
  canUpdateUsers: boolean;
  canManageVerification: boolean;
  canSuspendUsers: boolean;
  canManagePassword: boolean;
  canAssignRoles: boolean;
  canViewSessions: boolean;
  canTerminateSessions: boolean;
  canViewActivity: boolean;
  canViewAudit: boolean;
  canViewOrders: boolean;
  canViewFinancial: boolean;
  canViewCertificates: boolean;
  canViewSupport: boolean;
  canSendNotifications: boolean;
  canManageUsers: boolean;
  canAssignPermissions: boolean;
  canRestoreUsers: boolean;
  canDeleteUsers: boolean;
}

export interface ColumnHandlers {
  setVerifyDialog: (state: VerifyDialogState) => void;
  onSendActivationLink: (user: AdminUserListItem) => void;
  setSuspendDialog: (state: SuspendDialogState) => void;
  setActivateDialog: (state: ActivateDialogState) => void;
  setPasswordDialog: (state: PasswordDialogState) => void;
  setRoleDialog: (state: RoleDialogState) => void;
  onTerminateAllSessions: (user: AdminUserListItem) => void;
  setMessageDialog: (state: MessageDialogState) => void;
  setImpersonateDialog: (state: ImpersonateDialogState) => void;
  setRestoreDialog: (state: RestoreDialogState) => void;
  setDeleteDialog: (state: DeleteDialogState) => void;
}

export interface UseUserListColumnsParams extends ColumnPermissions, ColumnHandlers {
  actionLoadingId: string | null;
}