"use client";

import * as React from "react";
import { motion as m } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Clock,
  Gauge,
  Globe,
  KeyRound,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import type { ApiLogsStats } from "../_lib/constants";
import { formatBytes, formatDuration, formatNumber } from "../_lib/utils";

interface StatsCardsProps {
  stats: ApiLogsStats;
}

export function ApiLogsStatsCards({ stats }: StatsCardsProps) {
  const successColor =
    stats.successRate >= 99
      ? "emerald"
      : stats.successRate >= 95
      ? "blue"
      : stats.successRate >= 90
      ? "amber"
      : "rose";

  const cards = [
    {
      label: "إجمالي الطلبات",
      value: formatNumber(stats.total),
      sub: `${formatNumber(stats.uniqueUsers)} مستخدم • ${formatNumber(stats.uniqueEndpoints)} مسار`,
      icon: Activity,
      color: "default" as const,
    },
    {
      label: "معدل النجاح",
      value: `${stats.successRate.toFixed(2)}%`,
      sub: `${stats.byStatus["4xx"] + stats.byStatus["5xx"]} طلب فاشل`,
      icon: Shield,
      color: successColor,
    },
    {
      label: "متوسط زمن الاستجابة",
      value: formatDuration(stats.avgResponseTimeMs),
      sub: `P95: ${formatDuration(stats.p95ResponseTimeMs)} • P99: ${formatDuration(stats.p99ResponseTimeMs)}`,
      icon: Clock,
      color: "blue" as const,
    },
    {
      label: "حجم البيانات",
      value: formatBytes(stats.totalBandwidth),
      sub: "إجمالي الطلبات والاستجابات",
      icon: Gauge,
      color: "violet" as const,
    },
    {
      label: "طلبات محظورة",
      value: stats.rateLimitedCount.toLocaleString("ar-EG"),
      sub: "تجاوز حد المعدل (429)",
      icon: AlertTriangle,
      color: stats.rateLimitedCount > 0 ? "amber" : "emerald",
    },
    {
      label: "أخطاء الخادم",
      value: (stats.byStatus["5xx"] ?? 0).toLocaleString("ar-EG"),
      sub: `${stats.byStatus["4xx"] ?? 0} خطأ عميل`,
      icon: Zap,
      color: (stats.byStatus["5xx"] ?? 0) > 0 ? "rose" : "emerald",
    },
    {
      label: "حركة حسب المفاتيح",
      value: stats.mostActiveKeys[0]?.name?.slice(0, 18) ?? "—",
      sub: stats.mostActiveKeys[0]
        ? `${formatNumber(stats.mostActiveKeys[0].calls)} طلب`
        : "لا توجد مفاتيح نشطة",
      icon: KeyRound,
      color: "purple" as const,
    },
    {
      label: "المستخدمون النشطون",
      value: formatNumber(stats.uniqueUsers),
      sub: "آخر 24 ساعة",
      icon: Users,
      color: "fuchsia" as const,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => (
        <m.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.04 }}
        >
          <AdminCard variant="glass" className="relative overflow-hidden">
            <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-30 bg-primary" />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-1 text-2xl font-black truncate">{card.value}</p>
                <p className="mt-1 text-[11px] font-bold text-muted-foreground truncate">
                  {card.sub}
                </p>
              </div>
              <div className="rounded-2xl bg-primary/10 p-3 text-primary shrink-0">
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </AdminCard>
        </m.div>
      ))}
    </div>
  );
}