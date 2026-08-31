"use client";

import { UserListDialogs } from "./user-list-dialogs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface PageDialogsProps { state: Record<string, any>; }

export function PageDialogs({ state: s }: PageDialogsProps) {
  return (
    <UserListDialogs
      deleteDialog={s.deleteDialog}
      setDeleteDialog={s.setDeleteDialog}
      onDelete={s.handleDelete}
      restoreDialog={s.restoreDialog}
      setRestoreDialog={s.setRestoreDialog}
      onRestore={s.handleRestore}
      suspendDialog={s.suspendDialog}
      setSuspendDialog={s.setSuspendDialog}
      onSuspend={s.handleSuspend}
      activateDialog={s.activateDialog}
      setActivateDialog={s.setActivateDialog}
      onActivate={s.handleActivate}
      passwordDialog={s.passwordDialog}
      setPasswordDialog={s.setPasswordDialog}
      onResetPassword={s.handleResetPassword}
      verifyDialog={s.verifyDialog}
      setVerifyDialog={s.setVerifyDialog}
      onVerify={() => s.verifyDialog.user && s.handleVerify(s.verifyDialog.user, s.verifyDialog.type)}
      roleDialog={s.roleDialog}
      setRoleDialog={s.setRoleDialog}
      onAssignRole={() => s.roleDialog.user && s.roleDialog.role && s.handleAssignRole(s.roleDialog.user, s.roleDialog.role)}
      bulkRoleDialog={s.bulkRoleDialog}
      setBulkRoleDialog={s.setBulkRoleDialog}
      onBulkAssignRole={() => s.bulkRoleDialog.role && s.handleAssignRole(null, s.bulkRoleDialog.role, s.bulkRoleDialog.ids)}
      impersonateDialog={s.impersonateDialog}
      setImpersonateDialog={s.setImpersonateDialog}
      onImpersonate={s.handleImpersonate}
      impersonating={s.impersonating}
      messageDialog={s.messageDialog}
      setMessageDialog={s.setMessageDialog}
      importDialogOpen={s.importDialogOpen}
      setImportDialogOpen={s.setImportDialogOpen}
      onImport={s.handleImport}
      actionLoadingId={s.actionLoadingId}
    />
  );
}