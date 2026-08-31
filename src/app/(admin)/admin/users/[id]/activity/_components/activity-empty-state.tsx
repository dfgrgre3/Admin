"use client";

import { Activity, AlertTriangle, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ActivityEmptyStateProps {
  variant: "loading" | "error" | "empty";
  hasFilters: boolean;
  onRetry?: () => void;
}

export function ActivityEmptyState({ variant, hasFilters, onRetry }: ActivityEmptyStateProps) {
  if (variant === "error") {
    return (
      <Card className="p-6 border-destructive/20 bg-destructive/5 text-center">
        <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
        <p className="font-bold text-destructive mb-2">تعذر تحميل سجل النشاط</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry} className="rounded-xl">
            <RefreshCw className="h-4 w-4 ml-2" /> إعادة المحاولة
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-12 border-white/10 text-center">
      <Activity className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
      <p className="text-xl font-black text-muted-foreground">لا يوجد نشاط</p>
      <p className="text-sm text-muted-foreground mt-1">
        {hasFilters ? "لا توجد أحداث مطابقة لهذه الفلاتر" : "لا يوجد نشاط مسجل لهذا المستخدم بعد."}
      </p>
    </Card>
  );
}