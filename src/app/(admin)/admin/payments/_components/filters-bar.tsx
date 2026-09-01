"use client";

import * as React from "react";
import { Search, X, SlidersHorizontal, CalendarDays, Banknote, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MethodStat, PaymentFilters } from "./types";
import { statusConfig, statusList, getMethodLabel } from "./constants";
import { cn } from "@/lib/utils";

interface FiltersBarProps {
  filters: PaymentFilters;
  methods: MethodStat[];
  onChange: (filters: PaymentFilters) => void;
  activeCount: number;
}

export function FiltersBar({ filters, methods, onChange, activeCount }: FiltersBarProps) {
  const [open, setOpen] = React.useState(false);

  const update = (patch: Partial<PaymentFilters>) => {
    onChange({ ...filters, ...patch });
  };

  const clear = () => {
    onChange({ search: "", status: "all", method: "all", from: "", to: "", minAmount: "", maxAmount: "" });
  };

  const hasDate = filters.from || filters.to;
  const hasAmount = filters.minAmount || filters.maxAmount;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative group flex-1 min-w-[220px]">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="ابحث بالاسم أو البريد أو رقم العملية..."
            className="h-10 w-full rounded-xl border border-border bg-accent/10 px-10 text-sm outline-none ring-primary transition focus:ring-1 font-bold"
          />
          {filters.search && (
            <button
              onClick={() => update({ search: "" })}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-white/10"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status */}
        <Select value={filters.status} onValueChange={(v) => update({ status: v })}>
          <SelectTrigger className="w-36 h-10 rounded-xl bg-accent/10 border-border text-xs font-black">
            <SelectValue placeholder="كل الحالات" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-white/10">
            <SelectItem value="all" className="font-bold">كل الحالات</SelectItem>
            {statusList.map((s) => (
              <SelectItem key={s} value={s} className={cn("font-bold", statusConfig[s].color)}>
                {statusConfig[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Method */}
        <Select value={filters.method} onValueChange={(v) => update({ method: v })}>
          <SelectTrigger className="w-36 h-10 rounded-xl bg-accent/10 border-border text-xs font-black">
            <SelectValue placeholder="كل الطرق" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-white/10 max-h-72">
            <SelectItem value="all" className="font-bold">كل الطرق</SelectItem>
            {methods.map((m) => (
              <SelectItem key={m.method} value={m.method} className="font-bold">
                {getMethodLabel(m.method)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Toggle advanced */}
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "flex h-10 items-center gap-2 rounded-xl border px-4 text-xs font-black transition-colors",
            open
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border bg-accent/10 hover:bg-accent/20"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          فلاتر متقدمة
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-black text-white">
              {activeCount}
            </span>
          )}
        </button>

        {activeCount > 0 && (
          <button
            onClick={clear}
            className="flex h-10 items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 text-xs font-black text-red-500 transition-colors hover:bg-red-500/20"
          >
            <X className="h-4 w-4" />
            مسح الكل
          </button>
        )}
      </div>

      {open && (
        <div className="grid grid-cols-1 gap-4 border-t border-white/10 pt-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Date range */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-black text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              من تاريخ
            </label>
            <input
              type="date"
              value={filters.from}
              max={filters.to || undefined}
              onChange={(e) => update({ from: e.target.value })}
              className={cn(
                "h-10 w-full rounded-xl border border-border bg-accent/10 px-3 text-sm font-bold outline-none ring-primary transition focus:ring-1",
                filters.from && "text-primary"
              )}
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-black text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              إلى تاريخ
            </label>
            <input
              type="date"
              value={filters.to}
              min={filters.from || undefined}
              onChange={(e) => update({ to: e.target.value })}
              className={cn(
                "h-10 w-full rounded-xl border border-border bg-accent/10 px-3 text-sm font-bold outline-none ring-primary transition focus:ring-1",
                filters.to && "text-primary"
              )}
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-black text-muted-foreground">
              <Banknote className="h-3.5 w-3.5" />
              الحد الأدنى للمبلغ
            </label>
            <Input
              type="number"
              min={0}
              value={filters.minAmount}
              onChange={(e) => update({ minAmount: e.target.value })}
              placeholder="0"
              className="h-10 rounded-xl bg-accent/10 border-border font-bold"
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-black text-muted-foreground">
              <Banknote className="h-3.5 w-3.5" />
              الحد الأقصى للمبلغ
            </label>
            <Input
              type="number"
              min={0}
              value={filters.maxAmount}
              onChange={(e) => update({ maxAmount: e.target.value })}
              placeholder="بدون حد"
              className="h-10 rounded-xl bg-accent/10 border-border font-bold"
            />
          </div>
        </div>
      )}

      {(hasDate || hasAmount || filters.method !== "all" || filters.status !== "all") && (
        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] font-black text-muted-foreground">الفلاتر النشطة:</span>
          {filters.status !== "all" && (
            <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-black", statusConfig[filters.status as keyof typeof statusConfig]?.bgColor || "bg-white/5 border-white/10")}>
              {statusConfig[filters.status as keyof typeof statusConfig]?.label || filters.status}
            </span>
          )}
          {filters.method !== "all" && (
            <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-black text-indigo-500">
              {getMethodLabel(filters.method)}
            </span>
          )}
          {hasDate && (
            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-black text-blue-500">
              {filters.from || "بداية"} ← {filters.to || "الآن"}
            </span>
          )}
          {hasAmount && (
            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-black text-amber-500">
              {filters.minAmount || 0} - {filters.maxAmount || "∞"} ج.م
            </span>
          )}
        </div>
      )}
    </div>
  );
}
