"use client";

import * as React from "react";
import {
  AlertTriangle,
  Calendar,
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Input as TextInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { ApiLogsFilters } from "../_lib/constants";
import {
  HTTP_METHODS,
  HTTP_STATUS_GROUPS,
  API_CATEGORIES,
  SEVERITIES,
  STATUS_CONFIG,
  METHOD_CONFIG,
  CATEGORY_CONFIG,
  SEVERITY_CONFIG,
} from "../_lib/constants";

interface FiltersBarProps {
  filters: ApiLogsFilters;
  apiKeys: Array<{ id: string; name: string }>;
  onChange: (next: ApiLogsFilters) => void;
  onReset: () => void;
}

export function ApiLogsFiltersBar({ filters, apiKeys, onChange, onReset }: FiltersBarProps) {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const update = <K extends keyof ApiLogsFilters>(key: K, value: ApiLogsFilters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const activeCount =
    (filters.search ? 1 : 0) +
    (filters.statusGroup !== "all" ? 1 : 0) +
    (filters.method !== "all" ? 1 : 0) +
    (filters.category !== "all" ? 1 : 0) +
    (filters.severity !== "all" ? 1 : 0) +
    (filters.apiKeyId ? 1 : 0) +
    (filters.startDate ? 1 : 0) +
    (filters.endDate ? 1 : 0) +
    (filters.minResponseTime !== null ? 1 : 0) +
    (filters.rateLimitedOnly ? 1 : 0) +
    (filters.errorsOnly ? 1 : 0);

  return (
    <AdminCard variant="glass" className="p-4 space-y-4">
      {/* Primary filters */}
      <div className="grid gap-3 md:grid-cols-12">
        <div className="md:col-span-5 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <TextInput
            placeholder="ابحث في المسار، المستخدم، IP، كود الخطأ..."
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            className="pr-9"
          />
        </div>

        <Select
          className="md:col-span-2"
          label="الحالة"
          value={filters.statusGroup}
          onChange={(v) => update("statusGroup", v as ApiLogsFilters["statusGroup"])}
          options={[
            { value: "all", label: "جميع الحالات" },
            ...HTTP_STATUS_GROUPS.map((s) => ({
              value: s,
              label: `${s} — ${STATUS_CONFIG[s].label}`,
            })),
          ]}
        />

        <Select
          className="md:col-span-2"
          label="الطريقة"
          value={filters.method}
          onChange={(v) => update("method", v as ApiLogsFilters["method"])}
          options={[
            { value: "all", label: "جميع الطرق" },
            ...HTTP_METHODS.map((m) => ({
              value: m,
              label: `${m} — ${METHOD_CONFIG[m].label}`,
            })),
          ]}
        />

        <Select
          className="md:col-span-3"
          label="الفئة"
          value={filters.category}
          onChange={(v) => update("category", v as ApiLogsFilters["category"])}
          options={[
            { value: "all", label: "جميع الفئات" },
            ...API_CATEGORIES.map((c) => ({
              value: c,
              label: CATEGORY_CONFIG[c].label,
            })),
          ]}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <AdminButton
          variant="outline"
          size="sm"
          icon={showAdvanced ? X : SlidersHorizontal}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? "إخفاء الفلاتر المتقدمة" : "فلاتر متقدمة"}
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black bg-primary text-primary-foreground">
              {activeCount}
            </span>
          )}
        </AdminButton>

        {filters.errorsOnly && <FilterPill label="أخطاء فقط" onClear={() => update("errorsOnly", false)} />}
        {filters.rateLimitedOnly && (
          <FilterPill label="محظور بالمعدل" onClear={() => update("rateLimitedOnly", false)} />
        )}
        {filters.minResponseTime !== null && (
          <FilterPill
            label={`≥ ${filters.minResponseTime}ms`}
            onClear={() => update("minResponseTime", null)}
          />
        )}

        {activeCount > 0 && (
          <AdminButton variant="ghost" size="sm" icon={RotateCcw} onClick={onReset}>
            إعادة ضبط
          </AdminButton>
        )}
      </div>

      {showAdvanced && (
        <div className="grid gap-3 md:grid-cols-12 pt-2 border-t border-border/50">
          <div className="md:col-span-3 space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              من تاريخ
            </Label>
            <TextInput
              type="date"
              value={filters.startDate}
              onChange={(e) => update("startDate", e.target.value)}
            />
          </div>
          <div className="md:col-span-3 space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              إلى تاريخ
            </Label>
            <TextInput
              type="date"
              value={filters.endDate}
              onChange={(e) => update("endDate", e.target.value)}
            />
          </div>
          <Select
            className="md:col-span-3"
            label="الخطورة"
            value={filters.severity}
            onChange={(v) => update("severity", v as ApiLogsFilters["severity"])}
            options={[
              { value: "all", label: "جميع المستويات" },
              ...SEVERITIES.map((s) => ({
                value: s,
                label: SEVERITY_CONFIG[s].label,
              })),
            ]}
          />
          <Select
            className="md:col-span-3"
            label="مفتاح API"
            value={filters.apiKeyId}
            onChange={(v) => update("apiKeyId", v)}
            options={[
              { value: "", label: "جميع المفاتيح" },
              ...apiKeys.map((k) => ({ value: k.id, label: k.name })),
            ]}
          />

          <div className="md:col-span-4 space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              أقل زمن استجابة (ms)
            </Label>
            <TextInput
              type="number"
              min={0}
              placeholder="مثال: 1000"
              value={filters.minResponseTime ?? ""}
              onChange={(e) =>
                update(
                  "minResponseTime",
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
            />
          </div>

          <div className="md:col-span-8 flex flex-wrap gap-3 items-end pb-1">
            <Toggle
              label="الأخطاء فقط"
              icon={AlertTriangle}
              active={filters.errorsOnly}
              onToggle={() => update("errorsOnly", !filters.errorsOnly)}
              activeColor="rose"
            />
            <Toggle
              label="تجاوز حد المعدل فقط"
              icon={Filter}
              active={filters.rateLimitedOnly}
              onToggle={() => update("rateLimitedOnly", !filters.rateLimitedOnly)}
              activeColor="amber"
            />
          </div>
        </div>
      )}
    </AdminCard>
  );
}

// ─── Helpers ─────────────────────────────────────────────────

function Select({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">
        {label}
      </Label>
      <select
        className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FilterPill({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-bold text-primary">
      {label}
      <button onClick={onClear} className="hover:bg-primary/20 rounded-full p-0.5">
        <X className="h-2.5 w-2.5" />
      </button>
    </span>
  );
}

function Toggle({
  label,
  icon: Icon,
  active,
  onToggle,
  activeColor = "primary",
}: {
  label: string;
  icon: React.ElementType;
  active: boolean;
  onToggle: () => void;
  activeColor?: "primary" | "rose" | "amber";
}) {
  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
        active
          ? activeColor === "rose"
            ? "border-rose-500/40 bg-rose-500/10 text-rose-500"
            : activeColor === "amber"
            ? "border-amber-500/40 bg-amber-500/10 text-amber-500"
            : "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-background text-muted-foreground hover:border-primary/30"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}