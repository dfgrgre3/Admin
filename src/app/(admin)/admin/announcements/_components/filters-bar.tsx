"use client";

import * as React from "react";
import {
  Filter,
  RotateCcw,
  ArrowUpDown,
  Flame,
  ListFilter,
  CalendarDays,
  Users,
  Search,
} from "lucide-react";
import { SearchInput } from "@/components/admin/ui/admin-input";
import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  TYPE_CONFIG,
  TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  SORT_OPTIONS,
  DATE_RANGE_OPTIONS,
  AUDIENCE_OPTIONS,
} from "./types";

interface FiltersBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  type: string;
  onTypeChange: (value: string) => void;
  priority: string;
  onPriorityChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  audience: string;
  onAudienceChange: (value: string) => void;
  resultCount: number;
  hasActiveFilters: boolean;
  onReset: () => void;
  loading?: boolean;
}

const selectTriggerClass =
  "h-10 min-w-[130px] rounded-xl border-white/10 bg-white/5 text-sm font-bold data-[state=open]:bg-white/10";

export function FiltersBar({
  search,
  onSearchChange,
  type,
  onTypeChange,
  priority,
  onPriorityChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  dateRange,
  onDateRangeChange,
  audience,
  onAudienceChange,
  resultCount,
  hasActiveFilters,
  onReset,
  loading = false,
}: FiltersBarProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* ── الصف الأول: البحث + الفرز ───────────────────────────────────────── */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <SearchInput
            value={search}
            onSearch={onSearchChange}
            placeholder="ابحث في العنوان أو المحتوى..."
            className="h-11 rounded-2xl border-white/10 bg-white/5 font-bold focus:bg-white/10"
            variant="default"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* الأولوية */}
          <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-1.5">
            <ListFilter className="mr-1 h-4 w-4 text-muted-foreground" />
            <Select
              value={priority || "ALL"}
              onValueChange={(v) => onPriorityChange(v === "ALL" ? "" : v)}
            >
              <SelectTrigger className={cn(selectTriggerClass, "border-0 bg-transparent min-w-[120px]")}>
                <SelectValue placeholder="الأولوية" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-white/10">
                <SelectItem value="ALL" className="font-bold cursor-pointer">كل الأولويات</SelectItem>
                {PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="font-bold cursor-pointer">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* الحالة */}
          <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-1.5">
            <Flame className="mr-1 h-4 w-4 text-muted-foreground" />
            <Select
              value={status || "ALL"}
              onValueChange={(v) => onStatusChange(v === "ALL" ? "" : v)}
            >
              <SelectTrigger className={cn(selectTriggerClass, "border-0 bg-transparent min-w-[120px]")}>
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-white/10">
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value || "ALL"}
                    value={opt.value || "ALL"}
                    className="font-bold cursor-pointer"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* الفترة الزمنية */}
          <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-1.5">
            <CalendarDays className="mr-1 h-4 w-4 text-muted-foreground" />
            <Select value={dateRange} onValueChange={onDateRangeChange}>
              <SelectTrigger className={cn(selectTriggerClass, "border-0 bg-transparent min-w-[120px]")}>
                <SelectValue placeholder="الفترة" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-white/10">
                {DATE_RANGE_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="font-bold cursor-pointer"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* الجمهور */}
          <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-1.5">
            <Users className="mr-1 h-4 w-4 text-muted-foreground" />
            <Select
              value={audience || "ALL"}
              onValueChange={(v) => onAudienceChange(v === "ALL" ? "" : v)}
            >
              <SelectTrigger className={cn(selectTriggerClass, "border-0 bg-transparent min-w-[130px]")}>
                <SelectValue placeholder="الجمهور" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-white/10">
                <SelectItem value="ALL" className="font-bold cursor-pointer">كل الجمهور</SelectItem>
                {AUDIENCE_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="font-bold cursor-pointer"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* الفرز */}
          <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-1.5">
            <ArrowUpDown className="mr-1 h-4 w-4 text-muted-foreground" />
            <Select value={sort} onValueChange={onSortChange}>
              <SelectTrigger className={cn(selectTriggerClass, "border-0 bg-transparent min-w-[140px]")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-white/10">
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="font-bold cursor-pointer"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <AdminButton variant="ghost" size="sm" icon={RotateCcw} onClick={onReset}>
              إعادة تعيين
            </AdminButton>
          )}
        </div>
      </div>

      {/* ── الصف الثاني: فلترة النوع بأزرار مقسمة ──────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {[
          { value: "", label: "الكل", icon: null, count: resultCount },
          ...TYPE_OPTIONS.map((opt) => ({
            value: opt.value,
            label: opt.label,
            icon: TYPE_CONFIG[opt.value].icon,
          })),
        ].map((opt) => {
          const active = type === opt.value;
          const config = opt.value ? TYPE_CONFIG[opt.value as keyof typeof TYPE_CONFIG] : null;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value || "ALL"}
              type="button"
              onClick={() => onTypeChange(opt.value)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all active:scale-95",
                active
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              )}
            >
              {Icon && config && (
                <Icon
                  className={cn(
                    "h-4 w-4",
                    active ? "text-primary-foreground" : config.textClass
                  )}
                />
              )}
              {opt.label}
              {opt.value === "" && "count" in opt && (
                <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] tabular-nums">
                  {opt.count}
                </span>
              )}
            </button>
          );
        })}
        {loading && (
          <span className="mr-auto flex items-center gap-1 text-xs font-bold text-muted-foreground animate-pulse">
            <Search className="h-3 w-3" />
            جاري التحديث...
          </span>
        )}
      </div>
    </div>
  );
}