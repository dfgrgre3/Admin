"use client";

import React from "react";

// Loading skeleton components
export const SidebarSkeleton = () => (
  <div className="flex h-screen flex-col border-l border-border glass-panel-strong w-[260px] animate-pulse">
    <div className="flex h-16 items-center justify-between border-b px-3">
      <div className="flex items-center gap-2.5 pr-1">
        <div className="h-9 w-9 rounded-xl bg-muted/50" />
        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted/50 rounded" />
          <div className="h-3 w-16 bg-muted/50 rounded" />
        </div>
      </div>
    </div>
    <div className="flex-1 space-y-4 p-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-20 bg-muted/50 rounded" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-10 bg-muted/30 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const HeaderSkeleton = () => (
  <div className="flex h-16 items-center justify-between border-b px-4 lg:px-6 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="h-8 w-8 bg-muted/50 rounded-lg" />
      <div className="h-8 w-8 bg-muted/50 rounded-lg lg:hidden" />
    </div>
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 bg-muted/50 rounded-full" />
      <div className="h-9 w-9 bg-muted/50 rounded-full" />
    </div>
  </div>
);

export const ContentSkeleton = () => (
  <div className="space-y-6 p-4 lg:p-6">
    <div className="h-32 bg-muted/30 rounded-[2rem] animate-pulse" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-36 bg-muted/30 rounded-[2rem] animate-pulse" />
      ))}
    </div>
    <div className="h-[400px] bg-muted/30 rounded-[2rem] animate-pulse" />
  </div>
);

export const PageSkeleton = () => (
  <div className="flex h-screen overflow-hidden">
    <SidebarSkeleton />
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <HeaderSkeleton />
      <main className="flex-1 overflow-y-auto">
        <ContentSkeleton />
      </main>
    </div>
  </div>
);

export const ChartSkeleton = ({ height = 350 }: { height?: number }) => (
  <div 
    className="w-full bg-muted/30 rounded-[2rem] animate-pulse"
    style={{ height }}
  />
);

export const CardSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`admin-glass p-6 rounded-[2rem] border border-white/10 ${className}`}>
    <div className="space-y-4">
      <div className="h-4 w-24 bg-muted/30 rounded animate-pulse" />
      <div className="h-8 w-32 bg-muted/30 rounded animate-pulse" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 10 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-muted/20 rounded-xl animate-pulse">
        <div className="h-10 w-10 bg-muted/30 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-muted/30 rounded" />
          <div className="h-3 w-48 bg-muted/30 rounded" />
        </div>
        <div className="h-8 w-20 bg-muted/30 rounded-lg" />
      </div>
    ))}
  </div>
);