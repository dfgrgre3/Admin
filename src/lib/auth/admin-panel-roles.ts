/**
 * Coarse staff gate only. Route-level authorization must use
 * `getRequiredPermissionForAdminPath` + `hasPermission`.
 */
export function isStaffAdminPanelRole(role: string | undefined): boolean {
  return ["ADMIN", "SUPER_ADMIN", "MODERATOR", "SUPPORT", "TEACHER"].includes(
    role?.toUpperCase() || "",
  );
}
