import { adminApi } from "./admin-api";

export interface ReportFilter {
  column: string;
  operator: string;
  value: unknown;
}

export interface ReportAgg {
  func: string;
  column: string;
  alias?: string;
}

export interface ReportSpec {
  dataset: string;
  columns: string[];
  filters?: ReportFilter[];
  aggregates?: ReportAgg[];
  groupBy?: string[];
  limit?: number;
  order?: string;
  orderColumn?: string;
}

export interface ReportResult {
  dataset: string;
  count: number;
  rows: Record<string, unknown>[];
}

export interface SavedReport {
  id: string;
  name: string;
  description?: string;
  spec: ReportSpec | unknown[];
  isPublic: boolean;
  createdAt: string;
}

export interface HeatmapBucket {
  bucket: number;
  views: number;
  rewatches: number;
}

export interface ChurnAlert {
  id: string;
  userId: string;
  severity: string;
  reason: string;
  daysSinceActive: number;
  resolved: boolean;
  userName: string;
  userEmail: string;
  createdAt: string;
}

export const analyticsApi = {
  buildReport: (spec: ReportSpec) => adminApi.post<ReportResult>("/reports/build", spec),
  listReports: () => adminApi.get<SavedReport[]>("/reports"),
  saveReport: (body: { name: string; description?: string; spec: ReportSpec; isPublic?: boolean }) =>
    adminApi.post<SavedReport>("/reports", body),
  runReport: (id: string) => adminApi.post<ReportResult>(`/reports/${id}/run`, {}),

  getHeatmap: (videoKey: string, duration?: number) =>
    adminApi.get<{ videoKey: string; bucketSec: number; totalEvents: number; buckets: HeatmapBucket[] }>(
      "/analytics/heatmap", { videoKey, duration }
    ),
  getCompletion: (subjectId: string) =>
    adminApi.get<{ subjectId: string; totalLessons: number; lessonStats: { lessonId: string; completed: number }[] }>(
      "/analytics/completion", { subjectId }
    ),
  listChurn: (active = true) => adminApi.get<ChurnAlert[]>("/analytics/churn", { active }),
};

export const REPORT_DATASETS: { value: string; label: string; columns: string[] }[] = [
  { value: "User", label: "المستخدمون", columns: ["id", "name", "email", "role", "country", "total_xp", "level", "current_streak", "exams_passed", "balance", "created_at", "status"] },
  { value: "SubjectEnrollment", label: "التسجيلات", columns: ["id", "user_id", "subject_id", "status", "enrolled_at", "progress", "completed", "grade"] },
  { value: "ExamResult", label: "نتائج الامتحانات", columns: ["id", "exam_id", "user_id", "score", "passed", "taken_at"] },
  { value: "Payment", label: "المدفوعات", columns: ["id", "user_id", "amount", "currency", "status", "completed_at", "plan_id"] },
  { value: "UserSubscription", label: "الاشتراكات", columns: ["id", "user_id", "plan_id", "status", "start_date", "end_date", "auto_renew"] },
  { value: "TopicProgress", label: "تقدم الدروس", columns: ["id", "user_id", "sub_topic_id", "status", "completed", "time_spent_seconds", "last_watched_position"] },
];

export const REPORT_OPERATORS = ["=", "!=", ">", ">=", "<", "<=", "LIKE", "IN", "IS NULL", "IS NOT NULL"];
export const REPORT_AGGREGATES = ["COUNT", "SUM", "AVG", "MIN", "MAX"];
