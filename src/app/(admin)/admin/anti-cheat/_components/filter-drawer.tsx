"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Calendar,
  Filter,
  X,
  Search,
} from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import {
  EVENT_TYPE_CONFIG,
  EVENT_TYPE_ORDER,
  SEVERITY_CONFIG,
  SEVERITY_ORDER,
  STATUS_CONFIG,
  STATUS_ORDER,
  type AntiCheatEvent,
  type AntiCheatFlag,
  type AntiCheatSeverity,
  type AntiCheatStatus,
} from "./types";

interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flags: AntiCheatFlag[];
  events: AntiCheatEvent[];
  onApply: (filters: AppliedFilters) => void;
  current?: AppliedFilters;
}

export interface AppliedFilters {
  status: AntiCheatStatus | "all";
  severity: AntiCheatSeverity | "all";
  eventType: string;
  minRisk: number | "all";
  dateFrom?: string;
  dateTo?: string;
}

const initial: AppliedFilters = {
  status: "all",
  severity: "all",
  eventType: "all",
  minRisk: "all",
  dateFrom: "",
  dateTo: "",
};

export function FilterDrawer({
  open,
  onOpenChange,
  flags,
  events,
  onApply,
  current,
}: FilterDrawerProps) {
  const [filters, setFilters] = React.useState<AppliedFilters>(current ?? initial);

  React.useEffect(() => {
    if (open) setFilters(current ?? initial);
  }, [open, current]);

  const activeCount = [
    filters.status !== "all",
    filters.severity !== "all",
    filters.eventType !== "all",
    filters.minRisk !== "all",
    Boolean(filters.dateFrom),
    Boolean(filters.dateTo),
  ].filter(Boolean).length;

  const handleApply = () => {
    onApply(filters);
    onOpenChange(false);
  };

  const handleReset = () => {
    setFilters(initial);
    onApply(initial);
  };

  // فلاتر سريعة مقترحة بناءً على البيانات
  const quickFilters = [
    { label: "حالات حرجة مفتوحة", value: { status: "OPEN" as const, minRisk: 80 } },
    { label: "قيد المراجعة", value: { status: "UNDER_REVIEW" as const } },
    { label: "أحداث اليوم", value: { dateFrom: new Date().toISOString().slice(0, 10) } },
    { label: "محظورة حديثاً", value: { status: "BLOCKED" as const } },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-lg font-black">
              <Filter className="h-5 w-5 text-primary" />
              فلاتر متقدمة
            </SheetTitle>
            {activeCount > 0 && (
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                {activeCount} نشط
              </Badge>
            )}
          </div>
          <SheetDescription>
            ضبط فلاتر البحث لرؤية حالات أو أحداث محددة بدقة
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {/* فلاتر سريعة */}
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              فلاتر سريعة
            </p>
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((qf) => (
                <button
                  key={qf.label}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, ...qf.value }))
                  }
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-black transition hover:border-primary/50 hover:bg-primary/5"
                >
                  {qf.label}
                </button>
              ))}
            </div>
          </div>

          {/* الحالة */}
          <FilterSection label="حالة الحالة" icon={Filter}>
            <Select
              value={filters.status}
              onValueChange={(v) =>
                setFilters({ ...filters, status: v as AntiCheatStatus | "all" })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                {STATUS_ORDER.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_CONFIG[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {STATUS_ORDER.map((s) => {
                const count = flags.filter((f) => f.status === s).length;
                const cfg = STATUS_CONFIG[s];
                const active = filters.status === s;
                return (
                  <button
                    key={s}
                    onClick={() =>
                      setFilters({ ...filters, status: active ? "all" : s })
                    }
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[10px] font-black transition",
                      active
                        ? cn("border-current", cfg.bg, cfg.text)
                        : "border-border bg-card hover:bg-accent"
                    )}
                  >
                    {cfg.label}
                    <span className="mr-1 opacity-70">{formatNumber(count)}</span>
                  </button>
                );
              })}
            </div>
          </FilterSection>

          {/* درجة المخاطر */}
          <FilterSection label="درجة المخاطر" icon={Search}>
            <Select
              value={String(filters.minRisk)}
              onValueChange={(v) =>
                setFilters({
                  ...filters,
                  minRisk: v === "all" ? "all" : Number(v),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر درجة المخاطر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الدرجات</SelectItem>
                <SelectItem value="30">منخفضة فأعلى (≥ 30)</SelectItem>
                <SelectItem value="60">عالية (≥ 60)</SelectItem>
                <SelectItem value="80">حرجة (≥ 80)</SelectItem>
                <SelectItem value="90">شديدة الخطورة (≥ 90)</SelectItem>
              </SelectContent>
            </Select>
          </FilterSection>

          {/* الخطورة */}
          <FilterSection label="خطورة الأحداث" icon={Filter}>
            <Select
              value={filters.severity}
              onValueChange={(v) =>
                setFilters({
                  ...filters,
                  severity: v as AntiCheatSeverity | "all",
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الخطورة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الخطورة</SelectItem>
                {SEVERITY_ORDER.map((s) => (
                  <SelectItem key={s} value={s}>
                    {SEVERITY_CONFIG[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterSection>

          {/* نوع الحدث */}
          <FilterSection label="نوع الحدث" icon={Filter}>
            <Select
              value={filters.eventType}
              onValueChange={(v) => setFilters({ ...filters, eventType: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع الحدث" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأنواع</SelectItem>
                {EVENT_TYPE_ORDER.map((t) => {
                  const count = events.filter((e) => e.eventType === t).length;
                  const cfg = EVENT_TYPE_CONFIG[t];
                  return (
                    <SelectItem key={t} value={t}>
                      {(cfg?.label ?? t)} ({count})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </FilterSection>

          {/* التاريخ */}
          <FilterSection label="الفترة الزمنية" icon={Calendar}>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[10px] font-bold text-muted-foreground">
                  من
                </label>
                <input
                  type="date"
                  value={filters.dateFrom || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, dateFrom: e.target.value })
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold text-muted-foreground">
                  إلى
                </label>
                <input
                  type="date"
                  value={filters.dateTo || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, dateTo: e.target.value })
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>
          </FilterSection>
        </div>

        <SheetFooter className="mt-8 flex-row gap-2">
          <AdminButton
            variant="ghost"
            onClick={handleReset}
            icon={X}
            className="flex-1"
          >
            إعادة تعيين
          </AdminButton>
          <AdminButton onClick={handleApply} className="flex-1" icon={Filter}>
            تطبيق الفلاتر
          </AdminButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function FilterSection({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-black">{label}</span>
      </div>
      {children}
    </motion.div>
  );
}