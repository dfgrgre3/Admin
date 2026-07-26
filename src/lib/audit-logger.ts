import { UserRole } from "@/types/enums";

// ─────────────────────────────────────────────────────────────
// Audit Log Types & Events
// ─────────────────────────────────────────────────────────────

/** All auditable user-management events. */
export type AuditEvent =
  | "user.created"
  | "user.updated"
  | "user.deleted"
  | "user.anonymized"
  | "user.merged"
  | "user.role_changed"
  | "user.permission_changed"
  | "user.status_changed"
  | "user.banned"
  | "user.unbanned"
  | "user.suspended"
  | "user.activated"
  | "user.password_reset_by_admin"
  | "user.password_changed"
  | "user.email_changed"
  | "user.phone_changed"
  | "user.2fa_enabled"
  | "user.2fa_disabled"
  | "user.sessions_terminated"
  | "user.impersonated"
  | "user.impersonation_ended"
  | "user.exported"
  | "user.imported"
  | "user.note_added"
  | "user.note_deleted"
  | "user.wallet_adjusted"
  | "user.subscription_changed"
  | "user.certificate_issued"
  | "user.certificate_revoked"
  | "user.data_export_requested"
  | "user.data_deleted"
  | "user.invite_sent"
  | "user.verification_resent"
  | "user.enrolled"
  | "user.unenrolled";

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorRole: UserRole | string;
  targetUserId?: string;
  action: AuditEvent | string;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  reason?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
  result?: "success" | "failure" | "partial";
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────
// Generate a deterministic request ID for traceability
// ─────────────────────────────────────────────────────────────
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ─────────────────────────────────────────────────────────────
// Primary audit logging function
// ─────────────────────────────────────────────────────────────

/**
 * Log a user-management admin action to the audit trail.
 *
 * Compatibility helper for callers that need a correlation object. The Go
 * admin middleware records the authoritative database entry from the actual
 * administrative request. This function deliberately does not POST a
 * browser-authored event: `/api/admin/audit-logs` is read-only, and accepting
 * client-supplied actor/action data would allow audit forgery.
 *
 * **Security**: Never include PII (passwords, secrets, tokens) in beforeState/afterState.
 */
export async function logUserAdminAction(
  payload: Omit<AuditLogEntry, "id" | "createdAt" | "requestId">
): Promise<AuditLogEntry> {
  const entry: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    requestId: generateRequestId(),
    ...payload,
    result: payload.result ?? "success",
    createdAt: new Date().toISOString(),
  };

  // Development diagnostics only; this is not an audit persistence mechanism.
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[AUDIT_LOG] [${entry.action}] Actor: ${entry.actorId} -> Target: ${entry.targetUserId || "N/A"} | Reason: ${entry.reason || "None"} | Result: ${entry.result}`
    );
  }

  return entry;
}

// ─────────────────────────────────────────────────────────────
// Convenience wrappers for common audit actions
// ─────────────────────────────────────────────────────────────

export function auditUserStatusChange(
  actorId: string,
  actorRole: string,
  targetUserId: string,
  action: "user.banned" | "user.unbanned" | "user.suspended" | "user.activated" | "user.status_changed",
  reason: string,
  beforeStatus?: string,
  afterStatus?: string,
) {
  return logUserAdminAction({
    actorId,
    actorRole,
    targetUserId,
    action,
    reason,
    beforeState: beforeStatus ? { status: beforeStatus } : null,
    afterState: afterStatus ? { status: afterStatus } : null,
  });
}

export function auditImpersonation(
  adminId: string,
  adminRole: string,
  targetUserId: string,
  reason: string,
  type: "user.impersonated" | "user.impersonation_ended" = "user.impersonated",
) {
  return logUserAdminAction({
    actorId: adminId,
    actorRole: adminRole,
    targetUserId,
    action: type,
    reason,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
  });
}
