import {
  getRequiredPermissionForAdminPath,
  getRequiredPermissionForAdminApiRequest,
} from "../src/lib/admin-panel-route-access";

const cases: Array<[string, string, string]> = [
  // [input, expected, description]
  ["/admin/roles", "roles:view", "roles list previously admin:bypass"],
  ["/admin/roles/create", "roles:view", "roles create"],
  ["/admin/roles/abc/edit", "roles:view", "roles edit"],
  ["/admin/live-sessions", "subjects:manage", "live-sessions no longer shadowed by /admin/live"],
  ["/admin/live", "live_monitor:view", "live page itself"],
  ["/admin/live-chat", "live_monitor:view", "live-chat explicit"],
  ["/admin/users/abc/activity", "users:view:activity", "user activity tab"],
  ["/admin/parents", "parents:view", "parents list"],
  ["/admin/parents/xyz", "parents:view", "parent detail"],
  ["/admin/parents/create", "parents:view", "parent create"],
  ["/admin/coupons", "marketing:view", "existing rule intact"],
  ["/admin/users/abc/edit", "users:manage", "existing rule intact"],
  ["/", "", "non-admin path → null"],
];

let failed = 0;
for (const [input, expected, desc] of cases) {
  const got = getRequiredPermissionForAdminPath(input);
  const ok = got === (expected || null);
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${input}  →  ${got}  (expected ${expected || "null"})  ${desc}`);
}

const apiCases: Array<[string, string, string, string]> = [
  ["/api/admin/payments", "GET", "analytics:view", "payments read"],
  ["/api/admin/payments", "POST", "analytics:view", "payments write (no manage grant defined)"],
  ["/api/admin/orders", "GET", "analytics:view", "orders read"],
  ["/api/admin/taxes", "POST", "taxes:manage", "taxes write"],
  ["/api/admin/lessons", "POST", "subjects:manage", "lessons write"],
  ["/api/admin/assignments", "GET", "assignments:view", "assignments read"],
  ["/api/admin/admin-invitations/send", "POST", "users:manage", "admin invitations"],
  ["/api/admin/auth/login", "POST", "admin:bypass", "pre-auth fallback unchanged"],
];
for (const [input, method, expected, desc] of apiCases) {
  const got = getRequiredPermissionForAdminApiRequest(input, method);
  const ok = got === expected;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${method} ${input}  →  ${got}  (expected ${expected})  ${desc}`);
}

console.log(failed === 0 ? "\n✓ all behavioral checks passed" : `\n✗ ${failed} checks failed`);
process.exit(failed === 0 ? 0 : 1);
