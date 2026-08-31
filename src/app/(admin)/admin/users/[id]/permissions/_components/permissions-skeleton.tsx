"use client";

export function PermissionsSkeleton() {
  return (
    <div className="space-y-6" dir="rtl">
      <div className="h-16 w-80 animate-pulse rounded-xl bg-muted" />
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-56 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  );
}