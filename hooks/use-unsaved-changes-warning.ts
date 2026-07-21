"use client";

import { useEffect } from "react";

/**
 * Warn before the browser tears down the page (reload, tab/window close, typing a
 * new URL, back/forward that leaves the document) while `enabled` is true. This is
 * the guard for the headline data-loss case on flaky connections: a reload wiping
 * in-progress attendance / mark entry. The browser renders its own generic,
 * localized confirm text — beforeunload copy is not customizable, so no i18n
 * string is needed. It does NOT fire on client-side (SPA) navigation.
 */
export function useUnsavedChangesWarning(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Legacy Chromium/Safari require a truthy returnValue to trigger the prompt.
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [enabled]);
}
