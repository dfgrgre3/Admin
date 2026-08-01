"use client";

import { Activity, Cpu, Database, Gauge, MemoryStick, Timer } from "lucide-react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import type { PerformanceMetrics } from "../_types/health";

interface PerformanceMetricsGridProps {
  performance: PerformanceMetrics | undefined;
}

const formatter = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 2 });
const clamp = (value: number) => Math.min(100, Math.max(0, value));

export function PerformanceMetricsGrid({ performance }: PerformanceMetricsGridProps) {
  if (!performance) return null;

  const hasSamples = performance.requestCount > 0;
  const metrics = [
    {
      title: "زمن الاستجابة",
      icon: Timer,
      value: hasSamples ? `${formatter.format(performance.avgResponseTime)} ms` : "غير متاح",
      subtext: hasSamples
        ? `P95: ${formatter.format(performance.p95ResponseTime)} ms · P99: ${formatter.format(performance.p99ResponseTime)} ms`
        : "لا توجد طلبات مسجلة في النطاق",
    },
    {
      title: "الطلبات في الدقيقة",
      icon: Activity,
      value: hasSamples ? formatter.format(performance.requestsPerMinute) : "غير متاح",
      subtext: hasSamples ? `${formatter.format(performance.requestCount)} طلب مسجل في النطاق` : "لا توجد عينة HTTP",
    },
    {
      title: "معدل الأخطاء",
      icon: Gauge,
      value: hasSamples ? `${formatter.format(performance.errorRate * 100)}%` : "غير متاح",
      subtext: hasSamples ? "من إجمالي الطلبات" : "لا توجد عينة HTTP",
      bar: hasSamples ? clamp(performance.errorRate * 100) : undefined,
      barColor: "bg-red-500",
    },
    {
      title: "استخدام المعالج",
      icon: Cpu,
      value: performance.cpuUsage == null ? "غير متاح" : `${formatter.format(performance.cpuUsage)}%`,
      subtext: performance.cpuUsage == null ? "لم يوفّر الخادم هذه القيمة" : "الاستخدام الحالي",
      bar: performance.cpuUsage == null ? undefined : clamp(performance.cpuUsage),
      barColor: "bg-blue-500",
    },
    {
      title: "استخدام الذاكرة",
      icon: MemoryStick,
      value: performance.memoryUsage == null ? "غير متاح" : `${formatter.format(performance.memoryUsage)} MB`,
      subtext: "Go heap المستخدم حاليًا",
    },
    {
      title: "اتصالات قاعدة البيانات",
      icon: Database,
      value: performance.databaseConnections == null ? "غير متاح" : formatter.format(performance.databaseConnections),
      subtext: "إجمالي الاتصالات المفتوحة",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <AdminCard key={metric.title} variant="glass">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-muted-foreground">{metric.title}</h4>
                  <p className="mt-1 text-2xl font-black tabular-nums">{metric.value}</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-2.5 text-primary"><Icon className="h-5 w-5" /></div>
              </div>
              <p className="text-xs text-muted-foreground">{metric.subtext}</p>
              {metric.bar != null && (
                <div className="h-2 overflow-hidden rounded-full bg-secondary" aria-label={`${metric.title}: ${metric.bar}%`}>
                  <div className={`h-full rounded-full transition-all ${metric.barColor}`} style={{ width: `${metric.bar}%` }} />
                </div>
              )}
            </div>
          </AdminCard>
        );
      })}
    </div>
  );
}
