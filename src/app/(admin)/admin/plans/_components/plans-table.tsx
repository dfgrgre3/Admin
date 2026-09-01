"use client";

import * as React from "react";
import { m } from "framer-motion";
import { Power, PowerOff, Search, Trash2 } from "lucide-react";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  PlanFilterInterval,
  PlanStatusFilter,
  SubscriptionPlan,
} from "../_lib/types";
import {
  INTERVAL_FILTER_OPTIONS,
  PLAN_COLUMN_LABELS,
  STATUS_FILTER_OPTIONS,
} from "../_lib/constants";
import { buildPlanColumns } from "./plan-columns";

interface PlansTableProps {
  plans: SubscriptionPlan[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  status: PlanStatusFilter;
  onStatusChange: (value: PlanStatusFilter) => void;
  interval: PlanFilterInterval;
  onIntervalChange: (value: PlanFilterInterval) => void;
  onRefresh: () => void;
  onExport: () => void;
  onView: (plan: SubscriptionPlan) => void;
  onEdit: (plan: SubscriptionPlan) => void;
  onDelete: (plan: SubscriptionPlan) => void;
  onDuplicate: (plan: SubscriptionPlan) => void;
  onToggle: (plan: SubscriptionPlan) => void;
  onBulkActivate: (plans: SubscriptionPlan[]) => void;
  onBulkDeactivate: (plans: SubscriptionPlan[]) => void;
  onBulkDelete: (plans: SubscriptionPlan[]) => void;
}

export function PlansTable({
  plans,
  isLoading,
  search,
  onSearchChange,
  status,
  onStatusChange,
  interval,
  onIntervalChange,
  onRefresh,
  onExport,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onToggle,
  onBulkActivate,
  onBulkDeactivate,
  onBulkDelete,
}: PlansTableProps) {
  const columns = React.useMemo(
    () =>
      buildPlanColumns({
        plans,
        onView,
        onEdit,
        onDelete,
        onDuplicate,
        onToggle,
      }),
    [plans, onView, onEdit, onDelete, onDuplicate, onToggle]
  );

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rpg-glass-light dark:rpg-glass overflow-hidden rounded-[2.5rem] border border-white/10 p-1 shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-black uppercase tracking-widest">الخطط والاشتراكات</h2>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-black text-primary">
            {plans.length} خطة
          </span>
        </div>
      </div>

      <AdminDataTable
        columns={columns}
        data={plans}
        loading={isLoading}
        columnLabels={PLAN_COLUMN_LABELS}
        selectable
        actions={{ onRefresh, onExport }}
        emptyMessage={{
          title: "لا توجد خطط مطابقة",
          description: "جرّب تغيير الفلاتر أو أنشئ خطة جديدة من الزر أعلاه.",
        }}
        bulkActions={[
          { label: "تفعيل", icon: Power, onClick: onBulkActivate },
          { label: "تعطيل", icon: PowerOff, onClick: onBulkDeactivate },
          { label: "حذف", icon: Trash2, onClick: onBulkDelete, variant: "destructive" },
        ]}
        toolbar={
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="ابحث بالاسم أو العملة..."
                className="h-10 w-64 rounded-xl border border-border bg-accent/10 px-10 text-sm font-bold outline-none ring-primary transition focus:ring-1"
              />
            </div>

            <div className="flex rounded-xl border border-border bg-accent/10 p-1 gap-1">
              {STATUS_FILTER_OPTIONS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => onStatusChange(filter.value)}
                  className={`rounded-lg px-4 py-2 text-xs font-black transition-all ${
                    status === filter.value
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <Select
              value={interval}
              onValueChange={(v) => onIntervalChange(v as PlanFilterInterval)}
            >
              <SelectTrigger className="h-10 w-36 rounded-xl border-border bg-accent/10 font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {INTERVAL_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="font-bold cursor-pointer">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />
    </m.div>
  );
}
