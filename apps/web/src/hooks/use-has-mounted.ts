"use client";

import { useSyncExternalStore } from "react";

/** false on SSR / first server snapshot; true after client mount (hydration-safe). */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
