"use client";

import * as React from "react";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import {
  Banknote,
  CalendarDays,
  CreditCard,
  DollarSign,
  Percent,
  RotateCcw,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { DailyRevenuePoint, PaymentSummary } from "./types";
import { formatEGP, formatCompact, revenueChangePercent, countChangePercent } from "./utils";

interface PaymentStatsGridProps {
  summary: PaymentSummary;
  dailyRevenue?: DailyRevenuePoint[];
  loading?: boolean;
}

export function PaymentStatsGrid({ summary, dailyRevenue, loading }: PaymentStatsGridProps) {
  const revenueTrend = revenueChangePercent(dailyRevenue);
  const countTrend = countChangePercent(dailyRevenue);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-[2rem] border border-white/10 bg-white/5"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <AdminStatsCard
        title="إجمالي الإيرادات"
        value={formatEGP(summary.totalRevenue)}
        icon={DollarSign}
        color="green"
        description="إيرادات مؤكدة"
        trend={
          revenueTrend !== null
            ? { value: Math.abs(revenueTrend), isPositive: revenueTrend >= 0, label: "آخر 30 يوم" }
            : undefined
        }
      />
      <AdminStatsCard
        title="إيرادات اليوم"
        value={formatEGP(summary.todayRevenue)}
        icon={TrendingUp}
        color="blue"
        description="ج.م اليوم"
      />
      <AdminStatsCard
        title="إيرادات الشهر"
        value={formatEGP(summary.thisMonthRevenue)}
        icon={CalendarDays}
        color="violet"
        description="الشهر الحالي"
      />
      <AdminStatsCard
        title="متوسط قيمة الطلب"
        value={formatEGP(summary.avgOrderValue)}
        icon={Banknote}
        color="amber"
        description="لكل عملية مكتملة"
      />
      <AdminStatsCard
        title="إجمالي المعاملات"
        value={summary.totalPayments}
        icon={CreditCard}
        color="blue"
        description="عملية مسجلة"
        trend={
          countTrend !== null
            ? { value: Math.abs(countTrend), isPositive: countTrend >= 0, label: "آخر 30 يوم" }
            : undefined
        }
      />
      <AdminStatsCard
        title="معاملات مكتملة"
        value={summary.completedCount}
        icon={Wallet}
        color="green"
        description={`معدل نجاح ${formatCompact(summary.successRate)}%`}
      />
      <AdminStatsCard
        title="قيد المعالجة"
        value={summary.pendingCount}
        icon={Percent}
        color="yellow"
        description="تنتظر الإتمام"
      />
      <AdminStatsCard
        title="الاستردادات"
        value={summary.refundedCount}
        icon={RotateCcw}
        color="purple"
        description={`نسبة ${formatCompact(summary.refundRate)}%`}
      />
    </div>
  );
}
