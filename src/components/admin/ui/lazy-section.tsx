"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface LazySectionProps {
  children: React.ReactNode;
  /** Placeholder shown until the section is close to the viewport */
  placeholder?: React.ReactNode;
  /** Minimum height of the section to prevent layout shift */
  minHeight?: number;
  className?: string;
  /** How far before the viewport edge to start loading (px) */
  rootMargin?: string;
  /** Load immediately without waiting for intersection */
  immediate?: boolean;
  /** Optional id attribute */
  id?: string;
}

/**
 * LazySection — renders a lightweight placeholder until the section is close
 * to the viewport, then mounts the real children once (and keeps them mounted).
 *
 * This avoids mounting heavy components or firing data requests for sections
 * the user has not scrolled to yet.
 */
export function LazySection({
  children,
  placeholder,
  minHeight,
  className,
  rootMargin = "200px",
  immediate = false,
  id,
}: LazySectionProps) {
  const [isVisible, setIsVisible] = React.useState(immediate);
  const [hasLoaded, setHasLoaded] = React.useState(immediate);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (immediate || hasLoaded) return;

    const element = containerRef.current;
    if (!element) return;

    if (typeof IntersectionObserver === "undefined") {
      const fallback = window.setTimeout(() => {
        setIsVisible(true);
        setHasLoaded(true);
      }, 0);
      return () => window.clearTimeout(fallback);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry!.isIntersecting) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [immediate, hasLoaded, rootMargin]);

  const defaultPlaceholder = placeholder ?? (
    <div
      className="w-full rounded-2xl bg-muted/10"
      style={minHeight ? { minHeight } : { minHeight: 200 }}
      aria-hidden="true"
    />
  );

  return (
    <div
      ref={containerRef}
      id={id}
      className={cn("w-full", className)}
      style={minHeight ? { minHeight } : undefined}
    >
      {isVisible ? children : defaultPlaceholder}
    </div>
  );
}

/**
 * LazyTab — renders tab content only when the tab becomes active AND is
 * visible. Used inside tab panels that are hidden by default.
 */
export function LazyTab({
  active,
  children,
  placeholder,
  className,
}: {
  active: boolean;
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  className?: string;
}) {
  const [mounted, setMounted] = React.useState(active);

  React.useEffect(() => {
    if (active && !mounted) {
      // Small delay so the tab switching animation feels natural
      const timer = window.setTimeout(() => setMounted(true), 50);
      return () => window.clearTimeout(timer);
    }
  }, [active, mounted]);

  if (!active && !mounted) return null;
  if (!active && mounted) {
    // Keep it mounted but hidden so state is preserved
    return (
      <div className={cn("hidden", className)} aria-hidden="true">
        {children}
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}

/**
 * LazyList — renders items only when they approach the viewport.
 * Useful for long lists where each item is expensive to render.
 */
export function LazyList<T>({
  items,
  renderItem,
  itemClassName,
  className,
  rootMargin = "100px",
  placeholder,
}: {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemClassName?: string;
  className?: string;
  rootMargin?: string;
  placeholder?: React.ReactNode;
}) {
  const [visibleCount, setVisibleCount] = React.useState(Math.min(items.length, 10));
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const allLoaded = visibleCount >= items.length;

  React.useEffect(() => {
    if (allLoaded) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisibleCount(items.length);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry!.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 10, items.length));
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [allLoaded, items.length, rootMargin]);

  const fallback = placeholder ?? (
    <div className="h-16 rounded-xl bg-muted/10" />
  );

  return (
    <div className={cn("space-y-3", className)}>
      {items.slice(0, visibleCount).map((item, index) => (
        <div key={index} className={itemClassName}>
          {renderItem(item, index)}
        </div>
      ))}
      {!allLoaded && (
        <div ref={sentinelRef} className="py-2">
          {fallback}
        </div>
      )}
    </div>
  );
}