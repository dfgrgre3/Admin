"use client";

import { useCallback, useState } from "react";

/** Shared error state + a `handleError` that both records and re-throws, so
 * every domain hook's try/catch can `await x().catch(() => {})` while the
 * step components still see a populated `error` for their Alert banners. */
export function useErrorState() {
  const [error, setError] = useState<Error | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const handleError = useCallback((err: unknown, defaultMessage: string): never => {
    const normalized = err instanceof Error ? err : new Error(defaultMessage);
    setError(normalized);
    throw normalized;
  }, []);

  return { error, clearError, handleError };
}
