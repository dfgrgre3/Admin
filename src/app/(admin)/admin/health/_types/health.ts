export type HealthStatus = "healthy" | "degraded" | "unhealthy";
export type ThreatLevel = "low" | "medium" | "high" | "critical";
export type IssueSeverity = "low" | "medium" | "high";

export interface HealthStatusData {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  version: string;
}

export interface ComponentHealth {
  name: string;
  status: HealthStatus;
  responseTime: number;
  lastCheck: string;
  details?: string;
  metrics?: Record<string, number>;
}

export interface SystemHealth {
  overall: HealthStatusData;
  components: ComponentHealth[];
  checks: {
    database: ComponentHealth;
    redis: ComponentHealth;
    api: ComponentHealth;
    storage: ComponentHealth;
  };
}

export interface ExamHealth {
  totalExams: number;
  enabledExams: number;
  passedAttempts: number;
  failedAttempts: number;
  averageDuration: number;
  successRate: number;
  recentIssues: Array<{
    examId: string;
    issue: string;
    timestamp: string;
    severity: IssueSeverity;
  }>;
}

export interface SecurityHealth {
  threatLevel: ThreatLevel;
  activeThreats: number;
  blockedIPs: number;
  suspiciousActivities: number;
  twoFactorEnabled: number;
  twoFactorTotal: number;
  recentIncidents: Array<{
    type: string;
    count: number;
    lastOccurrence: string;
  }>;
}

export interface SecuritySession {
  id: string;
  userId: string;
  ip?: string;
  ipAddress?: string;
  location?: string | null;
  country?: string;
  browser?: string;
  os?: string;
  deviceType?: string;
  userAgent?: string;
  status: string;
  isActive: boolean;
  lastActive?: string;
  lastActivity?: string;
  expiresAt?: string;
  createdAt?: string;
}

export interface SecuritySessionStats {
  totalActive: number;
  totalExpired: number;
  uniqueDevices: number;
}

export interface IPWhitelistEntry {
  id: string;
  ipAddress: string;
  cidr?: string;
  description?: string;
  type: "admin" | "api" | "webhook" | string;
  status: "active" | "disabled" | string;
  isTemporary?: boolean;
  expiresAt?: string | null;
  lastUsedAt?: string | null;
  createdAt?: string;
  country?: string;
  city?: string;
}

export interface IPWhitelistSettings {
  isEnabled: boolean;
  enforceForAdmins: boolean;
  enforceForAPI: boolean;
  defaultAction: "allow" | "deny" | string;
  allowInternalIPs: boolean;
  internalIPRanges?: string[];
  logBlockedAttempts: boolean;
  notifyOnViolation: boolean;
  notifyEmail?: string;
}

export type IPWhitelistSettingsUpdate = Pick<
  IPWhitelistSettings,
  | "isEnabled"
  | "enforceForAdmins"
  | "enforceForAPI"
  | "defaultAction"
  | "allowInternalIPs"
  | "internalIPRanges"
  | "logBlockedAttempts"
  | "notifyOnViolation"
  | "notifyEmail"
>;

export interface BlockedIPAttempt {
  id: string;
  ipAddress: string;
  endpoint?: string;
  method?: string;
  location?: string;
  reason?: string;
  count?: number;
  attemptedAt: string;
}

export interface PerformanceMetrics {
  requestCount: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerMinute: number;
  errorRate: number;
  cpuUsage?: number | null;
  memoryUsage?: number | null;
  databaseConnections?: number | null;
  responseTimeHistory?: Array<{ time: string; value: number }>;
  errorRateHistory?: Array<{ time: string; value: number }>;
  requestsHistory?: Array<{ time: string; value: number }>;
}

export interface HealthData {
  system: SystemHealth;
  exams: ExamHealth;
  security: SecurityHealth;
  performance: PerformanceMetrics;
}

export type TimeRange = "15m" | "1h" | "6h" | "24h" | "7d";

export interface HealthFilters {
  timeRange: TimeRange;
  autoRefresh: boolean;
}