"use client";

export function UserEditSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded-lg" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="h-24 w-24 rounded-full bg-muted animate-pulse mx-auto" />
          <div className="h-6 w-32 bg-muted animate-pulse rounded mx-auto" />
          <div className="h-4 w-24 bg-muted animate-pulse rounded mx-auto" />
        </div>
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-10 w-full bg-muted animate-pulse rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}