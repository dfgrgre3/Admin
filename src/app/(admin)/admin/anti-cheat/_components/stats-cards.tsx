"use client";

import * as React from "react";
import { m } from "framer-motion";
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  Ban,
  Flame,
  CheckCircle,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  FileX2,
  Sparkles,
} from "lucide-react";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import { cn, formatNumber } from "@/lib/utils";
import type { AntiCheatSummary } from "./types";
import { STATUS_CONFIG } from "./types";

interface StatsCardsProps {
  summary: AntiCheatSummary;
  loading?: boolean;
  previousSummary?: AntiCheatSummary | null;
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: "blue" | "green" | "amber" | "red" | "purple" | "rose" | "slate";
  description?: string;
  delta?: number;
  loading?: boolean;
  delay?: number;
  href?: string;
}

function MetricCard({
  title,
  value,
  icon,
  color,
  description,
  delta,
  loading,
  delay = 0,
}: MetricCardProps) {
  if (loading) {
    return (
      <div className="h-36 animate-pulse rounded-[1.25rem] border border-border/60 bg-card/60" />
    );
  }

  const isPositive = delta !== undefined && delta >= 0;
  const trend = delta !== undefined && Math.abs(delta) > 0;

  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
    >
      <AdminStatsCard
        title={title}
        value={value}
        icon={icon}
        color={color}
        description={description}
      />
      {trend && (
        <div className="mt-2 flex items-center gap-2 px-2">
          <Badge
            variant="outline"
            className={cn(
              "gap-1 border px-2 py-0.5 text-[10px] font-black",
              isPositive
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                : "border-red-500/30 bg-red-500/10 text-red-500"
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(delta ?? 0).toFixed(0)}%
          </Badge>
          <span className="text-[10px] font-bold text-muted-foreground/70">
            مقارنة بالفترة السابقة
          </span>
        </div>
      )}
    </m.div>
  );
}

export function StatsCards({ summary, loading, previousSummary }: StatsCardsProps) {
  const computeDelta = (current: number, prev?: number) => {
    if (prev === undefined || prev === null || prev === 0) return undefined;
    return ((current - prev) / prev) * 100;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-[1.25rem] border border-border/60 bg-card/60"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-[1.25rem] border border-border/60 bg-card/60"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* الصف الأول: الحالات الأساسية */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="إجمالي الحالات"
          value={summary.totalFlags}
          icon={ShieldAlert}
          color="blue"
          description="حالة غش مفروزة"
          delta={computeDelta(summary.totalFlags, previousSummary?.totalFlags)}
          delay={0}
        />
        <MetricCard
          title="مفتوحة"
          value={summary.open}
          icon={AlertTriangle}
          color="amber"
          description="بانتظار المراجعة"
          delta={computeDelta(summary.open, previousSummary?.open)}
          delay={0.05}
        />
        <MetricCard
          title="قيد المراجعة"
          value={summary.underReview}
          icon={Clock}
          color="purple"
          description="جارٍ الفحص"
          delta={computeDelta(summary.underReview, previousSummary?.underReview)}
          delay={0.1}
        />
        <MetricCard
          title="محظورة"
          value={summary.blocked}
          icon={Ban}
          color="red"
          description="تم إبطال المحاولة"
          delta={computeDelta(summary.blocked, previousSummary?.blocked)}
          delay={0.15}
        />
      </div>

      {/* الصف الثاني: المؤشرات التفصيلية */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="مخاطر عالية"
          value={summary.highRisk}
          icon={Flame}
          color="rose"
          description="درجة ≥ 60"
          delta={computeDelta(summary.highRisk, previousSummary?.highRisk)}
          delay={0.2}
        />
        <MetricCard
          title="تم التبرئة"
          value={summary.cleared}
          icon={CheckCircle}
          color="green"
          description="لا يوجد غش"
          delta={computeDelta(summary.cleared, previousSummary?.cleared)}
          delay={0.25}
        />
        <MetricCard
          title="طلاب متورطون"
          value={summary.uniqueStudents}
          icon={Users}
          color="slate"
          description="طالب فريد"
          delta={computeDelta(
            summary.uniqueStudents,
            previousSummary?.uniqueStudents
          )}
          delay={0.3}
        />
        <MetricCard
          title="أحداث اليوم"
          value={summary.todayEvents}
          icon={Activity}
          color="blue"
          description="حدث خلال 24 ساعة"
          delta={computeDelta(summary.todayEvents, previousSummary?.todayEvents)}
          delay={0.35}
        />
      </div>

      {/* الصف الثالث: مؤشرات ثانوية */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <MiniStat
          label="إجمالي الأحداث"
          value={summary.totalEvents}
          icon={Activity}
          tone="info"
        />
        <MiniStat
          label="أحداث حرجة"
          value={summary.criticalEvents}
          icon={Sparkles}
          tone="critical"
        />
        <MiniStat
          label="مرفوضة"
          value={summary.dismissed}
          icon={FileX2}
          tone="muted"
        />
        <MiniStat
          label="نسبة الحل"
          value={
            summary.totalFlags > 0
              ? Math.round(
                  ((summary.cleared + summary.dismissed + summary.blocked) /
                    summary.totalFlags) *
                    100
                )
              : 0
          }
          icon={CheckCircle}
          tone="success"
          suffix="%"
        />
        <MiniStat
          label="نسبة مفتوحة"
          value={
            summary.totalFlags > 0
              ? Math.round((summary.open / summary.totalFlags) * 100)
              : 0
          }
          icon={Eye}
          tone="warning"
          suffix="%"
        />
        <MiniStat
          label="متوسط المخاطر"
          value={
            summary.totalFlags > 0
              ? Math.round(summary.highRisk / (summary.totalFlags || 1) * 100)
              : 0
          }
          icon={Flame}
          tone="danger"
          suffix="%"
        />
      </div>
    </div>
  );
}

interface MiniStatProps {
  label: string;
  value: number;
  icon: React.ElementType;
  tone: "info" | "success" | "warning" | "danger" | "critical" | "muted";
  suffix?: string;
}

function MiniStat({ label, value, icon: Icon, tone, suffix }: MiniStatProps) {
  const tones = {
    info: "from-blue-500/20 to-cyan-500/10 text-blue-500 border-blue-500/30",
    success: "from-emerald-500/20 to-teal-500/10 text-emerald-500 border-emerald-500/30",
    warning: "from-amber-500/20 to-yellow-500/10 text-amber-500 border-amber-500/30",
    danger: "from-red-500/20 to-rose-500/10 text-red-500 border-red-500/30",
    critical: "from-fuchsia-500/20 to-pink-500/10 text-fuchsia-500 border-fuchsia-500/30",
    muted: "from-slate-500/20 to-slate-400/10 text-slate-400 border-slate-500/30",
  };
  return (
    <m.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-2xl border bg-gradient-to-br p-4",
        tones[tone]
      )}
    >
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5" />
        <span className="text-[10px] font-black uppercase opacity-80">{label}</span>
      </div>
      <p className="mt-3 text-3xl font-black">
        {formatNumber(value)}
        {suffix && <span className="text-base font-bold opacity-70">{suffix}</span>}
      </p>
    </m.div>
  );
}