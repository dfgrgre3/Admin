"use client";

import { FileText, RefreshCw, ServerCrash } from "lucide-react";
import { AdminCard } from "@/components/admin/ui/admin-card";

export function AuditLoadingState() {
  return (
    <AdminCard variant="glass" className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-white/5 rounded w-1/3"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    </AdminCard>
  );
}

interface AuditErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function AuditErrorState({ error, onRetry }: AuditErrorStateProps) {
  return (
    <AdminCard variant="glass" className="p-6">
      <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
        <div className="p-4 rounded-full bg-red-500/10 text-red-500">
          <ServerCrash className="h-8 w-8" />
        </div>
        <div>
          <p className="font-bold text-red-500">{error}</p>
          <p className="text-sm text-muted-foreground mt-1">تحقق من الاتصال بالشبكة أو حاول لاحقاً.</p>
        </div>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <RefreshCw className="h-4 w-4" />
          إعادة المحاولة
        </button>
      </div>
    </AdminCard>
  );
}

export function AuditEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="p-4 rounded-full bg-muted/30 text-muted-foreground">
        <FileText className="h-8 w-8" />
      </div>
      <p className="text-muted-foreground">لا يوجد سجل تدقيق لهذا المستخدم حتى الآن.</p>
    </div>
  );
}