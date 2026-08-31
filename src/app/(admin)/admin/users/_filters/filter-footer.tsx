"use client";

import { FilterX } from "lucide-react";
import { AdminButton } from "@/components/admin/ui/admin-button";

interface FilterFooterProps {
  hasActiveFilters: boolean;
  onApply: () => void;
  onReset: () => void;
}

export function FilterFooter({ hasActiveFilters, onApply, onReset }: FilterFooterProps) {
  return (
    <div className="p-6 border-t border-border bg-muted/20 flex gap-3">
      <AdminButton className="flex-1" onClick={onApply}>تطبيق الفلاتر</AdminButton>
      {hasActiveFilters && (
        <AdminButton variant="outline" onClick={onReset} className="flex-shrink-0">
          <FilterX className="h-4 w-4 ml-2" />
          إعادة ضبط
        </AdminButton>
      )}
    </div>
  );
}