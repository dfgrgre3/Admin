"use client";

import * as React from "react";
import { motion as m } from "framer-motion";
import { AlertTriangle, Globe, Hash, KeyRound, Layers } from "lucide-react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { formatNumber, formatDuration } from "../_lib/utils";

interface EndpointStat {
  endpoint: string;
  calls: number;
  avgMs: number;
  errors: number;
}

interface BreakdownListProps {
  title: string;
  icon: React.ElementType;
  iconColor?: string;
  items: Array<{ label: string; sub?: string; value: number | string; extra?: React.ReactNode }>;
  total?: number;
}

function BreakdownList({ title, icon: Icon, iconColor = "text-primary", items, total }: BreakdownListProps) {
  return (
    <AdminCard variant="glass" className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`h-4 w-4 ${iconColor}`} />
        <h3 className="font-black text-base">{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">لا توجد بيانات</p>
      ) : (
        <div className="space-y-3">
          {items.map((it, idx) => {
            const pct = total && typeof it.value === "number" ? (it.value / total) * 100 : 0;
            return (
              <div key={it.label + idx} className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate">{it.label}</p>
                    {it.sub && (
                      <p className="text-[10px] text-muted-foreground truncate">{it.sub}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {it.extra}
                    <span className="text-muted-foreground font-bold whitespace-nowrap">
                      {typeof it.value === "number" ? formatNumber(it.value) : it.value}
                    </span>
                  </div>
                </div>
                {pct > 0 && (
                  <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                    <m.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.03 }}
                      className="h-full bg-primary"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminCard>
  );
}

export function ApiEndpointsBreakdown({ items, total }: { items: EndpointStat[]; total: number }) {
  const mapped = items.map((it) => ({
    label: it.endpoint,
    sub: `${formatDuration(it.avgMs)} • ${it.errors} خطأ`,
    value: it.calls,
    extra: it.errors > 0 ? <AlertTriangle className="h-3 w-3 text-rose-500" /> : null,
  }));
  return (
    <BreakdownList title="أكثر المسارات نشاطاً" icon={Hash} iconColor="text-violet-500" items={mapped} total={total} />
  );
}

export function ApiKeysBreakdown({ items }: { items: Array<{ id: string; name: string; calls: number }> }) {
  const mapped = items.map((it) => ({
    label: it.name,
    sub: it.id,
    value: it.calls,
    extra: <KeyRound className="h-3 w-3 text-primary" />,
  }));
  const total = items.reduce((s, x) => s + x.calls, 0);
  return <BreakdownList title="أكثر المفاتيح استخداماً" icon={KeyRound} iconColor="text-purple-500" items={mapped} total={total} />;
}

export function ApiCategoryBreakdown({ data, total }: { data: Record<string, number>; total: number }) {
  const entries = Object.entries(data)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const mapped = entries.map(([key, count]) => ({
    label: key,
    sub: `${((count / Math.max(1, total)) * 100).toFixed(1)}% من الحركة`,
    value: count,
  }));
  return <BreakdownList title="توزيع الفئات" icon={Layers} iconColor="text-blue-500" items={mapped} total={total} />;
}

export function ApiStatusBreakdown({ data, total }: { data: Record<string, number>; total: number }) {
  const order: Array<[string, string, string]> = [
    ["2xx", "ناجح", "text-emerald-500"],
    ["3xx", "إعادة توجيه", "text-blue-500"],
    ["4xx", "خطأ عميل", "text-amber-500"],
    ["5xx", "خطأ خادم", "text-rose-500"],
  ];
  const items = order.map(([key, label, color]) => ({
    label,
    sub: key,
    value: data[key] ?? 0,
    extra: <span className={`text-[10px] font-black ${color}`}>●</span>,
  }));
  return <BreakdownList title="توزيع أكواد الحالة" icon={Globe} iconColor="text-cyan-500" items={items} total={total} />;
}