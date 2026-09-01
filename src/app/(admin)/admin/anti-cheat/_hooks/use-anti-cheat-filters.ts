"use client";

import * as React from "react";
import type { AntiCheatFilters, AntiCheatSeverity, AntiCheatStatus } from "../_components/types";

type AntiCheatEventTypeFilter = AntiCheatFilters["eventType"];

interface UseAntiCheatFiltersOptions {
  initial?: Partial<AntiCheatFilters>;
  onChange?: (filters: AntiCheatFilters) => void;
}

const DEFAULT_FILTERS: AntiCheatFilters = {
  search: "",
  status: "all",
  minRisk: "all",
  examId: "all",
  severity: "all",
  eventType: "all",
};

export function useAntiCheatFilters(options: UseAntiCheatFiltersOptions = {}) {
  const [filters, setFilters] = React.useState<AntiCheatFilters>({
    ...DEFAULT_FILTERS,
    ...options.initial,
  });

  const deferredSearch = React.useDeferredValue(filters.search);

  const updateFilter = React.useCallback(
    <K extends keyof AntiCheatFilters>(key: K, value: AntiCheatFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetFilters = React.useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const setSearch = React.useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const setStatus = React.useCallback((status: AntiCheatStatus | "all") => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const setMinRisk = React.useCallback((minRisk: number | "all") => {
    setFilters((prev) => ({ ...prev, minRisk }));
  }, []);

  const setSeverity = React.useCallback((severity: AntiCheatSeverity | "all") => {
    setFilters((prev) => ({ ...prev, severity }));
  }, []);

  const setEventType = React.useCallback((eventType: AntiCheatEventTypeFilter) => {
    setFilters((prev) => ({ ...prev, eventType }));
  }, []);

  const isActive = React.useMemo(() => {
    return (
      filters.search !== "" ||
      filters.status !== "all" ||
      filters.minRisk !== "all" ||
      filters.examId !== "all" ||
      filters.severity !== "all" ||
      filters.eventType !== "all" ||
      Boolean(filters.dateFrom) ||
      Boolean(filters.dateTo)
    );
  }, [filters]);

  const activeCount = React.useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status !== "all") count++;
    if (filters.minRisk !== "all") count++;
    if (filters.examId !== "all") count++;
    if (filters.severity !== "all") count++;
    if (filters.eventType !== "all") count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  }, [filters]);

  const onChange = options.onChange;
  React.useEffect(() => {
    onChange?.(filters);
  }, [filters, onChange]);

  return {
    filters,
    deferredSearch,
    setSearch,
    setStatus,
    setMinRisk,
    setSeverity,
    setEventType,
    updateFilter,
    resetFilters,
    isActive,
    activeCount,
  };
}