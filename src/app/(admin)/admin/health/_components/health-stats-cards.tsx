import { AlertTriangle, CheckCircle, Shield, Zap } from "lucide-react";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import type { ExamHealth, PerformanceMetrics, SecurityHealth } from "../_types/health";

interface HealthStatsCardsProps {
  exams: ExamHealth | undefined;
  security: SecurityHealth | undefined;
  performance: PerformanceMetrics | undefined;
}

const numberFormatter = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 1 });

export function HealthStatsCards({ exams, security, performance }: HealthStatsCardsProps) {
  const examSuccess = exams?.successRate;
  const hasPerformanceSamples = (performance?.requestCount ?? 0) > 0;
  const averageResponse = hasPerformanceSamples ? performance?.avgResponseTime : undefined;
  const errorRate = hasPerformanceSamples ? performance?.errorRate : undefined;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AdminStatsCard
        title="صحة الامتحانات"
        value={examSuccess == null ? "—" : `${numberFormatter.format(examSuccess)}%`}
        description={exams ? `${numberFormatter.format(exams.passedAttempts)} محاولة ناجحة` : "لا توجد بيانات"}
        icon={CheckCircle}
        color="green"
      />
      <AdminStatsCard
        title="مستوى الأمان"
        value={security?.threatLevel ?? "—"}
        description={security ? `${numberFormatter.format(security.activeThreats)} تهديد نشط` : "لا توجد بيانات"}
        icon={Shield}
        color="blue"
      />
      <AdminStatsCard
        title="استجابة API"
        value={averageResponse == null ? "—" : `${numberFormatter.format(averageResponse)} ms`}
        description={hasPerformanceSamples && performance ? `${numberFormatter.format(performance.requestsPerMinute)} طلب/دقيقة خلال النطاق` : "لا توجد طلبات مسجلة في النطاق"}
        icon={Zap}
        color="yellow"
      />
      <AdminStatsCard
        title="معدل الأخطاء"
        value={errorRate == null ? "—" : `${numberFormatter.format(errorRate * 100)}%`}
        description={hasPerformanceSamples ? "من إجمالي الطلبات في النطاق المحدد" : "لا توجد طلبات مسجلة في النطاق"}
        icon={AlertTriangle}
        color="red"
      />
    </div>
  );
}
