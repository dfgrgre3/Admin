"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  TrendingUp,
  Eye,
  MousePointerClick,
  Users,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Calendar,
  Download,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { cn, formatDate } from "@/lib/utils";
import { adminFetch } from "@/lib/api/admin-api";

interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  totalDelivered: number;
  totalRead: number;
  avgCTR: number;
  avgReadRate: number;
  /** مصفوفة يومية لآخر 30 يوم */
  timeline: Array<{ date: string; views: number; clicks: number }>;
  /** توزيع الأجهزة */
  devices: { mobile: number; tablet: number; desktop: number };
  /** أعلى 5 إعلانات تفاعلاً */
  topAnnouncements: Array<{
    id: string;
    title: string;
    views: number;
    clicks: number;
    ctr: number;
  }>;
  /** توزيع الجمهور جغرافياً (اختياري) */
  geoDistribution?: Array<{ region: string; count: number }>;
}

interface AnalyticsDashboardProps {
  announcementId?: string;
  className?: string;
}

export function AnalyticsDashboard({
  announcementId,
  className,
}: AnalyticsDashboardProps) {
  const [period, setPeriod] = React.useState<"7d" | "30d" | "90d">("30d");

  const { data, isLoading } = useQuery({
    queryKey: [
      "admin",
      "announcements",
      "analytics",
      announcementId || "all",
      period,
    ],
    queryFn: async () => {
      try {
        const url = announcementId
          ? `/api/admin/announcements/${announcementId}/analytics?period=${period}`
          : `/api/admin/announcements/analytics?period=${period}`;
        const res = await adminFetch(url);
        if (!res.ok) return null;
        const json = await res.json();
        return (json?.data || json) as AnalyticsData;
      } catch {
        return null;
      }
    },
    staleTime: 60000,
  });

  const handleExport = () => {
    if (!data) return;
    const report = {
      period,
      generatedAt: new Date().toISOString(),
      ...data,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-${period}-${formatDate(new Date()).replace(/\//g, "-")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={cn("rounded-2xl border border-dashed border-white/10 p-8 text-center", className)}>
        <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm font-bold text-muted-foreground">
          لا تتوفر بيانات تحليلية بعد
        </p>
      </div>
    );
  }

  const maxViews = Math.max(...data.timeline.map((p) => p.views), 1);

  return (
    <div className={cn("space-y-4", className)} dir="rtl">
      {/* الترويسة + الفلاتر */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <p className="text-base font-black">التحليلات والإحصاءات</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={period}
            onValueChange={(v: typeof period) => setPeriod(v)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">آخر 7 أيام</SelectItem>
              <SelectItem value="30d">آخر 30 يوم</SelectItem>
              <SelectItem value="90d">آخر 90 يوم</SelectItem>
            </SelectContent>
          </Select>
          <AdminButton
            size="sm"
            variant="outline"
            icon={Download}
            onClick={handleExport}
          >
            تصدير
          </AdminButton>
        </div>
      </div>

      {/* بطاقات المؤشرات */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          icon={Eye}
          label="المشاهدات"
          value={data.totalViews}
          color="blue"
        />
        <MetricCard
          icon={MousePointerClick}
          label="النقرات"
          value={data.totalClicks}
          color="violet"
        />
        <MetricCard
          icon={Users}
          label="تم التسليم"
          value={data.totalDelivered}
          color="emerald"
        />
        <MetricCard
          icon={Activity}
          label="معدل القراءة"
          value={`${data.avgReadRate.toFixed(1)}%`}
          color="amber"
        />
      </div>

      {/* رسم بياني للجدول الزمني */}
      <div className="rounded-2xl border border-white/10 bg-white/2.5 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-wider">
            النشاط على مدار {period === "7d" ? "أسبوع" : period === "30d" ? "شهر" : "3 أشهر"}
          </p>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              مشاهدات
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-violet-500" />
              نقرات
            </span>
          </div>
        </div>

        <div className="flex items-end gap-1 h-40">
          {data.timeline.map((point, i) => {
            const viewsHeight = (point.views / maxViews) * 100;
            const clicksHeight =
              maxViews > 0 ? (point.clicks / maxViews) * 100 : 0;
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-0.5 group"
                title={`${point.date}: ${point.views} مشاهدة، ${point.clicks} نقرة`}
              >
                <div className="w-full flex items-end gap-0.5 h-full">
                  <div
                    className="flex-1 bg-blue-500/70 hover:bg-blue-500 rounded-t transition-all"
                    style={{ height: `${viewsHeight}%`, minHeight: point.views > 0 ? "2px" : "0" }}
                  />
                  <div
                    className="flex-1 bg-violet-500/70 hover:bg-violet-500 rounded-t transition-all"
                    style={{ height: `${clicksHeight}%`, minHeight: point.clicks > 0 ? "2px" : "0" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* توزيع الأجهزة + أعلى الإعلانات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DeviceDistribution
          devices={data.devices}
        />
        <TopAnnouncements items={data.topAnnouncements} />
      </div>

      {/* خريطة حرارية جغرافية (إن وُجدت) */}
      {data.geoDistribution && data.geoDistribution.length > 0 && (
        <GeoDistribution data={data.geoDistribution} />
      )}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: "blue" | "violet" | "emerald" | "amber";
}) {
  const colors = {
    blue: "bg-blue-500/15 text-blue-500 border-blue-500/30",
    violet: "bg-violet-500/15 text-violet-500 border-violet-500/30",
    emerald: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    amber: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  };

  return (
    <div className={cn("rounded-2xl border p-4", colors[color])}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4" />
        <p className="text-[10px] font-black uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-2xl font-black font-mono">
        {typeof value === "number" ? value.toLocaleString("ar-EG") : value}
      </p>
    </div>
  );
}

function DeviceDistribution({
  devices,
}: {
  devices: { mobile: number; tablet: number; desktop: number };
}) {
  const total = devices.mobile + devices.tablet + devices.desktop;
  if (total === 0) return null;

  const items = [
    { key: "mobile", label: "موبايل", icon: Smartphone, count: devices.mobile, color: "bg-blue-500" },
    { key: "tablet", label: "تابلت", icon: Tablet, count: devices.tablet, color: "bg-violet-500" },
    { key: "desktop", label: "ديسكتوب", icon: Monitor, count: devices.desktop, color: "bg-emerald-500" },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/2.5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Smartphone className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs font-black uppercase tracking-wider">
          توزيع الأجهزة
        </p>
      </div>
      <div className="space-y-2">
        {items.map((item) => {
          const pct = (item.count / total) * 100;
          const Icon = item.icon;
          return (
            <div key={item.key}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-bold">
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </span>
                <span className="font-mono font-black">
                  {pct.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", item.color)}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopAnnouncements({
  items,
}: {
  items: AnalyticsData["topAnnouncements"];
}) {
  if (items.length === 0) return null;
  const maxCtr = Math.max(...items.map((i) => i.ctr), 1);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/2.5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs font-black uppercase tracking-wider">
          أعلى الإعلانات تفاعلاً
        </p>
      </div>
      <div className="space-y-2">
        {items.slice(0, 5).map((item, i) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/2.5 p-2.5"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-500 font-black text-xs">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black truncate">{item.title}</p>
              <div className="mt-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-full"
                  style={{ width: `${(item.ctr / maxCtr) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-black font-mono">
                {item.ctr.toFixed(1)}%
              </p>
              <p className="text-[10px] text-muted-foreground">
                {item.views} مشاهدة
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GeoDistribution({
  data,
}: {
  data: NonNullable<AnalyticsData["geoDistribution"]>;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/2.5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs font-black uppercase tracking-wider">
          التوزيع الجغرافي
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {data.slice(0, 6).map((region) => (
          <div
            key={region.region}
            className="rounded-lg border border-white/5 bg-white/2.5 p-3"
          >
            <p className="text-[10px] font-bold text-muted-foreground truncate">
              {region.region}
            </p>
            <p className="text-lg font-black font-mono">{region.count}</p>
            <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                style={{ width: `${(region.count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}