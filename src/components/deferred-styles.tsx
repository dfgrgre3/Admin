"use client";

import * as React from "react";

/**
 * Loads non-critical CSS asynchronously after the initial render.
 * The stylesheet is served from /public and fetched with the
 * `media="print"` trick so it does not block the initial render.
 * Once loaded, the media is switched to "all" to apply the styles.
 */
export function DeferredStyles() {
  React.useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/deferred-styles.css";
    link.media = "print";
    link.onload = () => {
      link.media = "all";
    };
    document.head.appendChild(link);
  }, []);

  return null;
}