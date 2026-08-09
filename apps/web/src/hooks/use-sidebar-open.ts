"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useIsDesktop } from "@/hooks/use-is-desktop";

const DESKTOP_MQ = "(min-width: 1024px)";

/**
 * Desktop rail starts open (no closed→open width animation on mount/refresh).
 * Mobile drawer starts closed before paint.
 */
export function useSidebarOpen() {
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(true);

  useLayoutEffect(() => {
    // Drop legacy preference key from the earlier approach.
    try {
      localStorage.removeItem("mros-sidebar-open");
    } catch {
      /* ignore */
    }
    setOpen(window.matchMedia(DESKTOP_MQ).matches);
  }, []);

  useEffect(() => {
    if (isDesktop === false) setOpen(false);
  }, [isDesktop]);

  return [open, setOpen] as const;
}
