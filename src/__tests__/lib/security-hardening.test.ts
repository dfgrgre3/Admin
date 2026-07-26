import {
  clearAuditLogs,
  getRecentAuditLogs,
  logAdminAction,
} from "@/lib/admin-audit";
import { isStaffAdminPanelRole } from "@/lib/auth/admin-panel-roles";

describe("administrative security hardening", () => {
  it("keeps the coarse staff gate aligned with route-level RBAC roles", () => {
    expect(isStaffAdminPanelRole("SUPER_ADMIN")).toBe(true);
    expect(isStaffAdminPanelRole("ADMIN")).toBe(true);
    expect(isStaffAdminPanelRole("MODERATOR")).toBe(true);
    expect(isStaffAdminPanelRole("TEACHER")).toBe(true);
    expect(isStaffAdminPanelRole("SUPPORT")).toBe(true);
  });

  it("does not create browser-controlled audit entries", () => {
    const originalSetItem = localStorage.setItem.bind(localStorage);
    let calls = 0;
    localStorage.setItem = () => { calls += 1; };

    logAdminAction("DELETE", "course", { entityId: "course-1" });

    expect(calls).toBe(0);
    localStorage.setItem = originalSetItem;
  });

  it("reads audit logs from the authenticated backend endpoint with a bounded limit", async () => {
    const originalFetch = globalThis.fetch;
    let receivedInput: RequestInfo | URL | undefined;
    let receivedInit: RequestInit | undefined;
    globalThis.fetch = async (input, init) => {
      receivedInput = input;
      receivedInit = init;
      return {
      ok: true,
      json: async () => ({ data: { logs: [{ id: "audit-1" }] } }),
      } as Response;
    };

    await expect(getRecentAuditLogs(999)).resolves.toEqual([{ id: "audit-1" }]);
    expect(receivedInput).toBe("/api/admin/audit-logs?limit=100");
    expect(receivedInit?.credentials).toBe("include");
    globalThis.fetch = originalFetch;
  });

  it("does not expose client-side audit deletion", () => {
    expect(() => clearAuditLogs()).toThrow(/cannot be cleared/i);
  });
});