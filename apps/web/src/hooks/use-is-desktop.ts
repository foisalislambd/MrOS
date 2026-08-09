"use client";

import { useCallback, useSyncExternalStore } from "react";

function subscribe(breakpoint: number, onStoreChange: () => void) {
  const mq = window.matchMedia(`(min-width: ${breakpoint}px)`);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

/**
 * Subscribe to the desktop breakpoint. SSR assumes desktop so the sidebar
 * rail does not flash closed→open on first paint.
 */
export function useIsDesktop(breakpoint = 1024): boolean {
  return useSyncExternalStore(
    useCallback(
      (onStoreChange) => subscribe(breakpoint, onStoreChange),
      [breakpoint],
    ),
    () => window.matchMedia(`(min-width: ${breakpoint}px)`).matches,
    () => true,
  );
}
