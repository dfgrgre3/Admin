export type AdminAction = "CREATE" | "UPDATE" | "DELETE" | "VIEW" | "PUBLISH" | "UNPUBLISH" | "LOGIN" | "LOGOUT";

interface AuditLogEntry {
  action: AdminAction;
  entityType: string;
  entityId?: string;
  entityName?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

/**
 * The Go admin middleware is the source of truth for audit events. Never write
 * audit data to browser storage: it is user-controlled and can be erased or
 * forged. This compatibility function intentionally does not send a second,
 * browser-supplied event (the backend already logs the actual request).
 */
export function logAdminAction(
  action: AdminAction,
  entityType: string,
  options?: {
    entityId?: string;
    entityName?: string;
    details?: Record<string, unknown>;
  }
) {
  void action;
  void entityType;
  void options;
}

export async function getRecentAuditLogs(limit: number = 50): Promise<unknown[]> {
  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 100);
  const response = await fetch(`/api/admin/audit-logs?limit=${safeLimit}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Audit log request failed (${response.status})`);
  const result: unknown = await response.json();
  if (Array.isArray(result)) return result;
  if (result && typeof result === "object") {
    const data = result as { logs?: unknown; data?: { logs?: unknown } };
    const logs = data.logs ?? data.data?.logs;
    if (Array.isArray(logs)) return logs;
  }
  return [];
}

/** Audit logs are append-only; deletion is intentionally unavailable. */
export function clearAuditLogs(): never {
  throw new Error("Audit logs are server-authoritative and cannot be cleared from the client");
}
