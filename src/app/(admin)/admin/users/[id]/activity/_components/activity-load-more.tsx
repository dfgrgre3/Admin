"use client";

import { Button } from "@/components/ui/button";

interface ActivityLoadMoreProps {
  remaining: number;
  onLoadMore: () => void;
  loading?: boolean;
}

export function ActivityLoadMore({ remaining, onLoadMore, loading }: ActivityLoadMoreProps) {
  return (
    <div className="text-center">
      <Button
        variant="outline"
        className="rounded-2xl px-8 border-white/10"
        onClick={onLoadMore}
        disabled={loading}
      >
        تحميل المزيد ({remaining} حدث متبقي)
      </Button>
    </div>
  );
}