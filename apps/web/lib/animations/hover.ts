/**
 * Card hover: subtle shadow lift only (no scale — keeps hover calm and fast).
 * Framer Motion props for use with motion.div (whileHover / transition).
 */

import { prefersReducedMotion } from "./prefers-reduced-motion";

const DURATION_S = 0.12;
const EASE = [0.33, 1, 0.68, 1] as const;

const SHADOW_REST = "0 2px 8px rgba(0,0,0,0.06)";
const SHADOW_HOVER = "0 6px 18px rgba(0,0,0,0.1)";

/**
 * Motion props for a card that gains a slightly stronger shadow on hover.
 * Spread onto a motion.div: <motion.div {...cardHoverMotionProps}>.
 */
export function getCardHoverMotionProps(): Record<string, unknown> {
  if (prefersReducedMotion()) return {};
  return {
    whileHover: {
      boxShadow: SHADOW_HOVER,
      transition: { duration: DURATION_S, ease: EASE },
    },
    transition: { duration: DURATION_S, ease: EASE },
    style: { boxShadow: SHADOW_REST },
  };
}

/**
 * Optional glow on hover (e.g. design token --signal-orange).
 */
export function getCardGlowMotionProps(
  glowColor = "rgba(255, 77, 0, 0.15)"
): Record<string, unknown> {
  if (prefersReducedMotion()) return {};
  return {
    whileHover: {
      boxShadow: `0 6px 18px rgba(0,0,0,0.08), 0 0 0 1px ${glowColor}`,
      transition: { duration: DURATION_S, ease: EASE },
    },
  };
}
