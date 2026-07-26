import { UserRole } from "@/types/enums";
import { PERMISSIONS, Permission } from "@/lib/permissions";

export interface PermissionUserContext {
  id: string;
  role: UserRole;
  permissions?: string[];
}

export function useUserPermissions(currentUser?: PermissionUserContext | null) {
  const hasPermission = (permissionKey: Permission | string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === UserRole.SUPER_ADMIN) return true;
    if (currentUser.permissions?.includes(PERMISSIONS.ADMIN_BYPASS)) return true;
    if (currentUser.permissions?.includes(PERMISSIONS.USERS_MANAGE)) {
      if (permissionKey.startsWith("users:")) return true;
    }
    return currentUser.permissions?.includes(permissionKey) ?? false;
  };

  const canViewField = (fieldCategory: "financial" | "contact" | "audit" | "notes"): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === UserRole.SUPER_ADMIN) return true;

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
