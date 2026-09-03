"use client";

import { Button } from "@/components/ui/button";

interface ArchivedPaginationProps {
  page: number;
  totalPages: number;
  shown: number;
  total: number;
  /** يُخفى الترقيم أثناء التحميل أو الخطأ أو عندما لا توجد نتائج */
  hidden: boolean;
  isFetching: boolean;
  onPageChange: (page: number) => void;
}

export function ArchivedPagination({
  page,
  totalPages,
  shown,
  total,
  hidden,
  isFetching,
  onPageChange,
}: ArchivedPaginationProps) {
  if (hidden) return null;

  return (
    <div className="flex flex-col gap-3 border-t bg-muted/20 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        عرض {shown} من أصل {total} دورة مؤرشفة
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 rounded-lg px-3"
          disabled={page <= 1 || isFetching}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          السابق
        </Button>
        <span className="px-2 text-sm font-medium text-foreground">
          صفحة {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 rounded-lg px-3"
          disabled={page >= totalPages || isFetching}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        >
          التالي
        </Button>
      </div>
    </div>
  );
}
