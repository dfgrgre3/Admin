"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { AdminUserListItem } from "@/lib/api/admin-users-api";
import type { UseUserListColumnsParams } from "../_columns/column-types";
import { selectionColumn } from "../_columns/selection-cell";
import { userInfoColumn } from "../_columns/user-info-column";
import {
  phoneColumn, roleColumn, countryColumn,
} from "../_columns/phone-role-columns";
import { createdAtColumn, lastLoginColumn } from "../_columns/date-columns";
import { statusColumn, verificationColumn } from "../_columns/status-columns";
import { subscriptionColumn } from "../_columns/subscription-column";
import { getPaymentColumn, getWalletColumn } from "../_columns/payment-columns";
import { getCountsColumn, xpColumn } from "../_columns/stats-xp-columns";
import { createActionsColumn } from "../_columns/actions-column";

export function useUserListColumns(params: UseUserListColumnsParams): ColumnDef<AdminUserListItem>[] {
  const actionsColumn = React.useMemo(
    () => createActionsColumn(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      params.currentUser, params.actionLoadingId, params.canUpdateUsers, params.canManageVerification,
      params.canSuspendUsers, params.canManagePassword, params.canAssignRoles, params.canViewSessions,
      params.canTerminateSessions, params.canViewActivity, params.canViewAudit, params.canViewOrders,
      params.canViewFinancial, params.canViewCertificates, params.canViewSupport, params.canSendNotifications,
      params.canManageUsers, params.canAssignPermissions, params.canRestoreUsers, params.canDeleteUsers,
    ],
  );

  return React.useMemo<ColumnDef<AdminUserListItem>[]>(
    () => [
      selectionColumn,
      userInfoColumn,
      phoneColumn,
      roleColumn,
      countryColumn,
      createdAtColumn,
      lastLoginColumn,
      statusColumn,
      verificationColumn,
      subscriptionColumn,
      getPaymentColumn({ canViewFinancial: params.canViewFinancial }),
      getWalletColumn({ canViewFinancial: params.canViewFinancial }),
      getCountsColumn({
        canViewFinancial: params.canViewFinancial,
        canManageUsers: params.canManageUsers,
      }),
      xpColumn,
      actionsColumn,
    ],
    [params.canViewFinancial, params.canManageUsers, actionsColumn],
  );
}