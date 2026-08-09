"use client";

import { useCallback, useState } from "react";

import { useHasMounted } from "@/hooks/use-has-mounted";
import { useIsDesktop } from "@/hooks/use-is-desktop";

/**
 * Desktop rail starts open. Mobile drawer starts closed.
 * Each viewport keeps its own toggle so resize does not fight the user.
 * Until mount, report open=true to match SSR (useIsDesktop server snapshot).
 */
export function useSidebarOpen() {
  const isDesktop = useIsDesktop();
  const hasMounted = useHasMounted();
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const open = !hasMounted
    ? true
    : isDesktop
      ? desktopOpen
      : mobileOpen;

  const setOpen = useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      const apply = (prev: boolean) =>
        typeof next === "function" ? next(prev) : next;

      if (isDesktop) setDesktopOpen(apply);
      else setMobileOpen(apply);
    },
    [isDesktop],
  );

  return [open, setOpen] as const;
}
