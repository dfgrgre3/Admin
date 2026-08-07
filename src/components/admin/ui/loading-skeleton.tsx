"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const SKELETON_VARIANTS = {
  default: "bg-muted",
  dark: "bg-muted/80",
  glow: "bg-primary/10",
} as const;

type SkeletonVariant = keyof typeof SKELETON_VARIANTS;

function Skeleton({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: SkeletonVariant }) {
  return (
    <div
      className={cn(
        "rounded-md",
        SKELETON_VARIANTS[variant],
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

export const DashboardSkeleton = React.memo(function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="جاري تحميل لوحة التحكم">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-4">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export const TableSkeleton = React.memo(function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-6" role="status" aria-label="جاري تحميل الجدول">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>

      <div className="rounded-xl border overflow-hidden">
        <div className="bg-muted/30 border-b px-4 py-3 flex gap-4">
          {[...Array(cols)].map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>

        {[...Array(rows)].map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="border-b px-4 py-4 flex items-center gap-4"
          >
            {[...Array(cols)].map((_, colIndex) => (
              <div key={colIndex} className="flex-1">
                {colIndex === 0 ? (
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ) : (
                  <Skeleton className="h-4 w-16" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
});

export const AnalyticsSkeleton = React.memo(function AnalyticsSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="جاري تحميل التحليلات">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-4">
            <div className="space-y-1">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-52" />
            </div>
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
});

export const SettingsSkeleton = React.memo(function SettingsSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="جاري تحميل الإعدادات">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      <Skeleton className="h-10 w-full rounded-lg" />

      <div className="rounded-xl border bg-card p-6 space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
});

export function LoadingSkeleton({ type = 'dashboard' }: { type?: 'dashboard' | 'table' | 'analytics' | 'settings' }) {
  switch (type) {
    case 'table':
      return <TableSkeleton />;
    case 'analytics':
      return <AnalyticsSkeleton />;
    case 'settings':
      return <SettingsSkeleton />;
    case 'dashboard':
    default:
      return <DashboardSkeleton />;
  }
}
