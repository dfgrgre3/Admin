'use client';

import { useState, useEffect, useCallback } from 'react';

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
        const resolved = typeof newValue === 'function' ? (newValue as Function)(prev) : newValue;
        localStorage.setItem(`tolo-ui-${key}`, JSON.stringify(resolved));
        return resolved;
      });
    },
    [key]
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(`tolo-ui-${key}`, JSON.stringify(value));
  }, [key, value]);

  return [value, setStoredValue] as const;
}

export { useUIState };