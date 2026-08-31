export interface AuditLog {
  id: string;
  action: string;
  eventType: string;
  performedBy: string | null;
  resource: string;
  changes: string;
  metadata: string;
  ip: string;
  createdAt: string;
}

export interface AuditLogsResponse {
  items: AuditLog[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface UserAuditLogTabProps {
  userId: string;
}