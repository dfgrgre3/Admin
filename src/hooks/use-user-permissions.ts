import { UserRole } from "@/types/enums";
import { PERMISSIONS, Permission, hasPermission as hasPermissionCore } from "@/lib/permissions";

export interface PermissionUserContext {
  id: string;
  role: UserRole;
  permissions?: string[];
}

/**
 * Thin wrapper over the single `hasPermission` implementation in
 * `@/lib/permissions`. A role name — including SUPER_ADMIN — never grants
 * anything on its own: only the database-backed permission array from
 * `/api/auth/me` is authoritative, matching Go `GetEffectivePermissions`.
 */
export function useUserPermissions(currentUser?: PermissionUserContext | null) {
  const hasPermission = (permissionKey: Permission | string): boolean => {
    if (!currentUser) return false;
    return hasPermissionCore(
      { role: String(currentUser.role), permissions: currentUser.permissions },
      permissionKey,
    );
  };

  const canViewField = (fieldCategory: "financial" | "contact" | "audit" | "notes"): boolean => {
    if (!currentUser) return false;

    switch (fieldCategory) {
      case "financial":
        return hasPermission(PERMISSIONS.USERS_VIEW_FINANCIAL);
      case "contact":
        return hasPermission(PERMISSIONS.USERS_VIEW_CONTACT);
      case "audit":
        return hasPermission(PERMISSIONS.USERS_VIEW_AUDIT_LOG);
      case "notes":
        return hasPermission(PERMISSIONS.USERS_ADD_NOTE);
      default:
        return false;
    }
  };

  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;
  const isAdmin = currentUser?.role === UserRole.ADMIN || isSuperAdmin;

  return {
    hasPermission,
    canViewField,
    isSuperAdmin,
    isAdmin,
    role: currentUser?.role,
  };
}
