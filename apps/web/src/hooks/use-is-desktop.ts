"use client";

import { useEffect, useState } from "react";

/** `null` until mounted — avoids treating SSR/mobile as desktop before matchMedia runs. */
export function useIsDesktop(breakpoint = 1024): boolean | null {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);

  return isDesktop;
}
