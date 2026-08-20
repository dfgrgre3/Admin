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
        "rounded-md animate-pulse-skeleton",
        SKELETON_VARIANTS[variant],
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

// CSS animation for skeleton loading
function SkeletonAnimations() {
  return (
    <style>{`
      @keyframes pulse-skeleton {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .animate-pulse-skeleton {
        animation: pulse-skeleton 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      .animate-shimmer {
        background: linear-gradient(to right, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
        background-size: 200% 100%;
        animation: shimmer 1.5s ease-in-out infinite;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fadeIn 0.5s ease-out forwards;
      }
    `}</style>
  );
}

export const DashboardSkeleton = React.memo(function DashboardSkeleton() {
  return (
    <>
      <SkeletonAnimations />
      <div className="fixed inset-0 z-50 bg-background">
        {/* Progress Bar */}
        <div className="fixed top-0 left-0 right-0 h-1 overflow-hidden bg-border/30">
          <div className="h-full bg-primary animate-shimmer" style={{ width: '60%', animationDuration: '2s' }} />
        </div>

        {/* Main Content */}
        <div className="pt-8 pb-20 px-4 max-w-7xl mx-auto space-y-8" role="status" aria-label="جاري تحميل لوحة التحكم">

          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="space-y-3">
              <Skeleton className="h-10 w-64 md:w-80" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-32 rounded-full" />
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Skeleton className="h-12 w-32 rounded-2xl" />
              <Skeleton className="h-12 w-36 rounded-2xl" />
              <Skeleton className="h-12 w-48 rounded-2xl flex-shrink-0" />
            </div>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-10 w-10 rounded-xl" />
                </div>
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-4 w-16 opacity-60" />
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 md:grid-cols-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="grid gap-6 lg:grid-cols-3 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {/* Activity Feed */}
            <div className="lg:col-span-2 rounded-2xl border bg-card p-6 space-y-4">
              <Skeleton className="h-7 w-48" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>

            {/* Quick Actions / Summary */}
            <div className="space-y-4">
              <div className="rounded-2xl border bg-card p-6 space-y-4">
                <Skeleton className="h-7 w-36" />
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
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
