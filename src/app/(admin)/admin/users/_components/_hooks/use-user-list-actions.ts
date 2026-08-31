"use client";

import { useBulkUserActions } from "./use-bulk-user-actions";
import {
  useSingleUserActions,
  useUserSessionActions,
} from "./use-single-user-actions";

export function useUserListActions() {
  const bulk = useBulkUserActions();
  const single = useSingleUserActions();
  const session = useUserSessionActions();

  return {
    handleDelete: bulk.handleDelete,
    handleRestore: bulk.handleRestore,
    handleSuspend: bulk.handleSuspend,
    handleActivate: bulk.handleActivate,
    handleResetPassword: single.handleResetPassword,
    handleVerify: single.handleVerify,
    handleAssignRole: single.handleAssignRole,
    handleImpersonate: session.handleImpersonate,
    handleTerminateAllSessions: session.handleTerminateAllSessions,
    handleSendActivationLink: session.handleSendActivationLink,
  };
}