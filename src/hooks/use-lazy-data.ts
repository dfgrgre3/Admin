"use client";

import * as React from "react";
import { useInView } from "react-intersection-observer";
import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";

/**
 * useLazyData — fetches data only when the referenced element is close to
 * the viewport (or when `forced` is turned on, e.g. after a user opens a tab).
 *
 * This prevents API requests for sections the user has not scrolled to yet.
 */
export function useLazyData<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  options?: {
    /** Load immediately regardless of intersection (default: false) */
    immediate?: boolean;
    /** Distance from viewport edge before triggering (px) */
    rootMargin?: string;
    /** Extra React Query options */
    queryOptions?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn" | "enabled">;
  },
): UseQueryResult<T> & { ref: (node?: Element | null) => void; inView: boolean } {
  const { immediate = false, rootMargin = "200px", queryOptions } = options ?? {};
  const { ref, inView } = useInView({
    threshold: 0.01,
    rootMargin,
    triggerOnce: true,
    skip: immediate,
  });

  const enabled = immediate || inView;

  const result = useQuery<T>({
    queryKey,
    queryFn,
    ...queryOptions,
    enabled,
  });

  return { ...result, ref, inView: enabled };
}

/**
 * useDeferredRender — renders a placeholder until a component is close to
 * viewport. Use this for heavy components that only need to be mounted when
 * the user is about to see them.
 */
export function useDeferredVisible(rootMargin = "200px", immediate = false) {
  const { ref, inView } = useInView({
    threshold: 0.01,
    rootMargin,
    triggerOnce: true,
    skip: immediate,
  });

  return { ref, isVisible: immediate || inView };
}