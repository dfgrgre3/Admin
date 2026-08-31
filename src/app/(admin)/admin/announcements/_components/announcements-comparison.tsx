"use client";

import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  GitCompare,
  Plus,
  X,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  MousePointerClick,
  Send,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { adminFetch } from "@/lib/api/admin-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminButton } from "@/components/admin/ui/admin-button";
import type { Announcement } from "./types";

interface AnnouncementsComparisonProps {
  className?: string;
  /** عند اختيار إعلان للمقارنة */
  onSelect?: (ids: string[]) => void;
}

const MAX_COMPARE = 4;

/**
 * مكوّن مقارنة بين 2-4 إعلانات جنباً إلى جنب
 * يعرض: العنوان، النوع، الأولوية، التاريخ، الجمهور، القنوات،
 * والإحصائيات (مشاهدات، نقرات، معدل التفاعل)
 * مع إبراز الفائز في كل صف
 */
export function AnnouncementsComparison({ className, onSelect }: AnnouncementsComparisonProps) {
  const [open, setOpen] = React.useState(false);
  const [ids, setIds] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "announcements", "comparison", ids],
    queryFn: async () => {
      if (ids.length === 0) return { items: [] as Announcement[] };
      const url = `/api/admin/announcements?ids=${ids.join(",")}&limit=${MAX_COMPARE}`;
      const res = await adminFetch(url);
      if (!res.ok) return { items: [] as Announcement[] };
      const json = await res.json();
      return {
        items:
          (json?.data?.items as Announcement[]) ||
          (json?.data?.announcements as Announcement[]) ||
          (json?.items as Announcement[]) ||
          [],
      };
    },
    enabled: ids.length > 0,
    staleTime: 10000,
  });

  const announcements = data?.items || [];

  const searchQuery = useQuery({
    queryKey: ["admin", "announcements", "compare-search", search],
    queryFn: async () => {
      const url = `/api/admin/announcements?search=${encodeURIComponent(search)}&limit=8`;
      const res = await adminFetch(url);
      if (!res.ok) return { items: [] as Announcement[] };
      const json = await res.json();
      return {
        items:
          (json?.data?.items as Announcement[]) ||
          (json?.data?.announcements as Announcement[]) ||
          (json?.items as Announcement[]) ||
          [],
      };
    },
    enabled: open,
    staleTime: 10000,
  });

  const addId = (id: string) => {
    if (ids.includes(id)) return;
    if (ids.length >= MAX_COMPARE) {
      toast.warning(`الحد الأقصى ${MAX_COMPARE} إعلانات`);
      return;
    }
    const next = [...ids, id];
    setIds(next);
    onSelect?.(next);
  };

  const removeId = (id: string) => {
    const next = ids.filter((i) => i !== id);
    setIds(next);
    onSelect?.(next);
  };

  return (
    <div className={cn("space-y-3", className)} dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-500">
            <GitCompare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-black">مقارنة الإعلانات</h3>
            <p className="text-[10px] font-bold text-muted-foreground">
              قارن حتى {MAX_COMPARE} إعلانات جنباً إلى جنب
            </p>
          </div>
        </div>
        <AdminButton
          type="button"
          variant="outline"
          size="sm"
          icon={GitCompare}
          onClick={() => setOpen(true)}
          disabled={ids.length < 2}
        >
          مقارنة ({ids.length})
        </AdminButton>
      </div>

      {ids.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/2.5 py-6 text-center text-xs font-bold text-muted-foreground">
          <GitCompare className="h-5 w-5 opacity-40" />
          اختر 2-{MAX_COMPARE} إعلانات لبدء المقارنة
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {ids.map((id) => (
            <Badge key={id} variant="secondary" className="gap-1 px-2 py-1">
              <span className="text-[10px] font-black">#{id.slice(-6)}</span>
              <button
                type="button"
                onClick={() => removeId(id)}
                className="rounded-sm transition hover:bg-white/10"
                aria-label="إزالة"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-cyan-500" />
              مقارنة تفصيلية بين الإعلانات
            </DialogTitle>
            <DialogDescription>
              المقارنة تشمل: البيانات الوصفية، الجمهور، القنوات، والإحصائيات
            </DialogDescription>
          </DialogHeader>

          {announcements.length === 0 && isLoading && (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          )}

          {announcements.length < 2 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-bold text-amber-700">
              اختر إعلانيين على الأقل للمقارنة
            </div>
          )}

          {announcements.length >= 2 && (
            <ComparisonGrid items={announcements} onRemove={removeId} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ───────── جدول المقارنة ───────── */

interface ComparisonGridProps {
  items: Announcement[];
  onRemove: (id: string) => void;
}

function ComparisonGrid({ items, onRemove }: ComparisonGridProps) {
  // حساب القيمة الأعلى في كل صف لتحديد الفائز
  const calcStats = React.useMemo(() => {
    return items.map((a) => {
      const m = a.metrics;
      const views = m?.views || 0;
      const clicks = m?.clicks || 0;
      const delivered = m?.delivered || 0;
      const read = m?.read || 0;
      const ctr = delivered > 0 ? (clicks / delivered) * 100 : 0;
      const readRate = delivered > 0 ? (read / delivered) * 100 : 0;
      return { views, clicks, delivered, read, ctr, readRate };
    });
  }, [items]);

  const winners = {
    views: indexOfMax(calcStats.map((s) => s.views)),
    clicks: indexOfMax(calcStats.map((s) => s.clicks)),
    delivered: indexOfMax(calcStats.map((s) => s.delivered)),
    ctr: indexOfMax(calcStats.map((s) => s.ctr)),
    readRate: indexOfMax(calcStats.map((s) => s.readRate)),
  };

  const rows = [
    {
      label: "العنوان",
      render: (a: Announcement) => (
        <p className="line-clamp-2 text-[11px] font-black">{a.title}</p>
      ),
    },
    {
      label: "النوع",
      render: (a: Announcement) => (
        <Badge variant="outline" className="text-[10px] font-black">
          {a.type}
        </Badge>
      ),
    },
    {
      label: "الأولوية",
      render: (a: Announcement) => (
        <Badge
          className={cn(
            "text-[10px] font-black",
            a.priority === "HIGH" && "bg-red-500/15 text-red-500",
            a.priority === "MEDIUM" && "bg-amber-500/15 text-amber-500",
            a.priority === "LOW" && "bg-blue-500/15 text-blue-500"
          )}
        >
          {a.priority}
        </Badge>
      ),
    },
    {
      label: "الحالة",
      render: (a: Announcement) => (
        <Badge
          variant={a.isActive ? "default" : "secondary"}
          className="text-[10px] font-black"
        >
          {a.isActive ? "نشط" : "متوقف"}
        </Badge>
      ),
    },
    {
      label: "تاريخ الإنشاء",
      render: (a: Announcement) => (
        <span className="text-[10px] font-bold">{formatDate(a.createdAt)}</span>
      ),
    },
    {
      label: "مجدول؟",
      render: (a: Announcement) => (
        <span className="text-[10px] font-bold">
          {a.scheduledAt ? formatDate(a.scheduledAt) : "—"}
        </span>
      ),
    },
    {
      label: "ينتهي في",
      render: (a: Announcement) => (
        <span className="text-[10px] font-bold">
          {a.expiresAt ? formatDate(a.expiresAt) : "—"}
        </span>
      ),
    },
    {
      label: "الجمهور",
      render: (a: Announcement) => (
        <div className="flex flex-wrap gap-1">
          {(a.audience || []).slice(0, 2).map((x) => (
            <Badge key={x} variant="secondary" className="text-[9px] font-bold">
              {x}
            </Badge>
          ))}
          {(a.audience || []).length > 2 && (
            <Badge variant="secondary" className="text-[9px] font-bold">
              +{(a.audience || []).length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      label: "القنوات",
      render: (a: Announcement) => (
        <div className="flex flex-wrap gap-1">
          {(a.channels || []).map((c) => (
            <Badge key={c} variant="outline" className="text-[9px] font-bold">
              {c}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      label: "المشاهدات",
      icon: Eye,
      winnerIdx: winners.views,
      render: (_a: Announcement, idx: number) => (
        <span className="font-mono text-xs font-black">{calcStats[idx]?.views ?? 0}</span>
      ),
    },
    {
      label: "النقرات",
      icon: MousePointerClick,
      winnerIdx: winners.clicks,
      render: (_a: Announcement, idx: number) => (
        <span className="font-mono text-xs font-black">{calcStats[idx]?.clicks ?? 0}</span>
      ),
    },
    {
      label: "تم التسليم",
      icon: Send,
      winnerIdx: winners.delivered,
      render: (_a: Announcement, idx: number) => (
        <span className="font-mono text-xs font-black">{calcStats[idx]?.delivered ?? 0}</span>
      ),
    },
    {
      label: "CTR",
      icon: TrendingUp,
      winnerIdx: winners.ctr,
      render: (_a: Announcement, idx: number) => (
        <span className="font-mono text-xs font-black">
          {(calcStats[idx]?.ctr ?? 0).toFixed(1)}%
        </span>
      ),
    },
    {
      label: "معدل القراءة",
      icon: CheckCircle2,
      winnerIdx: winners.readRate,
      render: (_a: Announcement, idx: number) => (
        <span className="font-mono text-xs font-black">
          {(calcStats[idx]?.readRate ?? 0).toFixed(1)}%
        </span>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10 bg-white/2.5">
            <th className="sticky right-0 z-10 bg-card/95 px-2 py-2 text-right text-[10px] font-black uppercase tracking-wider text-muted-foreground backdrop-blur">
              المعيار
            </th>
            {items.map((a, idx) => (
              <th key={a.id} className="min-w-[180px] px-2 py-2 text-right">
                <div className="flex items-center justify-between gap-1">
                  <span className="truncate text-[10px] font-black">#{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => onRemove(a.id)}
                    className="rounded-sm p-0.5 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-500"
                    aria-label="إزالة من المقارنة"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={cn(
                "border-b border-white/5 transition",
                rowIdx % 2 === 0 && "bg-white/1"
              )}
            >
              <td className="sticky right-0 z-10 bg-card/95 px-2 py-2 text-[10px] font-black text-muted-foreground backdrop-blur">
                <div className="flex items-center gap-1">
                  {"icon" in row && row.icon && <row.icon className="h-3 w-3" />}
                  {row.label}
                </div>
              </td>
              {items.map((a, idx) => {
                const isWinner = row.winnerIdx === idx && items.length > 1;
                return (
                  <td
                    key={a.id}
                    className={cn(
                      "px-2 py-2 transition",
                      isWinner && "bg-emerald-500/10 ring-1 ring-emerald-500/30"
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {row.render(a, idx)}
                      {isWinner && (
                        <Trophy className="h-3 w-3 shrink-0 text-emerald-500" />
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function indexOfMax(arr: number[]): number {
  if (arr.length === 0) return -1;
  let maxIdx = 0;
  let max = arr[0] ?? -Infinity;
  for (let i = 1; i < arr.length; i++) {
    if ((arr[i] ?? -Infinity) > max) {
      max = arr[i] ?? -Infinity;
      maxIdx = i;
    }
  }
  return maxIdx;
}

/**
 * Hook مساعد لإضافة إعلان للمقارنة من قائمة أو جدول
 */
export function useCompareSelection() {
  const [ids, setIds] = React.useState<string[]>([]);
  const toggle = React.useCallback((id: string) => {
    setIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }, []);
  const clear = React.useCallback(() => setIds([]), []);
  return { ids, toggle, clear, canCompare: ids.length >= 2 };
}