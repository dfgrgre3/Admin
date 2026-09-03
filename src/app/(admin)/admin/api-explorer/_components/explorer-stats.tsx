"use client";

/**
 * بطاقات إحصائيات سريعة لمستكشف API:
 *  - عدد المسارات في الكتالوج
 *  - عدد الطلبات في السجل
 *  - عدد المجموعات المحفوظة
 *  - معدل زمن الاستجابة الأخير
 */

import * as React from "react";
import { Braces, History, Bookmark, Zap } from "lucide-react";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";

interface ExplorerStatsProps {
  totalEndpoints: number;
  historyCount: number;
  collectionsCount: number;
  averageDurationMs: number;
}

export function ExplorerStats({
  totalEndpoints,
  historyCount,
  collectionsCount,
  averageDurationMs,
}: ExplorerStatsProps): React.ReactElement {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <AdminStatsCard
        title="إجمالي المسارات"
        value={totalEndpoints.toLocaleString("ar-EG")}
        description="مسار في كتالوج API"
        icon={Braces}
        color="blue"
      />
      <AdminStatsCard
        title="الطلبات في السجل"
        value={historyCount.toLocaleString("ar-EG")}
        description="آخر 100 طلب مرسلة"
        icon={History}
        color="violet"
      />
      <AdminStatsCard
        title="المجموعات المحفوظة"
        value={collectionsCount.toLocaleString("ar-EG")}
        description="مجموعات قابلة لإعادة الاستخدام"
        icon={Bookmark}
        color="emerald"
      />
      <AdminStatsCard
        title="متوسط زمن الاستجابة"
        value={
          averageDurationMs > 0
            ? `${Math.round(averageDurationMs).toLocaleString("ar-EG")} ms`
            : "—"
        }
        description="آخر 20 طلب"
        icon={Zap}
        color="amber"
      />
    </div>
  );
}
