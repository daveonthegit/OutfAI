"use client";

import { type Variants } from "framer-motion";
import { usePrefersReducedMotionMedia } from "@/components/marketing/use-prefers-reduced-motion";

const spring = { type: "spring" as const, stiffness: 420, damping: 36 };

export const marketingContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.055, delayChildren: 0.04 },
  },
};

export const marketingItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: spring },
};

export function usePrefersReducedMarketingMotion() {
  return usePrefersReducedMotionMedia();
}
