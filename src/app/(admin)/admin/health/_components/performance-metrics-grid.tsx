"use client";

import { AdminCard } from "@/components/admin/ui/admin-card";
import type { PerformanceMetrics } from "../_types/health";

interface PerformanceMetricsGridProps {
  performance: PerformanceMetrics | undefined;
}

export function PerformanceMetricsGrid({ performance }: PerformanceMetricsGridProps) {
  if (!performance) return null;

  const metrics = [
    {
      title: "متوسط زمن الاستجابة",
      value: `${performance.avgResponseTime}ms`,
      subtext: (
        <>
          P95: <span className="font-bold">{performance.p95ResponseTime}ms</span>
          <span className="mx-1">|</span>
          P99: <span className="font-bold">{performance.p99ResponseTime}ms</span>
        </>
      ),
    },
    {
      title: "الطلبات في الدقيقة",
      value: performance.requestsPerMinute.toLocaleString(),
      subtext: "معدل الطلبات الحالي",
    },
    {
      title: "معدل الأخطاء",
      value: `${(performance.errorRate * 100).toFixed(2)}%`,
      subtext: "من إجمالي الطلبات",
      valueColor: "text-red-500",
    },
    {
      title: "استخدام المعالج",
      value: `${performance.cpuUsage.toFixed(1)}%`,
      subtext: (
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${performance.cpuUsage}%` }}
          />
        </div>
      ),
    },
    {
      title: "استخدام الذاكرة",
      value: `${performance.memoryUsage.toFixed(1)}%`,
      subtext: (
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${performance.memoryUsage}%` }}
          />
        </div>
      ),
    },
    {
      title: "اتصالات قاعدة البيانات",
      value: performance.databaseConnections.toLocaleString(),
      subtext: "اتصالات نشطة",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric, index) => (
        <AdminCard key={index} variant="glass">
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-bold text-muted-foreground">{metric.title}</h4>
              <p className={`text-3xl font-black mt-1 ${metric.valueColor || ""}`}>{metric.value}</p>
            </div>
            <div className="text-xs text-muted-foreground">{metric.subtext}</div>
          </div>
        </AdminCard>
      ))}
    </div>
  );
}