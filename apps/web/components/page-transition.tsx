"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { animatePageIn } from "@/lib/animations";

/**
 * Wraps page content and runs a subtle enter animation (fade + slide) on mount and route change.
 * Use in root layout to get page transitions between views.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (ref.current) animatePageIn(ref.current);
  }, [pathname]);

  return <div ref={ref}>{children}</div>;
}
