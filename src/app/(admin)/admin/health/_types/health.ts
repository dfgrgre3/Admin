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
  activeExams: number;
  completedExams: number;
  failedExams: number;
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

export interface PerformanceMetrics {
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerMinute: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  databaseConnections: number;
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