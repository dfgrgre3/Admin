"use client";

import * as React from "react";
import type { PlanFilterInterval, PlanStatusFilter, SubscriptionPlan } from "../_lib/types";

// حالة فلترة الخطط (بحث + حالة + مدة) مع الفلترة المحسوبة
export function usePlanFilters(plans: SubscriptionPlan[]) {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<PlanStatusFilter>("all");
  const [interval, setInterval] = React.useState<PlanFilterInterval>("all");

  const filteredPlans = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return plans.filter((p) => {
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.nameAr.includes(query) ||
        (p.currency || "").toLowerCase().includes(query);

      const matchesStatus =
        status === "all" || (status === "active" ? p.isActive : !p.isActive);

      const matchesInterval = interval === "all" || p.interval === interval;

      return matchesSearch && matchesStatus && matchesInterval;
    });
  }, [plans, search, status, interval]);

  const reset = React.useCallback(() => {
    setSearch("");
    setStatus("all");
    setInterval("all");
  }, []);

  return {
    search,
    setSearch,
    status,
    setStatus,
    interval,
    setInterval,
    filteredPlans,
    reset,
  };
}
