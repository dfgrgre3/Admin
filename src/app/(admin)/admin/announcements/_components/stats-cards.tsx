"use client";

import * as React from "react";
import {
  Megaphone,
  Zap,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Archive,
  CalendarClock,
  EyeOff,
} from "lucide-react";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { AnnouncementsStats, TYPE_CONFIG } from "./types";

interface StatsCardsProps {
  stats: AnnouncementsStats;
}

/** اتجاه التغيير بين هذا الأسبوع والأسبوع السابق */
function trendDirection(thisWeek: number, lastWeek: number): "up" | "down" | "flat" {
  if (thisWeek > lastWeek) return "up";
  if (thisWeek < lastWeek) return "down";
  return "flat";
}

/** نص اتجاه التغيير */
function trendText(thisWeek: number, lastWeek: number): string {
  const diff = thisWeek - lastWeek;
  if (diff === 0) return "ثابت مقارنة بالأسبوع الماضي";
  const pct = lastWeek === 0 ? 100 : Math.round((Math.abs(diff) / lastWeek) * 100);
  const dir = diff > 0 ? "زيادة" : "انخفاض";
  return `${dir} ${pct}% مقارنة بالأسبوع الماضي`;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const trend = trendDirection(stats.thisWeek, stats.lastWeek);
  const trendPct =
    stats.lastWeek === 0
      ? stats.thisWeek > 0
        ? 100
        : 0
      : Math.round(((stats.thisWeek - stats.lastWeek) / stats.lastWeek) * 100);

  const snapshot = stats.loadedCount > 0 ? `من أحدث ${stats.loadedCount} سجل` : "";

  return (
    <div className="space-y-4">
      {/* ── الصف الأول: البطاقات الأساسية ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <AdminStatsCard
          title="إجمالي الإعلانات"
          value={stats.total}
          icon={Megaphone}
          color="blue"
          description="إعلان في سجلات النظام"
        />

        <AdminStatsCard
          title="منشور الآن"
          value={stats.active}
          icon={Zap}
          color="green"
          description={snapshot || "محسوبة من السجلات المتاحة"}
          trend={
            stats.total > 0
              ? {
                  value: Math.round((stats.active / stats.total) * 100),
                  isPositive: stats.active > 0,
                  label: "من الإجمالي",
                }
              : undefined
          }
        />

        <AdminStatsCard
          title="مجدول للنشر"
          value={stats.scheduled}
          icon={CalendarClock}
          color="violet"
          description="في انتظار وقت النشر"
        />

        <AdminStatsCard
          title="منتهي الصلاحية"
          value={stats.expired}
          icon={Archive}
          color="amber"
          description="يحتاج مراجعة أو تجديد"
        />

        <AdminStatsCard
          title="مخفي"
          value={stats.inactive}
          icon={EyeOff}
          color="slate"
          description="متوقف يدوياً"
        />
      </div>

      {/* ── الصف الثاني: المؤشرات التفصيلية ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <AdminStatsCard
          title="هذا الأسبوع"
          value={stats.thisWeek}
          icon={CalendarDays}
          color="purple"
          description={trendText(stats.thisWeek, stats.lastWeek)}
          trend={{
            value: Math.abs(trendPct),
            isPositive: trend === "up",
            label: trend === "flat" ? "ثابت" : "مقارنة بالأسبوع الماضي",
          }}
        />

        <AdminStatsCard
          title="تنبيهات عاجلة"
          value={stats.urgent}
          icon={AlertTriangle}
          color="red"
          description="تحذير أو تنبيه عاجل"
        />

        <AdminStatsCard
          title="أخبار سارة"
          value={stats.success}
          icon={CheckCircle2}
          color="green"
          description={`${TYPE_CONFIG.SUCCESS.label} المنشورة`}
        />

        <AdminStatsCard
          title="متوسط المشاهدة اليومية"
          value={stats.avgViewsPerDay.toLocaleString("ar-EG")}
          icon={Eye}
          color="fuchsia"
          description="لكل إعلان نشط"
        />
      </div>
    </div>
  );
}