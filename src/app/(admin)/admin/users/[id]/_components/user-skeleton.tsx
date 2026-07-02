"use client";

export function UserSkeleton() {
  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-3">
          <div className="h-9 w-56 bg-muted animate-pulse rounded-xl" />
          <div className="h-5 w-72 bg-muted/70 animate-pulse rounded-lg" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-36 bg-muted animate-pulse rounded-2xl" />
          <div className="h-10 w-36 bg-muted animate-pulse rounded-2xl" />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile card */}
          <div className="rounded-3xl border bg-card overflow-hidden shadow-lg">
            <div className="h-28 bg-muted animate-pulse" />
            <div className="px-6 pb-6 -mt-16 flex flex-col items-center gap-4">
              <div className="h-28 w-28 rounded-full bg-muted animate-pulse border-4 border-background" />
              <div className="space-y-2 w-full text-center">
                <div className="h-6 w-3/4 mx-auto bg-muted animate-pulse rounded-lg" />
                <div className="h-4 w-1/2 mx-auto bg-muted/70 animate-pulse rounded-md" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
                <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
              </div>
              {/* Progress */}
              <div className="w-full space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-2 w-full bg-muted animate-pulse rounded-full" />
              </div>
              {/* Info rows */}
              <div className="w-full space-y-3 pt-4 border-t">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-muted animate-pulse rounded-lg shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-full bg-muted animate-pulse rounded" />
                      <div className="h-2.5 w-2/3 bg-muted/60 animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Quick actions card */}
          <div className="rounded-2xl border bg-card p-5 space-y-3 shadow-md">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-11 w-full bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Stats grid */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl border bg-card p-5 space-y-3 shadow-md">
                <div className="h-9 w-9 bg-muted animate-pulse rounded-xl" />
                <div className="space-y-1.5">
                  <div className="h-7 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-14 bg-muted/70 animate-pulse rounded" />
                  <div className="h-2.5 w-20 bg-muted/50 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="h-14 w-full bg-muted animate-pulse rounded-2xl" />

          {/* Content area */}
          <div className="space-y-6">
            <div className="h-48 w-full bg-muted animate-pulse rounded-2xl" />
            <div className="h-64 w-full bg-muted animate-pulse rounded-2xl" />
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-56 bg-muted animate-pulse rounded-2xl" />
              <div className="h-56 bg-muted animate-pulse rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
