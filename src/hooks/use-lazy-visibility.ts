"use client";

import * as React from "react";
import { PERFORMANCE_DEFAULTS } from "@/lib/performance-config";

interface LazyVisibilityOptions {
  enabled?: boolean;
  rootMargin?: string;
  threshold?: number;
}

/**
 * Mounts expensive content shortly before it enters the viewport.
 * Browsers without IntersectionObserver render immediately as a safe fallback.
 */
export function useLazyVisibility({
  enabled = true,
  rootMargin = PERFORMANCE_DEFAULTS.lazyLoadRootMargin,
  threshold = 0.01,
}: LazyVisibilityOptions = {}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(!enabled);

  React.useEffect(() => {
    if (!enabled || isVisible) return;

    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, isVisible, rootMargin, threshold]);

  return { ref, isVisible: !enabled || isVisible };
}