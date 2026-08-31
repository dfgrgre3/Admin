"use client";

import { ChevronDown } from "lucide-react";
import { AdminButton } from "@/components/admin/ui/admin-button";

interface AuditLoadMoreProps {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}

export function AuditLoadMore({ hasMore, loading, onLoadMore }: AuditLoadMoreProps) {
  if (!hasMore) return null;
  return (
    <div className="flex justify-center mt-4">
      <AdminButton variant="outline" onClick={onLoadMore} disabled={loading} icon={ChevronDown}>
        {loading ? "جارٍ التحميل..." : "تحميل المزيد"}
      </AdminButton>
    </div>
  );
}