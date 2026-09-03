"use client";

/**
 * لوحة السجل: قائمة الطلبات السابقة مع إمكانية:
 *  - إعادة الإرسال (تحميل في المحرر)
 *  - الحذف الفردي / مسح الكل
 *  - الحفظ في مجموعة
 */

import * as React from "react";
import {
  Clock,
  RefreshCcw,
  Trash2,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { HistoryEntry, RequestDraft, SavedCollection } from "../_types/api-explorer";

interface HistoryPanelProps {
  history: HistoryEntry[];
  collections: SavedCollection[];
  onReplay: (entry: HistoryEntry) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onSaveToCollection: (entry: HistoryEntry, collectionId: string) => void;
}

function statusBadge(status: number): { className: string; label: string } {
  if (status === 0) return { className: "bg-slate-500/15 text-slate-300 border-slate-500/30", label: "—" };
  if (status >= 200 && status < 300)
    return { className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", label: String(status) };
  if (status >= 300 && status < 400)
    return { className: "bg-blue-500/15 text-blue-300 border-blue-500/30", label: String(status) };
  if (status >= 400 && status < 500)
    return { className: "bg-amber-500/15 text-amber-300 border-amber-500/30", label: String(status) };
  return { className: "bg-rose-500/15 text-rose-300 border-rose-500/30", label: String(status) };
}

function methodColor(method: string): string {
  switch (method) {
    case "GET":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    case "POST":
      return "bg-blue-500/15 text-blue-300 border-blue-500/30";
    case "PUT":
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    case "PATCH":
      return "bg-violet-500/15 text-violet-300 border-violet-500/30";
    case "DELETE":
      return "bg-rose-500/15 text-rose-300 border-rose-500/30";
    default:
      return "bg-slate-500/15 text-slate-300 border-slate-500/30";
  }
}

export function HistoryPanel({
  history,
  collections,
  onReplay,
  onRemove,
  onClearAll,
  onSaveToCollection,
}: HistoryPanelProps): React.ReactElement {
  if (history.length === 0) {
    return (
      <EmptyState
        title="لا يوجد سجل بعد"
        description="سيتم عرض جميع الطلبات المرسلة هنا تلقائياً."
        icon={Clock}
        className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-10"
      />
    );
  }

  return (
    <div className="space-y-2" dir="rtl">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">
          {history.length.toLocaleString("ar-EG")} طلب في السجل
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-7 gap-1 px-2 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
        >
          <ListChecks className="h-3.5 w-3.5" />
          مسح الكل
        </Button>
      </div>

      <ul className="max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
        {history.map((entry) => {
          const status = statusBadge(entry.status);
          return (
            <li
              key={entry.id}
              className="group rounded-2xl border border-white/5 bg-white/[0.03] p-2.5 transition-colors hover:border-white/15 hover:bg-white/[0.05]"
            >
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn("h-5 border px-1.5 text-[10px] font-black", methodColor(entry.method))}
                >
                  {entry.method}
                </Badge>
                <Badge variant="outline" className={cn("h-5 border px-1.5 text-[10px]", status.className)}>
                  {status.label}
                </Badge>
                <span className="flex-1 truncate font-mono text-[11px] text-foreground/80" dir="ltr">
                  {entry.url}
                </span>
                <span className="text-[10px] text-muted-foreground">{entry.durationMs}ms</span>
              </div>
              <div className="mt-1.5 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onReplay(entry)}
                  className="h-6 gap-1 px-2 text-[10px]"
                >
                  <RefreshCcw className="h-3 w-3" />
                  إعادة
                </Button>
                {collections.length > 0 ? (
                  <SaveToCollectionMenu
                    collections={collections}
                    onSelect={(cid) => onSaveToCollection(entry, cid)}
                  />
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(entry.id)}
                  className="h-6 gap-1 px-2 text-[10px] text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                >
                  <Trash2 className="h-3 w-3" />
                  حذف
                </Button>
                <span className="ms-auto text-[10px] text-muted-foreground/70">
                  {new Date(entry.timestamp).toLocaleTimeString("ar-EG")}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SaveToCollectionMenu({
  collections,
  onSelect,
}: {
  collections: SavedCollection[];
  onSelect: (id: string) => void;
}): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="h-6 gap-1 px-2 text-[10px]"
      >
        <Bookmark className="h-3 w-3" />
        حفظ في مجموعة
      </Button>
      {open ? (
        <div className="absolute z-30 mt-1 max-h-56 w-56 overflow-y-auto rounded-xl border border-white/10 bg-popover p-1 text-xs shadow-2xl">
          {collections.length === 0 ? (
            <p className="px-2 py-1.5 text-muted-foreground">لا توجد مجموعات بعد.</p>
          ) : (
            collections.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onSelect(c.id);
                  setOpen(false);
                  toast.success(`تم الحفظ في "${c.name}"`);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-start text-[11px] hover:bg-white/5"
              >
                <span className="truncate">{c.name}</span>
                <span className="text-[10px] text-muted-foreground">{c.requests.length}</span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
