"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { pageEnterVariants, shouldAnimatePage } from "@/lib/animations";

/**
 * Wraps page content and runs a subtle enter animation (fade + slide) on mount and route change.
 * Use in root layout to get page transitions between views.
 * Defers animation until after mount to avoid hydration mismatch (prefersReducedMotion uses window).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const initialPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    if (!mounted) {
      initialPathnameRef.current = pathname;
      setMounted(true);
    }
  }, [mounted, pathname]);

  // Server and first client render: no variant (avoids hydration mismatch).
  const animate = mounted && shouldAnimatePage();
  const isInitialLoad =
    mounted && initialPathnameRef.current === pathname && pathname !== null;
  const runEnterAnimation = animate && !isInitialLoad;

  return (
    <motion.div
      key={pathname}
      variants={pageEnterVariants}
      initial={runEnterAnimation ? "hidden" : false}
      animate={animate ? "visible" : false}
    >
      {children}
    </motion.div>
  );
}
