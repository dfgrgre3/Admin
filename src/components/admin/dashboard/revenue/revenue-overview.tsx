"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { TrendingUp, DollarSign, CreditCard, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface RevenueOverviewProps {
  dailyRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  pendingRevenue: number;
  dailyTrend: number;
  monthlyTrend: number;
  yearlyTrend: number;
  className?: string;
}

export function RevenueOverview({
  dailyRevenue,
  monthlyRevenue,
  yearlyRevenue,
  pendingRevenue,
  dailyTrend,
  monthlyTrend,
  yearlyTrend,
  className
}: RevenueOverviewProps) {
  return (
    <AdminCard variant="glass" className={cn("border-primary/20", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <span>نظرة عامة على الإيرادات</span>
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Wallet className="w-4 h-4" />
          <span>ج.م</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatsCard
          title="إيرادات اليوم"
          value={dailyRevenue.toLocaleString()}
          icon={DollarSign}
          color="green"
          description="ج.م"
          trend={{
            value: dailyTrend,
            isPositive: dailyTrend >= 0
          }}
        />
        <AdminStatsCard
          title="إيرادات الشهر"
          value={monthlyRevenue.toLocaleString()}
          icon={CreditCard}
          color="blue"
          description="ج.م"
          trend={{
            value: monthlyTrend,
            isPositive: monthlyTrend >= 0
          }}
        />
        <AdminStatsCard
          title="إيرادات السنة"
          value={yearlyRevenue.toLocaleString()}
          icon={TrendingUp}
          color="purple"
          description="ج.م"
          trend={{
            value: yearlyTrend,
            isPositive: yearlyTrend >= 0
          }}
        />
        <AdminStatsCard
          title="إيرادات معلقة"
          value={pendingRevenue.toLocaleString()}
          icon={Wallet}
          color="amber"
          description="بانتظار التأكيد"
        />
      </div>

      {/* Revenue Summary */}
      <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground">إجمالي الإيرادات المتوقعة</p>
              <p className="text-2xl font-black text-primary">
                {(monthlyRevenue + pendingRevenue).toLocaleString()} ج.م
              </p>
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold",
            monthlyTrend >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
          )}>
            {monthlyTrend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(monthlyTrend)}% هذا الشهر
          </div>
        </div>
      </div>
    </AdminCard>
  );
}
