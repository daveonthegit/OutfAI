"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { pageEnterVariants, shouldAnimatePage } from "@/lib/animations";

/**
 * Wraps page content and runs a subtle enter animation (fade + slide) on mount and route change.
 * Use in root layout to get page transitions between views.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const animate = shouldAnimatePage();

  return (
    <motion.div
      key={pathname}
      variants={pageEnterVariants}
      initial={animate ? "hidden" : false}
      animate={animate ? "visible" : false}
    >
      {children}
    </motion.div>
  );
}
