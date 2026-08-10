import { describe, expect, it } from "vitest";
import {
  DEFAULT_ROLE_PERMISSIONS,
  hasPermission,
  permissionGrantMatches,
  PERMISSIONS,
} from "@/lib/permissions";

describe("dashboard widget permissions", () => {
  it("defines every permission key that the Go backend uses", () => {
    const expected = [
      "dashboard:access",
      "dashboard:view_kpis",
      "dashboard:view_learning_metrics",
      "dashboard:view_financial_metrics",
      "dashboard:view_support_metrics",
      "dashboard:view_content_metrics",
      "dashboard:view_system_health",
      "dashboard:view_recent_activity",
      "dashboard:view_pending_items",
      "dashboard:view_alerts",
      "dashboard:view_top_courses",
      "dashboard:view_exports",
      "dashboard:view_sensitive_metrics",
      "dashboard:refresh_cache",
      "dashboard:export",
      "dashboard:save_filters",
      "dashboard:delete_saved_filters",
      "dashboard:apply_saved_filters",
      "dashboard:acknowledge_alerts",
      "dashboard:manage",
    ];
    for (const key of expected) {
      expect(Object.values(PERMISSIONS)).toContain(key);
    }
  });

  it("treats dashboard:manage as covering every dashboard:* widget", () => {
    expect(permissionGrantMatches("dashboard:manage", "dashboard:view")).toBe(true);
    expect(permissionGrantMatches("dashboard:manage", "dashboard:view_kpis")).toBe(true);
    expect(permissionGrantMatches("dashboard:manage", "dashboard:view_financial_metrics")).toBe(true);
    expect(permissionGrantMatches("dashboard:manage", "dashboard:view_system_health")).toBe(true);
    expect(permissionGrantMatches("dashboard:manage", "dashboard:view_sensitive_metrics")).toBe(true);
  });

  it("mirrors the Go backend for other modules (:manage covers submodule actions)", () => {
    expect(permissionGrantMatches("users:manage", "users:view")).toBe(true);
    expect(permissionGrantMatches("users:manage", "users:view:financial")).toBe(true);
    expect(permissionGrantMatches("users:manage", "users:view:sessions")).toBe(true);
    expect(permissionGrantMatches("courses:manage", "payments:view")).toBe(false);
  });

  it("respects wildcard and bypass grants", () => {
    expect(permissionGrantMatches("dashboard:*", "dashboard:view_alerts")).toBe(true);
    expect(permissionGrantMatches("dashboard:*", "users:view")).toBe(false);
    expect(permissionGrantMatches("admin:bypass", "dashboard:view_kpis")).toBe(true);
  });
});

describe("hasPermission with dashboard widget permissions", () => {
  it("grants MODERATOR the operational widgets but not financial/system internals", () => {
    const moderator = { role: "MODERATOR", permissions: DEFAULT_ROLE_PERMISSIONS.MODERATOR };
    expect(hasPermission(moderator, PERMISSIONS.DASHBOARD_VIEW_KPIS)).toBe(true);
    expect(hasPermission(moderator, PERMISSIONS.DASHBOARD_VIEW_LEARNING_METRICS)).toBe(true);
    expect(hasPermission(moderator, PERMISSIONS.DASHBOARD_VIEW_CONTENT_METRICS)).toBe(true);
    expect(hasPermission(moderator, PERMISSIONS.DASHBOARD_VIEW_SUPPORT_METRICS)).toBe(true);
    expect(hasPermission(moderator, PERMISSIONS.DASHBOARD_VIEW_RECENT_ACTIVITY)).toBe(true);
    expect(hasPermission(moderator, PERMISSIONS.DASHBOARD_VIEW_PENDING_ITEMS)).toBe(true);
    expect(hasPermission(moderator, PERMISSIONS.DASHBOARD_VIEW_ALERTS)).toBe(true);
    expect(hasPermission(moderator, PERMISSIONS.DASHBOARD_VIEW_TOP_COURSES)).toBe(true);
    expect(hasPermission(moderator, PERMISSIONS.DASHBOARD_ACKNOWLEDGE_ALERTS)).toBe(true);
    expect(hasPermission(moderator, PERMISSIONS.DASHBOARD_VIEW_FINANCIAL_METRICS)).toBe(false);
    expect(hasPermission(moderator, PERMISSIONS.DASHBOARD_VIEW_SYSTEM_HEALTH)).toBe(false);
    expect(hasPermission(moderator, PERMISSIONS.DASHBOARD_VIEW_SENSITIVE)).toBe(false);
    expect(hasPermission(moderator, PERMISSIONS.DASHBOARD_EXPORT)).toBe(false);
  });

  it("grants SUPPORT only the support queue widgets", () => {
    const support = { role: "SUPPORT", permissions: DEFAULT_ROLE_PERMISSIONS.SUPPORT };
    expect(hasPermission(support, PERMISSIONS.DASHBOARD_VIEW_SUPPORT_METRICS)).toBe(true);
    expect(hasPermission(support, PERMISSIONS.DASHBOARD_VIEW_PENDING_ITEMS)).toBe(true);
    expect(hasPermission(support, PERMISSIONS.DASHBOARD_VIEW_ALERTS)).toBe(true);
    expect(hasPermission(support, PERMISSIONS.DASHBOARD_VIEW_KPIS)).toBe(false);
    expect(hasPermission(support, PERMISSIONS.DASHBOARD_VIEW_FINANCIAL_METRICS)).toBe(false);
  });

  it("grants ADMIN/SUPER_ADMIN every widget via bypass", () => {
    const admin = { role: "ADMIN", permissions: DEFAULT_ROLE_PERMISSIONS.ADMIN };
    expect(hasPermission(admin, PERMISSIONS.DASHBOARD_VIEW_FINANCIAL_METRICS)).toBe(true);
    expect(hasPermission(admin, PERMISSIONS.DASHBOARD_VIEW_SYSTEM_HEALTH)).toBe(true);
  });

  it("fails closed when permissions payload is missing", () => {
    expect(hasPermission({ role: "MODERATOR" }, PERMISSIONS.DASHBOARD_VIEW_KPIS)).toBe(false);
  });
});
