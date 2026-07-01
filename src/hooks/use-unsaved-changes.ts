"use client";

import { useEffect } from "react";

/**
 * Warns the user before leaving the page (refresh / close / navigate away)
 * when there are unsaved changes. This prevents accidental data loss in
 * editors that keep changes in local state until an explicit save.
 *
 * @param isDirty whether the current view has unsaved changes
 */
export function useUnsavedChanges(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);
}
