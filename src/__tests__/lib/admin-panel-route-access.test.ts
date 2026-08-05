import {
  getRequiredPermissionForAdminApiRequest,
  getRequiredPermissionForAdminPath,
} from "@/lib/admin-panel-route-access";
import { PERMISSIONS } from "@/lib/permissions";
import { hasPermission } from "@/lib/permissions";

describe("admin panel route access", () => {
  it("requires content access for the learning paths admin page", () => {
    expect(getRequiredPermissionForAdminPath("/admin/learning-paths")).toBe(PERMISSIONS.SUBJECTS_VIEW);
    expect(getRequiredPermissionForAdminPath("/admin/learning-paths/123/preview")).toBe(
      PERMISSIONS.SUBJECTS_VIEW,
    );
  });

  it("requires content manage access for learning paths API writes", () => {
    expect(getRequiredPermissionForAdminApiRequest("/api/admin/learning-paths", "POST")).toBe(
      PERMISSIONS.SUBJECTS_MANAGE,
    );
    expect(getRequiredPermissionForAdminApiRequest("/api/admin/learning-paths", "GET")).toBe(
      PERMISSIONS.SUBJECTS_VIEW,
    );
  });

  it("requires analytics access for the dunning API", () => {
    expect(getRequiredPermissionForAdminApiRequest("/api/admin/dunning", "GET")).toBe(
      PERMISSIONS.ANALYTICS_VIEW,
    );
  });

  it("requires resources manage for admin upload presign writes", () => {
    expect(getRequiredPermissionForAdminApiRequest("/api/admin/upload/presign", "POST")).toBe(
      PERMISSIONS.RESOURCES_MANAGE,
    );
  });

  it("does not restore role defaults when the API supplies an empty effective set", () => {
    expect(hasPermission({ role: "MODERATOR", permissions: [] }, PERMISSIONS.DASHBOARD_VIEW)).toBe(false);
  });
});
