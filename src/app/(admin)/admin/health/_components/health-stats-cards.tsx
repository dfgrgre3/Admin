import {
  CheckCircle,
  Shield,
  Zap,
  AlertTriangle,
  Activity,
  XCircle,
} from "lucide-react";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import type { ExamHealth, SecurityHealth, PerformanceMetrics } from "../_types/health";

interface HealthStatsCardsProps {
  exams: ExamHealth | undefined;
  security: SecurityHealth | undefined;
  performance: PerformanceMetrics | undefined;
}

export function HealthStatsCards({ exams, security, performance }: HealthStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <AdminStatsCard
        title="صحة الامتحانات"
        value={`${exams?.successRate || 0}%`}
        description={`${exams?.completedExams || 0} اختبار مكتمل`}
        icon={CheckCircle}
        color="green"
      />
      <AdminStatsCard
        title="مستوى الأمان"
        value={security?.threatLevel || "low"}
        description={`${security?.activeThreats || 0} تهديد نشط`}
        icon={Shield}
        color="blue"
      />
      <AdminStatsCard
        title="استجابة API"
        value={`${performance?.avgResponseTime || 0}ms`}
        description="متوسط زمن الاستجابة"
        icon={Zap}
        color="yellow"
      />
      <AdminStatsCard
        title="معدل الأخطاء"
        value={`${((performance?.errorRate || 0) * 100).toFixed(2)}%`}
        description="آخر ساعة"
        icon={AlertTriangle}
        color="red"
      />
    </div>
  );
}