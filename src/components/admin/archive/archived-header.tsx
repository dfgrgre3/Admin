"use client";

import { Archive, Download, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ArchivedHeaderProps {
  total: number;
  onRefresh: () => void;
  isFetching: boolean;
  onExport: () => void;
  isExporting: boolean;
}

export function ArchivedHeader({
  total,
  onRefresh,
  isFetching,
  onExport,
  isExporting,
}: ArchivedHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/30 p-8 backdrop-blur-xl">
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-[80px]" />
      <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-violet-500/10 blur-[80px]" />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <Archive className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              الأرشيف
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              الدورات التي تم أرشفتها ({total}). الاستعادة تعيد الدورة لحالة
              المسودة، والحذف ينقلها إلى سلة المحذوفات نهائياً.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="icon"
            title="تحديث البيانات"
            onClick={onRefresh}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" className="gap-2" onClick={onExport} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isExporting ? "جارٍ التصدير..." : "تصدير CSV"}
          </Button>
        </div>
      </div>
    </div>
  );
}
