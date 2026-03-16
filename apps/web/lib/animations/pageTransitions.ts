/**
 * Page/view transition config for Framer Motion.
 * Used by PageTransition component: fade + slight slide, duration < 350ms.
 */

import { type Variants } from "framer-motion";
import { prefersReducedMotion } from "./prefers-reduced-motion";

export const PAGE_TRANSITION_DURATION_MS = 280;
const SLIDE_PX = 8;

/**
 * Variants for page enter: fade in + slide up.
 * Use with motion.div: initial="hidden" animate="visible".
 */
export const pageEnterVariants: Variants = {
  hidden: {
    opacity: 0,
    y: SLIDE_PX,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: PAGE_TRANSITION_DURATION_MS / 1000,
      ease: [0.33, 1, 0.68, 1], // outCubic-like
    },
  },
};

/**
 * Variants for page exit: fade out + slide up (e.g. before route change).
 */
export const pageExitVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -SLIDE_PX,
    transition: {
      duration: PAGE_TRANSITION_DURATION_MS / 1000,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

/**
 * Whether to run full transition (false when user prefers reduced motion).
 */
export function shouldAnimatePage(): boolean {
  return !prefersReducedMotion();
}
