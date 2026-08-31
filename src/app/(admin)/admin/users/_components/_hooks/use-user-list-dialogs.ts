"use client";

import * as React from "react";
import type {
  ActivateDialogState,
  BulkRoleDialogState,
  DeleteDialogState,
  ImpersonateDialogState,
  MessageDialogState,
  PasswordDialogState,
  RestoreDialogState,
  RoleDialogState,
  SuspendDialogState,
  VerifyDialogState,
} from "../list-types";

export function useUserListDialogs() {
  const [deleteDialog, setDeleteDialog] = React.useState<DeleteDialogState>({ open: false, ids: [] });
  const [restoreDialog, setRestoreDialog] = React.useState<RestoreDialogState>({ open: false, ids: [] });
  const [suspendDialog, setSuspendDialog] = React.useState<SuspendDialogState>({ open: false, ids: [] });
  const [activateDialog, setActivateDialog] = React.useState<ActivateDialogState>({ open: false, ids: [] });
  const [messageDialog, setMessageDialog] = React.useState<MessageDialogState>({ open: false, users: [] });
  const [passwordDialog, setPasswordDialog] = React.useState<PasswordDialogState>({ open: false, user: null });
  const [verifyDialog, setVerifyDialog] = React.useState<VerifyDialogState>({ open: false, user: null, type: "email" });
  const [roleDialog, setRoleDialog] = React.useState<RoleDialogState>({ open: false, user: null });
  const [bulkRoleDialog, setBulkRoleDialog] = React.useState<BulkRoleDialogState>({ open: false, ids: [] });
  const [impersonateDialog, setImpersonateDialog] = React.useState<ImpersonateDialogState>({ open: false, user: null });
  const [impersonating, setImpersonating] = React.useState(false);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const [exportingJson, setExportingJson] = React.useState(false);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);

  const closeAll = () => {
    setDeleteDialog({ open: false, ids: [] });
    setRestoreDialog({ open: false, ids: [] });
    setSuspendDialog({ open: false, ids: [] });
    setActivateDialog({ open: false, ids: [] });
    setMessageDialog({ open: false, users: [] });
    setPasswordDialog({ open: false, user: null });
    setVerifyDialog({ open: false, user: null, type: "email" });
    setRoleDialog({ open: false, user: null });
    setBulkRoleDialog({ open: false, ids: [] });
    setImpersonateDialog({ open: false, user: null });
    setImportDialogOpen(false);
  };

  return {
    deleteDialog, setDeleteDialog,
    restoreDialog, setRestoreDialog,
    suspendDialog, setSuspendDialog,
    activateDialog, setActivateDialog,
    messageDialog, setMessageDialog,
    passwordDialog, setPasswordDialog,
    verifyDialog, setVerifyDialog,
    roleDialog, setRoleDialog,
    bulkRoleDialog, setBulkRoleDialog,
    impersonateDialog, setImpersonateDialog,
    impersonating, setImpersonating,
    importDialogOpen, setImportDialogOpen,
    exporting, setExporting,
    exportingJson, setExportingJson,
    actionLoadingId, setActionLoadingId,
    closeAll,
  };
}