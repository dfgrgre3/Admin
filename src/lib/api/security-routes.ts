/**
 * Security Hub API Routes
 * Synced with backend router: internal/router/admin_routes.go
 */

export const API_ROUTES = {
  security: {
    // ── Sessions ──
    sessions: "/api/admin/security/sessions",
    sessionStats: "/api/admin/security/sessions/stats",
    sessionActivity: "/api/admin/security/sessions/activity",
    revokeSession: (id: string) => `/api/admin/security/sessions/${id}/revoke`,
    revokeOthers: "/api/admin/security/sessions/revoke-others",
    revokeUserSessions: (userId: string) =>
      `/api/admin/security/sessions/user/${userId}/revoke-all`,
    suspendSession: (id: string) => `/api/admin/security/sessions/${id}/suspend`,

    // ── Security Logs ──
    logs: "/api/admin/security/logs",
    userLogs: (userId: string) => `/api/admin/security/logs/users/${userId}`,

    // ── Device Fingerprints ──
    fingerprints: "/api/admin/security/fingerprints",
    blockFingerprint: "/api/admin/security/fingerprints/block",
    unblockFingerprint: (id: string) => `/api/admin/security/fingerprints/${id}/unblock`,

    // ── IP Whitelist ──
    ipWhitelist: "/api/admin/security/ip-whitelist",
    ipWhitelistSettings: "/api/admin/security/ip-whitelist/settings",
    ipWhitelistBlocked: "/api/admin/security/ip-whitelist/blocked",
    ipWhitelistBulk: "/api/admin/security/ip-whitelist/bulk",
    ipWhitelistCheck: "/api/admin/security/ip-whitelist/check",
    ipWhitelistById: (id: string) => `/api/admin/security/ip-whitelist/${id}`,

    // ── Roles & Permissions ──
    roles: "/api/admin/security/roles",
  },
} as const;