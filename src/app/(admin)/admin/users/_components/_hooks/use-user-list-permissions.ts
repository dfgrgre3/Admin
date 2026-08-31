"use client";

import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";

export function useUserListPermissions() {
  const { user: currentUser, hasPermission } = usePermission();
  const canManageUsers = hasPermission(PERMISSIONS.USERS_MANAGE);

  return {
    currentUser,
    canViewUsers: hasPermission(PERMISSIONS.USERS_VIEW),
    canManageUsers,
    canCreateUsers: canManageUsers || hasPermission(PERMISSIONS.USERS_CREATE),
    canUpdateUsers: canManageUsers || hasPermission(PERMISSIONS.USERS_UPDATE),
    canDeleteUsers: canManageUsers || hasPermission(PERMISSIONS.USERS_DELETE),
    canRestoreUsers: canManageUsers || hasPermission(PERMISSIONS.USERS_RESTORE),
    canSuspendUsers: canManageUsers || hasPermission(PERMISSIONS.USERS_SUSPEND),
    canExportUsers: canManageUsers || hasPermission(PERMISSIONS.USERS_EXPORT),
    canImportUsers: canManageUsers || hasPermission(PERMISSIONS.USERS_IMPORT),
    canAssignRoles: canManageUsers || hasPermission(PERMISSIONS.USERS_ASSIGN_ROLES),
    canAssignPermissions: canManageUsers || hasPermission(PERMISSIONS.USERS_ASSIGN_PERMISSIONS),
    canViewSessions: canManageUsers || hasPermission(PERMISSIONS.USERS_VIEW_SESSIONS),
    canViewActivity: canManageUsers || hasPermission(PERMISSIONS.USERS_VIEW_ACTIVITY),
    canManagePassword: canManageUsers || hasPermission(PERMISSIONS.USERS_MANAGE_PASSWORD),
    canManageVerification: canManageUsers || hasPermission(PERMISSIONS.USERS_MANAGE_VERIFICATION),
    canSendNotifications: canManageUsers || hasPermission(PERMISSIONS.USERS_SEND_NOTIFICATIONS),
    canTerminateSessions: canManageUsers || hasPermission(PERMISSIONS.USERS_TERMINATE_SESSIONS),
    canViewFinancial: canManageUsers || hasPermission(PERMISSIONS.USERS_VIEW_FINANCIAL),
    canViewOrders: canManageUsers || hasPermission(PERMISSIONS.USERS_VIEW_ORDERS),
    canViewCertificates: canManageUsers || hasPermission(PERMISSIONS.USERS_VIEW_CERTIFICATES),
    canViewSupport: canManageUsers || hasPermission(PERMISSIONS.USERS_VIEW_SUPPORT),
    canViewAudit: canManageUsers || hasPermission(PERMISSIONS.USERS_VIEW_AUDIT_LOG),
  };
}