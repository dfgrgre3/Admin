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
  return (
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-[2rem] border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-2 font-semibold">
        <span>تعذر تحميل {errorCount} من أقسام البيانات. يتم عرض المعلومات المتاحة حالياً.</span>
      </div>
      <AdminButton variant="outline" size="sm" onClick={onRefresh} loading={isFetching}>
        إعادة المحاولة
      </AdminButton>
    </div>
  );
});
