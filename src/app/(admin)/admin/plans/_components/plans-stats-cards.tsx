"use client";

import { m } from "framer-motion";
import { Activity, Layers, Package, PiggyBank, TrendingUp } from "lucide-react";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import type { PlanStats } from "../_lib/types";
import { INTERVAL_DOT_COLORS, INTERVAL_LABELS, INTERVAL_ORDER } from "../_lib/constants";

interface PlansStatsCardsProps {
  stats: PlanStats;
}

export function PlansStatsCards({ stats }: PlansStatsCardsProps) {
  const intervalTotal = stats.total || 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatsCard
          title="إجمالي الخطط"
          value={stats.total}
          icon={Package}
          color="blue"
          description={`${stats.groupsCount} مجموعة فوترة`}
        />
        <AdminStatsCard
          title="خطط مفعّلة"
          value={stats.active}
          icon={Activity}
          color="green"
          description={
            stats.total > 0
              ? `${Math.round((stats.active / stats.total) * 100)}% من إجمالي الخطط`
              : "لا توجد خطط"
          }
        />
        <AdminStatsCard
          title="متوسط السعر"
          value={stats.avgPrice}
          icon={PiggyBank}
          color="purple"
          description="متوسط أسعار جميع الخطط"
        />
        <AdminStatsCard
          title="أعلى سعر"
          value={stats.maxPrice}
          icon={TrendingUp}
          color="amber"
          description={`أقل سعر ${stats.minPrice.toLocaleString("ar-EG")}`}
        />
      </div>

      {/* توزيع الخطط حسب المدة */}
      {stats.total > 0 && (
        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[2rem] border border-border/60 bg-card/60 p-6 backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-black uppercase tracking-widest">توزيع الخطط حسب المدة</h3>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {INTERVAL_ORDER.map((interval) => (
                <div key={interval} className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${INTERVAL_DOT_COLORS[interval]}`} />
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {INTERVAL_LABELS[interval]} ({stats.byInterval[interval]})
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex h-3 w-full gap-1 overflow-hidden rounded-full bg-muted/40">
            {INTERVAL_ORDER.map((interval) => {
              const count = stats.byInterval[interval] || 0;
              if (count === 0) return null;
              return (
                <m.div
                  key={interval}
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / intervalTotal) * 100}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`h-full ${INTERVAL_DOT_COLORS[interval]} rounded-full`}
                />
              );
            })}
          </div>
        </m.div>
      )}
    </div>
  );
}
