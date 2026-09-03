"use client";

import { Button } from "@/components/ui/button";

interface ArchivedBulkBarProps {
  selectedCount: number;
  totalCount: number;
  busy: boolean;
  onRestore: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export function ArchivedBulkBar({
  selectedCount,
  totalCount,
  busy,
  onRestore,
  onDelete,
  onClear,
}: ArchivedBulkBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 border-b bg-primary/5 px-5 py-3">
      <p className="text-sm font-medium text-foreground">
        تم تحديد {selectedCount} من {totalCount}
      </p>
      <Button size="sm" variant="outline" onClick={onRestore} disabled={busy}>
        استعادة
      </Button>
      <Button size="sm" variant="destructive" onClick={onDelete} disabled={busy}>
        حذف
      </Button>
      <Button size="sm" variant="ghost" onClick={onClear} disabled={busy}>
        إلغاء التحديد
      </Button>
    </div>
  );
}
