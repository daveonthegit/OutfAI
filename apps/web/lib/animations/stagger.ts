/**
 * Staggered entry animations: fade in + translateY with per-element delay.
 * Use Framer Motion variants on a container and its motion children.
 */

import type { Variants } from "framer-motion";
import { prefersReducedMotion } from "./prefers-reduced-motion";

export const STAGGER_DURATION_MS = 280;
export const STAGGER_DELAY_PER_ITEM_MS = 60;
const TRANSLATE_Y_PX = 12;
const EASE = [0.33, 1, 0.68, 1] as const; // outCubic-like

/**
 * Container variants: stagger children with a small delay per item.
 * Use with motion.div: initial="hidden" animate="visible".
 */
export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER_DELAY_PER_ITEM_MS / 1000,
      delayChildren: 0,
    },
  },
};

/**
 * Item variants: fade in + slide up. Use on each direct motion child of the container.
 */
export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: TRANSLATE_Y_PX,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: STAGGER_DURATION_MS / 1000,
      ease: EASE,
    },
  },
};

/**
 * When user prefers reduced motion, use these so items appear immediately without stagger.
 */
export const staggerContainerVariantsReduced: Variants = {
  hidden: {},
  visible: {},
};

export const staggerItemVariantsReduced: Variants = {
  hidden: { opacity: 0, y: TRANSLATE_Y_PX },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0 },
  },
};

/**
 * Returns container and item variants based on reduced-motion preference.
 */
export function getStaggerVariants(): {
  container: Variants;
  item: Variants;
} {
  if (prefersReducedMotion()) {
    return {
      container: staggerContainerVariantsReduced,
      item: staggerItemVariantsReduced,
    };
  }
  return {
    container: staggerContainerVariants,
    item: staggerItemVariants,
  };
}
