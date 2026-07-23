import { describe, expect, it } from "vitest";
import {
  getRequiredPermissionForAdminApiRequest,
  getRequiredPermissionForAdminPath,
} from "@/lib/admin-panel-route-access";
import { PERMISSIONS } from "@/lib/permissions";

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
});
