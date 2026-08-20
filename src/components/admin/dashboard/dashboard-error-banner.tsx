"use client";

import * as React from "react";
import { AdminButton } from "@/components/admin/ui/admin-button";

interface DashboardErrorBannerProps {
  errorCount: number;
  isFetching: boolean;
  onRefresh: () => void;
}

export const DashboardErrorBanner = React.memo(function DashboardErrorBanner({
  errorCount,
  isFetching,
  onRefresh,
}: DashboardErrorBannerProps) {
  const bannerId = React.useId();

  return (
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-[2rem] border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200"
      role="alert"
      aria-live="assertive"
      aria-labelledby={bannerId}
      aria-atomic="true"
    >
      <div className="flex items-center gap-2 font-semibold">
        <span id={bannerId}>تعذر تحميل {errorCount} من أقسام البيانات. يتم عرض المعلومات المتاحة حالياً.</span>
      </div>
      <AdminButton
        variant="outline"
        size="sm"
        onClick={onRefresh}
        loading={isFetching}
        aria-label="إعادة محاولة تحميل البيانات"
      >
        إعادة المحاولة
      </AdminButton>
    </div>
  );
});
