"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Shield,
  ListChecks,
  ShieldCheck,
  ArrowUpRight,
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Users,
  Globe,
  Clock,
  AlertTriangle,
  Activity,
  Target,
  Award,
  Zap,
} from "lucide-react";
import { m } from "framer-motion";

import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Badge } from "@/components/ui/badge";
import { cn, formatNumber } from "@/lib/utils";
import { adminFetch } from "@/lib/api/admin-api";
import { apiRoutes } from "@/lib/api/routes";
import { exportToCSV, type ExportColumn } from "@/lib/export-utils";
import { toast } from "sonner";

import {
  type AntiCheatFlag,
  type AntiCheatFlagResponse,
  type AntiCheatEventsResponse,
  STATUS_CONFIG,
  EVENT_TYPE_CONFIG,
  EVENT_TYPE_ORDER,
  SEVERITY_CONFIG,
  riskLevel,
} from "../_components/types";
import { TrendChart } from "../_components/trend-chart";
import { HeatmapView } from "../_components/heatmap-view";
import { REFRESH_INTERVALS } from "../_lib/constants";
import {
  summarizeEventsByType,
  summarizeEventsBySeverity,
  summarizeEventsByHour,
} from "../_lib/utils";

// ─────────────────────────────────────────────
//  التنقل الفرعي
// ─────────────────────────────────────────────
const SUB_PAGES = [
  {
    href: "/admin/anti-cheat",
    label: "الحالات",
    icon: Shield,
    color: "text-red-500",
    description: "مراجعة حالات الغش",
  },
  {
    href: "/admin/anti-cheat/policies",
    label: "السياسات والقواعد",
    icon: ListChecks,
    color: "text-blue-500",
    description: "إدارة قواعد الكشف",
  },
  {
    href: "/admin/anti-cheat/analytics",
    label: "التحليلات",
    icon: BarChart3,
    color: "text-purple-500",
    description: "إحصاءات وتقارير متقدمة",
  },
  {
    href: "/admin/anti-cheat/whitelist",
    label: "القائمة البيضاء",
    icon: ShieldCheck,
    color: "text-emerald-500",
    description: "الاستثناءات والتصاريح",
  },
];

function SubPageNav({ current }: { current: string }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {SUB_PAGES.map((p) => {
        const isActive = current === p.href;
        const Icon = p.icon;
        return (
          <Link
            key={p.href}
            href={p.href}
            className={cn(
              "admin-glass group relative overflow-hidden rounded-2xl border p-4 transition-all",
              "hover:scale-[1.02] hover:shadow-xl",
              isActive
                ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/10"
                : "border-white/10 hover:border-white/20"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    "bg-gradient-to-br from-white/10 to-white/5 ring-1 ring-white/10",
                    p.color
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black">{p.label}</p>
                  <p className="text-[10px] font-bold text-muted-foreground">
                    {p.description}
                  </p>
                </div>
              </div>
              <ArrowUpRight
                className={cn(
                  "h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100",
                  isActive && "opacity-100"
                )}
              />
            </div>
            {isActive && (
              <m.div
                layoutId="subnav-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary to-transparent"
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
//  الصفحة الرئيسية
// ─────────────────────────────────────────────
export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState<"7d" | "30d" | "90d">("30d");

  // ── جلب البيانات ──
  const flagsQuery = useQuery({
    queryKey: ["admin", "anti-cheat", "analytics", "flags", timeRange],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "200" });
      if (timeRange === "7d") {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        params.set("dateFrom", d.toISOString());
      } else if (timeRange === "30d") {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        params.set("dateFrom", d.toISOString());
      } else if (timeRange === "90d") {
        const d = new Date();
        d.setDate(d.getDate() - 90);
        params.set("dateFrom", d.toISOString());
      }
      const response = await adminFetch(
        `${apiRoutes.admin.antiCheat}?${params.toString()}`
      );
      if (!response.ok) throw new Error("فشل في جلب البيانات");
      const json = await response.json();
      return (json.data || json) as AntiCheatFlagResponse;
    },
    refetchInterval: REFRESH_INTERVALS.SLOW,
  });

  const eventsQuery = useQuery({
    queryKey: ["admin", "anti-cheat", "analytics", "events", timeRange],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "300" });
      if (timeRange === "7d") {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        params.set("dateFrom", d.toISOString());
      } else if (timeRange === "30d") {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        params.set("dateFrom", d.toISOString());
      } else if (timeRange === "90d") {
        const d = new Date();
        d.setDate(d.getDate() - 90);
        params.set("dateFrom", d.toISOString());
      }
      const response = await adminFetch(
        `${apiRoutes.admin.antiCheatEvents}?${params.toString()}`
      );
      if (!response.ok) throw new Error("فشل في جلب الأحداث");
      const json = await response.json();
      return (json.data || json) as AntiCheatEventsResponse;
    },
    refetchInterval: REFRESH_INTERVALS.SLOW,
  });

  const flags = flagsQuery.data?.flags || [];
  const events = eventsQuery.data?.events || [];
  const summary = flagsQuery.data?.summary;
  const eventsSummary = eventsQuery.data?.summary;

  // ── حسابات تحليلية ──
  // المُلخِّصات تُعيد مصفوفات { key, count } — نحوّلها إلى خرائط عدّاد
  const eventCountByType = React.useMemo(() => {
    const map = new Map<string, number>();
    EVENT_TYPE_ORDER.forEach((t) => map.set(t, 0));
    summarizeEventsByType(events).forEach(({ eventType, count }) =>
      map.set(eventType, count)
    );
    return map;
  }, [events]);
  const eventTypeTotal = React.useMemo(
    () => Array.from(eventCountByType.values()).reduce((s, v) => s + v, 0),
    [eventCountByType]
  );

  const eventCountBySeverity = React.useMemo(
    () => new Map(summarizeEventsBySeverity(events).map((r) => [r.severity, r.count] as const)),
    [events]
  );
  const eventSeverityTotal = React.useMemo(
    () => Array.from(eventCountBySeverity.values()).reduce((s, v) => s + v, 0),
    [eventCountBySeverity]
  );

  const eventCountByHour = React.useMemo(
    () => new Map(summarizeEventsByHour(events).map((r) => [r.hour, r.count] as const)),
    [events]
  );

  // أكثر الطلاب تكراراً
  const topOffenders = React.useMemo(() => {
    const map = new Map<string, { name: string; email: string; count: number; riskSum: number }>();
    flags.forEach((f) => {
      const key = f.userId;
      const current = map.get(key) || {
        name: f.userName,
        email: f.userEmail,
        count: 0,
        riskSum: 0,
      };
      current.count++;
      current.riskSum += f.riskScore;
      map.set(key, current);
    });
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [flags]);

  // الدول الأكثر نشاطاً
  const topCountries = React.useMemo(() => {
    const map = new Map<string, number>();
    events.forEach((e) => {
      const country = e.country || "غير معروف";
      map.set(country, (map.get(country) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [events]);

  // معدل الحل
  const resolutionRate = React.useMemo(() => {
    if (!summary) return 0;
    const resolved =
      (summary.cleared || 0) + (summary.dismissed || 0) + (summary.blocked || 0);
    return summary.totalFlags > 0
      ? Math.round((resolved / summary.totalFlags) * 100)
      : 0;
  }, [summary]);

  const averageRisk = React.useMemo(() => {
    if (flags.length === 0) return 0;
    return Math.round(
      flags.reduce((s, f) => s + f.riskScore, 0) / flags.length
    );
  }, [flags]);

  // ── تصدير تقرير شامل ──
  const handleExport = () => {
    const columns: ExportColumn<AntiCheatFlag>[] = [
      { header: "الطالب", accessor: (r) => r.userName },
      { header: "البريد", accessor: (r) => r.userEmail },
      { header: "المخاطر", accessor: (r) => r.riskScore },
      { header: "الحالة", accessor: (r) => STATUS_CONFIG[r.status]?.label || r.status },
      { header: "عدد الأحداث", accessor: (r) => r.eventCount },
    ];
    exportToCSV(
      flags,
      columns,
      `anti-cheat-analytics-${new Date().toISOString().slice(0, 10)}.csv`
    );
    toast.success("تم تصدير التقرير التحليلي");
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="التحليلات المتقدمة"
        description="رؤى عميقة وإحصاءات شاملة حول سلوك الغش في النظام."
        eyebrow="مكافحة الغش"
        icon={BarChart3}
        accentColor="bg-purple-500/10 text-purple-500"
        badge={`${formatNumber(flags.length)} حالة — ${formatNumber(events.length)} حدث`}
        meta={
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <BarChart3 className="h-4 w-4 text-purple-500" />
            معدل الحل: {resolutionRate}% — متوسط المخاطر: {averageRisk}
          </div>
        }
      >
        <Link
          href="/admin/anti-cheat"
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-black text-muted-foreground transition hover:bg-white/10"
        >
          <ChevronLeft className="h-4 w-4" />
          العودة
        </Link>
      </PageHeader>

      <SubPageNav current="/admin/anti-cheat/analytics" />

      {/* فلاتر الفترة الزمنية */}
      <div className="admin-glass flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 p-3">
        <span className="text-xs font-black text-muted-foreground ml-2">
          <Clock className="inline h-3.5 w-3.5 ml-1" />
          الفترة الزمنية:
        </span>
        {[
          { v: "7d", label: "آخر 7 أيام" },
          { v: "30d", label: "آخر 30 يوم" },
          { v: "90d", label: "آخر 90 يوم" },
        ].map((opt) => (
          <button
            key={opt.v}
            onClick={() => setTimeRange(opt.v as "7d" | "30d" | "90d")}
            className={cn(
              "rounded-xl border-2 px-3 py-1.5 text-xs font-black transition-all",
              "hover:scale-105 active:scale-95",
              timeRange === opt.v
                ? "border-primary bg-primary/10 text-primary"
                : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* بطاقات المؤشرات الرئيسية */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="إجمالي الحالات"
          value={summary?.totalFlags || 0}
          icon={Shield}
          color="text-red-500"
          trend={flagsQuery.data?.summary?.totalFlags ? 12 : undefined}
          loading={flagsQuery.isLoading}
        />
        <KpiCard
          label="إجمالي الأحداث"
          value={eventsSummary?.totalEvents || 0}
          icon={Activity}
          color="text-blue-500"
          loading={eventsQuery.isLoading}
        />
        <KpiCard
          label="طلاب فريدون"
          value={summary?.uniqueStudents || 0}
          icon={Users}
          color="text-purple-500"
          loading={flagsQuery.isLoading}
        />
        <KpiCard
          label="معدل الحل"
          value={resolutionRate}
          suffix="%"
          icon={Target}
          color="text-emerald-500"
          loading={flagsQuery.isLoading}
        />
      </div>

      {/* الترند + الهيت ماب */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TrendChart
            data={summary?.weeklyTrend ?? []}
            loading={flagsQuery.isLoading}
          />
        </div>
        <HeatmapView flags={flags} loading={flagsQuery.isLoading} />
      </div>

      {/* توزيع الحالات على أنواع الأحداث */}
      <div className="admin-glass rounded-2xl border border-white/10 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-base font-black">
              <Zap className="h-4 w-4 text-amber-500" />
              توزيع الأحداث حسب النوع
            </h3>
            <p className="text-[10px] font-bold text-muted-foreground">
              أكثر أنواع المخالفات تكراراً
            </p>
          </div>
          <AdminButton variant="ghost" size="sm" onClick={handleExport}>
            تصدير
          </AdminButton>
        </div>

        <div className="space-y-2">
          {EVENT_TYPE_ORDER.map((eventType) => {
            const cfg = EVENT_TYPE_CONFIG[eventType];
            const count = eventCountByType.get(eventType) ?? 0;
            const total = eventTypeTotal;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            const Icon = cfg?.icon || AlertTriangle;
            const barBg =
              cfg?.border
                .split(" ")
                .find((c) => c.startsWith("bg-"))
                ?.replace(/\/\d+$/, "") || "bg-primary";

            return (
              <div key={eventType} className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    cfg?.border || "border-white/10 bg-white/5"
                  )}
                >
                  <Icon className={cn("h-4 w-4", cfg?.text || "text-muted-foreground")} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-black">
                      {cfg?.label || eventType}
                    </span>
                    <span className="text-[10px] font-black text-muted-foreground">
                      {formatNumber(count)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <m.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={cn("h-full", barBg)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* توزيع الخطورة + أكثر الطلاب */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* الخطورة */}
        <div className="admin-glass rounded-2xl border border-white/10 p-5">
          <h3 className="mb-4 flex items-center gap-2 text-base font-black">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            توزيع خطورة الأحداث
          </h3>
          <div className="space-y-3">
            {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((sev) => {
              const cfg = SEVERITY_CONFIG[sev];
              const count = eventCountBySeverity.get(sev) ?? 0;
              const total = eventSeverityTotal;
              const percentage = total > 0 ? (count / total) * 100 : 0;

              return (
                <div
                  key={sev}
                  className={cn(
                    "rounded-xl border p-3",
                    cfg.border
                  )}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className={cn("text-sm font-black", cfg.text)}>
                      {cfg.label}
                    </span>
                    <span className="text-xs font-black">
                      {formatNumber(count)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-black/30">
                    <m.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={cn("h-full", cfg.bg)}
                    />
                  </div>
                  <p className="mt-1 text-[10px] font-bold text-muted-foreground">
                    {percentage.toFixed(1)}% من الأحداث
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* أكثر الطلاب */}
        <div className="admin-glass rounded-2xl border border-white/10 p-5">
          <h3 className="mb-4 flex items-center gap-2 text-base font-black">
            <Award className="h-4 w-4 text-amber-500" />
            أكثر الطلاب تكراراً
          </h3>
          {topOffenders.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-xs font-bold text-muted-foreground">
              لا توجد بيانات
            </div>
          ) : (
            <div className="space-y-2">
              {topOffenders.map((student, idx) => {
                const avgRisk = Math.round(student.riskSum / student.count);
                const level = riskLevel(avgRisk);
                return (
                  <m.div
                    key={student.email + idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3"
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black",
                        idx === 0
                          ? "bg-amber-500/20 text-amber-500 ring-2 ring-amber-500/30"
                          : "bg-white/5 text-muted-foreground"
                      )}
                    >
                      #{idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-black">
                        {student.name || "طالب"}
                      </p>
                      <p className="truncate text-[10px] font-bold text-muted-foreground" dir="ltr">
                        {student.email}
                      </p>
                    </div>
                    <div className="text-left">
                      <Badge
                        variant="outline"
                        className={cn("border-2 px-2 py-0.5 text-[10px] font-black", level.bg, level.text)}
                      >
                        {avgRisk}
                      </Badge>
                      <p className="mt-1 text-[10px] font-bold text-muted-foreground">
                        {formatNumber(student.count)} حالة
                      </p>
                    </div>
                  </m.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* أكثر الدول */}
      <div className="admin-glass rounded-2xl border border-white/10 p-5">
        <h3 className="mb-4 flex items-center gap-2 text-base font-black">
          <Globe className="h-4 w-4 text-blue-500" />
          التوزيع الجغرافي
        </h3>
        {topCountries.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-xs font-bold text-muted-foreground">
            لا توجد بيانات جغرافية
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {topCountries.map(([country, count], idx) => {
              const max = topCountries[0]?.[1] || 1;
              const percentage = (count / max) * 100;
              return (
                <m.div
                  key={country}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black">{country}</p>
                    <p className="text-sm font-black text-primary">
                      {formatNumber(count)}
                    </p>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/30">
                    <m.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                  </div>
                </m.div>
              );
            })}
          </div>
        )}
      </div>

      {/* توزيع الساعات */}
      <div className="admin-glass rounded-2xl border border-white/10 p-5">
        <h3 className="mb-4 flex items-center gap-2 text-base font-black">
          <Clock className="h-4 w-4 text-amber-500" />
          النشاط حسب الساعة
        </h3>
        <div className="flex h-32 items-end gap-1">
          {Array.from({ length: 24 }).map((_, hour) => {
            const count = eventCountByHour.get(hour) ?? 0;
            const max = Math.max(...eventCountByHour.values(), 1);
            const percentage = (count / max) * 100;
            return (
              <div
                key={hour}
                className="group flex flex-1 flex-col items-center gap-1"
              >
                <m.div
                  initial={{ height: 0 }}
                  animate={{ height: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: hour * 0.02 }}
                  className="w-full rounded-t bg-gradient-to-t from-amber-500 to-amber-300 transition-colors group-hover:from-amber-400 group-hover:to-amber-200"
                  style={{ minHeight: count > 0 ? "4px" : "0" }}
                  title={`${hour}:00 - ${count} حدث`}
                />
                {hour % 4 === 0 && (
                  <span className="text-[9px] font-bold text-muted-foreground">
                    {hour}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  بطاقة KPI
// ─────────────────────────────────────────────
function KpiCard({
  label,
  value,
  suffix,
  icon: Icon,
  color,
  trend,
  loading,
}: {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ElementType;
  color: string;
  trend?: number;
  loading?: boolean;
}) {
  return (
    <m.div
      whileHover={{ y: -2 }}
      className="admin-glass relative overflow-hidden rounded-2xl border border-white/10 p-4"
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            "bg-gradient-to-br from-white/10 to-white/5 ring-1 ring-white/10",
            color
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        {trend !== undefined && (
          <Badge
            variant="outline"
            className={cn(
              "border-2 px-1.5 py-0 text-[9px] font-black",
              trend > 0
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                : "border-red-500/30 bg-red-500/10 text-red-500"
            )}
          >
            {trend > 0 ? (
              <TrendingUp className="ml-1 h-2.5 w-2.5" />
            ) : (
              <TrendingDown className="ml-1 h-2.5 w-2.5" />
            )}
            {Math.abs(trend)}%
          </Badge>
        )}
      </div>
      <div className="mt-3">
        <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {loading ? (
          <div className="mt-1 h-7 w-20 animate-pulse rounded bg-white/10" />
        ) : (
          <p className="mt-1 text-2xl font-black">
            {formatNumber(value)}
            {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
          </p>
        )}
      </div>
    </m.div>
  );
}
