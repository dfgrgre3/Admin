"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageErrorBannerProps {
  error: unknown;
  onRetry: () => void;
}

export function PageErrorBanner({ error, onRetry }: PageErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
        <div>
          <p className="font-bold">تعذر تحميل المستخدمين</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "تحقق من الاتصال ثم أعد المحاولة."}
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="ml-2 h-4 w-4" /> إعادة المحاولة
      </Button>
    </div>
  );
}