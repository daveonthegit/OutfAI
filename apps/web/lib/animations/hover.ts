/**
 * Card hover micro-interactions: scale, shadow, optional glow.
 * Use Anime.js timelines for smooth easing.
 */

import { createTimeline } from "animejs";
import type { AnimationParams } from "animejs";
import { prefersReducedMotion } from "./prefers-reduced-motion";

const DURATION_MS = 180;
const SCALE_HOVER = 1.03;
const EASE = "outCubic";

/**
 * Apply hover-in animation: slight scale and soft shadow.
 * Run on mouseenter with the card element.
 */
export function animateCardHoverIn(el: HTMLElement): void {
  if (prefersReducedMotion()) return;
  const tl = createTimeline();
  tl.add(
    el,
    {
      scale: SCALE_HOVER,
      duration: DURATION_MS / 1000,
      ease: EASE,
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    } as AnimationParams,
    0
  );
  tl.play();
}

/**
 * Apply hover-out animation: back to scale 1 and lighter shadow.
 */
export function animateCardHoverOut(el: HTMLElement): void {
  if (prefersReducedMotion()) return;
  const tl = createTimeline();
  tl.add(
    el,
    {
      scale: 1,
      duration: DURATION_MS / 1000,
      ease: EASE,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    } as AnimationParams,
    0
  );
  tl.play();
}

/**
 * Optional: glow using design token (e.g. --signal-orange with low opacity).
 * Call alongside hover in for accent glow.
 */
export function animateCardGlowIn(
  el: HTMLElement,
  glowColor = "rgba(255, 77, 0, 0.15)"
): void {
  if (prefersReducedMotion()) return;
  const tl = createTimeline();
  tl.add(
    el,
    {
      boxShadow: `0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px ${glowColor}`,
      duration: DURATION_MS / 1000,
      ease: EASE,
    } as AnimationParams,
    0
  );
  tl.play();
}
