"use client";

import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { useActivityFeed } from "./_hooks/use-activity-feed";
import { ActivityHeader } from "./_components/activity-header";
import { ActivityStatsGrid } from "./_components/activity-stats-grid";
import { ActivityFilters } from "./_components/activity-filters";
import { ActivitySkeleton } from "./_components/activity-skeleton";
import { ActivityEmptyState } from "./_components/activity-empty-state";
import { ActivityTimeline } from "./_components/activity-timeline";
import { ActivityLoadMore } from "./_components/activity-load-more";

export default function UserActivityPage() {
  const params = useParams();
  const userId = params.id as string;

  const {
    search, setSearch,
    category, setCategory,
    page, setPage,
    query, userQuery,
    filtered, stats,
    resetFilters,
  } = useActivityFeed(userId);

  const userLabel = userQuery.data?.name || userQuery.data?.email || userId;
  const isLoading = query.isLoading;
  const isError = query.isError;
  const hasMore = !isLoading && query.data && filtered.length < stats.total;

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      <ActivityHeader
        userLabel={userLabel}
        onRefresh={() => void query.refetch()}
        userId={userId}
      />

      <ActivityStatsGrid
        total={stats.total}
        logins={stats.logins}
        failed={stats.failed}
        filtered={stats.filtered}
      />

      <ActivityFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        onReset={resetFilters}
      />

      <div className="space-y-8">
        {isLoading ? (
          <Card className="p-6 border-white/10"><ActivitySkeleton /></Card>
        ) : isError ? (
          <ActivityEmptyState variant="error" hasFilters={false} onRetry={() => void query.refetch()} />
        ) : filtered.length === 0 ? (
          <ActivityEmptyState variant="empty" hasFilters={!!search || category !== "all"} />
        ) : (
          <ActivityTimeline events={filtered} />
        )}

        {hasMore && (
          <ActivityLoadMore
            remaining={stats.total - filtered.length}
            onLoadMore={() => setPage(p => p + 1)}
          />
        )}
      </div>
    </div>
  );
}