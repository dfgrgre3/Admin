"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { useQuery } from "@tanstack/react-query";
import { Flame, AlertTriangle, CheckCircle2 } from "lucide-react";
import { analyticsApi } from "@/lib/api/analytics-api";
import { LazySection } from "@/components/admin/ui/lazy-section";

export default function LearningAnalyticsPage() {
  const [videoKey, setVideoKey] = React.useState("");
  const [duration, setDuration] = React.useState(600);

  const heatmap = useQuery({
    queryKey: ["admin", "heatmap", videoKey, duration],
    queryFn: () => analyticsApi.getHeatmap(videoKey, duration),
    enabled: !!videoKey,
  });

  const churn = useQuery({
    queryKey: ["admin", "churn"],
    queryFn: () => analyticsApi.listChurn(true),
  });

  const maxRewatch = heatmap.data?.buckets.reduce((m, b) => Math.max(m, b.rewatches), 0) ?? 0;
  const alerts = churn.data ?? [];
  const critical = alerts.filter((a) => a.severity === "CRITICAL").length;
  const warning = alerts.filter((a) => a.severity === "WARNING").length;

  return (
    <div className="space-y-6">
      <PageHeader title="تحليلات التعليم" description="خريطة حرارة الفيديو + تنبيهات التسرب (Churn)" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminStatsCard title="تنبيهات حرجة" value={critical} icon={AlertTriangle} color="red" />
        <AdminStatsCard title="تنبيهات تحذير" value={warning} icon={CheckCircle2} color="yellow" />
        <AdminStatsCard title="أحداث مشاهدة" value={heatmap.data?.totalEvents ?? 0} icon={Flame} color="purple" />
      </div>

      {/* Video Heatmap */}
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="font-bold flex items-center gap-2"><Flame className="h-4 w-4 text-orange-500" /> خريطة حرارة الفيديو</h3>
        <div className="flex gap-2">
          <input value={videoKey} onChange={(e) => setVideoKey(e.target.value)} placeholder="مفتاح الفيديو (videoKey)"
            className="flex-1 rounded-lg border px-3 py-2 text-sm" />
          <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-32 rounded-lg border px-3 py-2 text-sm" placeholder="المدة (ث)" />
        </div>

        {heatmap.isLoading && <p className="text-sm text-muted-foreground">جاري التحميل...</p>}
        {heatmap.data && (
          <div className="space-y-1">
            {heatmap.data.buckets.map((b) => {
              const intensity = maxRewatch > 0 ? b.rewatches / maxRewatch : 0;
              return (
                <div key={b.bucket} className="flex items-center gap-2 text-xs">
                  <span className="w-16 text-muted-foreground">{b.bucket * heatmap.data!.bucketSec}s</span>
                  <div className="flex-1 h-5 rounded bg-muted overflow-hidden">
                    <div className="h-full" style={{
                      width: `${Math.max(intensity * 100, b.views > 0 ? 8 : 0)}%`,
                      backgroundColor: `hsl(${30 - intensity * 30}, 90%, ${50 + intensity * 15}%)`,
                    }} />
                  </div>
                  <span className="w-24 text-muted-foreground">↻{b.rewatches} | 👁{b.views}</span>
                </div>
              );
            })}
          </div>
        )}
        {!videoKey && <p className="text-sm text-muted-foreground">أدخل مفتاح الفيديو لعرض الخريطة</p>}
      </div>

      {/* Churn Alerts */}
      <LazySection minHeight={300} rootMargin="200px">
        <div className="rounded-lg border">
        <div className="p-4 border-b font-bold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" /> تنبيهات التسرب (الطلاب المعرضون للمغادرة)
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-right">الطالب</th>
              <th className="p-3 text-right">الخطورة</th>
              <th className="p-3 text-right">الأيام منذ النشاط</th>
              <th className="p-3 text-right">السبب</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-3">{a.userName} <span className="text-xs text-muted-foreground">({a.userEmail})</span></td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${a.severity === "CRITICAL" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                    {a.severity === "CRITICAL" ? "حرج" : "تحذير"}
                  </span>
                </td>
                <td className="p-3">{a.daysSinceActive}</td>
                <td className="p-3 text-muted-foreground">{a.reason}</td>
              </tr>
            ))}
            {alerts.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">لا توجد تنبيهات نشطة</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </LazySection>
    </div>
  );
}
