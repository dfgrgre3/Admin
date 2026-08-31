"use client";

import * as React from "react";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Search, X, Filter, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsFiltersBarProps {
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  onReset?: () => void;
  hasActiveFilters?: boolean;
  className?: string;
}

export function AnalyticsFiltersBar({
  search,
  onSearchChange,
  searchPlaceholder = "بحث في النتائج...",
  filters,
  actions,
  onReset,
  hasActiveFilters,
  className,
}: AnalyticsFiltersBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-3 sm:flex-row sm:items-center sm:flex-wrap",
        className
      )}
    >
      {onSearchChange && (
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-xl border border-border bg-background/80 pr-10 pl-10 text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:bg-accent"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {filters && (
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          {filters}
        </div>
      )}

      <div className="flex items-center gap-2 sm:ms-auto">
        {actions}
        {onReset && hasActiveFilters && (
          <AdminButton variant="ghost" size="sm" icon={RotateCcw} onClick={onReset}>
            إعادة ضبط
          </AdminButton>
        )}
      </div>
    </div>
  );
}