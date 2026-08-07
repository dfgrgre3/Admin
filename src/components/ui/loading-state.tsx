'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary',
        className,
      )}
      role="status"
      aria-label="جاري التحميل"
    />
  );
}

function LoadingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-6">
      <LoadingSpinner className="h-12 w-12" />
      <div className="flex flex-col items-center gap-2 text-center px-4">
        <h3 className="text-xl font-bold text-foreground">جاري تحضير المحتوى...</h3>
        <p className="text-muted-foreground max-w-xs text-sm">
          يرجى الانتظار قليلاً.
        </p>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rpg-card flex flex-col gap-4">
      <Skeleton className="aspect-video w-full rounded-2xl" />
      <div className="space-y-3">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex justify-between items-center mt-4">
        <Skeleton className="h-10 w-28 rounded-xl" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  );
}

function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function UnifiedLayoutSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-10 min-h-screen" role="status" aria-label="جاري التحميل">
      <div className="space-y-4">
        <Skeleton className="h-14 w-1/3 max-w-sm rounded-2xl" />
        <Skeleton className="h-5 w-1/2 max-w-lg rounded-xl" />
      </div>

      <Skeleton className="h-[350px] w-full rounded-2xl" />

      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>

      <SkeletonGrid count={3} />
    </div>
  );
}

export { LoadingPage, LoadingSpinner, SkeletonCard, SkeletonGrid };
