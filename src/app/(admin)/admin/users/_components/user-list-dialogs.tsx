"use client";

import type { UserListDialogsProps } from "../_dialogs/dialog-types";
import {
  DeleteConfirm, RestoreConfirm, ActivateConfirm, VerifyConfirm,
} from "../_dialogs/confirm-dialogs";
import { SuspendDialog } from "../_dialogs/suspend-dialog";
import { PasswordDialog } from "../_dialogs/password-dialog";
import { RoleDialog, BulkRoleDialog } from "../_dialogs/role-dialogs";
import { ImpersonateConfirm, MessageDialog, ImportDialog } from "../_dialogs/impersonate-import-dialogs";

export function UserListDialogs(props: UserListDialogsProps) {
  const {
    deleteDialog, setDeleteDialog, onDelete,
    restoreDialog, setRestoreDialog, onRestore,
    suspendDialog, setSuspendDialog, onSuspend,
    activateDialog, setActivateDialog, onActivate,
    passwordDialog, setPasswordDialog, onResetPassword,
    verifyDialog, setVerifyDialog, onVerify,
    roleDialog, setRoleDialog, onAssignRole,
    bulkRoleDialog, setBulkRoleDialog, onBulkAssignRole,
    impersonateDialog, setImpersonateDialog, onImpersonate, impersonating,
    messageDialog, setMessageDialog,
    importDialogOpen, setImportDialogOpen, onImport,
    actionLoadingId,
  } = props;

  return (
    <>
      <DeleteConfirm
        state={deleteDialog} setState={setDeleteDialog}
        onConfirm={onDelete} loading={actionLoadingId === "bulk-delete"}
      />
      <RestoreConfirm
        state={restoreDialog} setState={setRestoreDialog}
        onConfirm={onRestore} loading={actionLoadingId === "bulk-restore"}
      />
      <SuspendDialog
        state={suspendDialog} setState={setSuspendDialog}
        onSuspend={onSuspend} loading={actionLoadingId === "bulk-suspend"}
      />
      <ActivateConfirm
        state={activateDialog} setState={setActivateDialog}
        onConfirm={onActivate} loading={actionLoadingId === "bulk-activate"}
      />
      <PasswordDialog
        state={passwordDialog} setState={setPasswordDialog}
        onSubmit={onResetPassword} loading={actionLoadingId === passwordDialog.user?.id}
      />
      <VerifyConfirm
        state={verifyDialog} setState={setVerifyDialog}
        onConfirm={onVerify} loading={actionLoadingId === verifyDialog.user?.id}
      />
      <RoleDialog
        state={roleDialog} setState={setRoleDialog}
        onAssign={onAssignRole} loading={actionLoadingId === "bulk-role"}
      />
      <BulkRoleDialog
        state={bulkRoleDialog} setState={setBulkRoleDialog}
        onAssign={onBulkAssignRole} loading={actionLoadingId === "bulk-role"}
      />
      <ImpersonateConfirm
        state={impersonateDialog} setState={setImpersonateDialog}
        onConfirm={onImpersonate} loading={impersonating}
      />
      <MessageDialog state={messageDialog} setState={setMessageDialog} />
      <ImportDialog open={importDialogOpen} setOpen={setImportDialogOpen} onImport={onImport} />
    </>
  );
}