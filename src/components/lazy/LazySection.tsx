"use client";

import React from "react";
import { useLazyLoad } from "@/lib/lazyLoad.tsx";
import { ContentSkeleton, ChartSkeleton, CardSkeleton, TableSkeleton } from "@/components/lazy/LazyComponents";

interface LazySectionProps {
  children: React.ReactNode;
  skeleton?: "content" | "chart" | "card" | "table";
  className?: string;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function LazySection({
  children,
  skeleton = "content",
  className = "",
  threshold = 0.1,
  rootMargin = "100px",
  once = true,
}: LazySectionProps) {
  const { ref, isVisible } = useLazyLoad({
    rootMargin,
    threshold,
  });

  const renderSkeleton = () => {
    switch (skeleton) {
      case "chart":
        return <ChartSkeleton />;
      case "card":
        return <CardSkeleton />;
      case "table":
        return <TableSkeleton />;
      case "content":
      default:
        return <ContentSkeleton />;
    }
  };

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : renderSkeleton()}
    </div>
  );
}

// Specialized lazy components for common patterns
export function LazyChart({ children, height = 350, className = "" }: { children: React.ReactNode; height?: number; className?: string }) {
  return (
    <LazySection skeleton="chart" className={className}>
      <div style={{ height }}>{children}</div>
    </LazySection>
  );
}

export function LazyTable({ children, rows = 10, className = "" }: { children: React.ReactNode; rows?: number; className?: string }) {
  return (
    <LazySection skeleton="table" className={className}>
      {children}
    </LazySection>
  );
}

export function LazyCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <LazySection skeleton="card" className={className}>
      {children}
    </LazySection>
  );
}