import type {
  ActivateDialogState, BulkRoleDialogState, DeleteDialogState, ImpersonateDialogState,
  MessageDialogState, PasswordDialogState, RestoreDialogState, RoleDialogState,
  SuspendDialogState, VerifyDialogState,
} from "../_components/list-types";

export interface UserListDialogsProps {
  deleteDialog: DeleteDialogState;
  setDeleteDialog: (state: DeleteDialogState) => void;
  onDelete: (ids: string[]) => void;

  restoreDialog: RestoreDialogState;
  setRestoreDialog: (state: RestoreDialogState) => void;
  onRestore: (ids: string[]) => void;

  suspendDialog: SuspendDialogState;
  setSuspendDialog: (state: SuspendDialogState) => void;
  onSuspend: (ids: string[], reason?: string) => void;

  activateDialog: ActivateDialogState;
  setActivateDialog: (state: ActivateDialogState) => void;
  onActivate: (ids: string[]) => void;

  passwordDialog: PasswordDialogState;
  setPasswordDialog: (state: PasswordDialogState) => void;
  onResetPassword: (userId: string, password: string) => void;

  verifyDialog: VerifyDialogState;
  setVerifyDialog: (state: VerifyDialogState) => void;
  onVerify: () => void;

  roleDialog: RoleDialogState;
  setRoleDialog: (state: RoleDialogState) => void;
  onAssignRole: () => void;

  bulkRoleDialog: BulkRoleDialogState;
  setBulkRoleDialog: (state: BulkRoleDialogState) => void;
  onBulkAssignRole: () => void;

  impersonateDialog: ImpersonateDialogState;
  setImpersonateDialog: (state: ImpersonateDialogState) => void;
  onImpersonate: () => void;
  impersonating: boolean;

  messageDialog: MessageDialogState;
  setMessageDialog: (state: MessageDialogState) => void;

  importDialogOpen: boolean;
  setImportDialogOpen: (open: boolean) => void;
  onImport: (rows: Record<string, unknown>[]) => Promise<void>;

  actionLoadingId: string | null;
}