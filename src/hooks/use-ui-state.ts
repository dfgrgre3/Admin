'use client';

import { useState, useCallback } from 'react';

type SetValue<T> = T | ((prev: T) => T);

function useUIState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    const stored = localStorage.getItem(`tolo-ui-${key}`);
    if (stored) {
      try {
        return JSON.parse(stored) as T;
      } catch {
        return initialValue;
      }
    }

    return initialValue;
  });

  const setStoredValue = useCallback(
    (newValue: SetValue<T>) => {
      setValue((prev) => {
        const resolved = typeof newValue === 'function'
          ? (newValue as (previous: T) => T)(prev)
          : newValue;
        try {
          localStorage.setItem(`tolo-ui-${key}`, JSON.stringify(resolved));
        } catch {
          // UI persistence is best-effort (private mode/quota/security policy).
        }
        return resolved;
      });
    },
    [key]
  );

  return [value, setStoredValue] as const;
}

export { useUIState };