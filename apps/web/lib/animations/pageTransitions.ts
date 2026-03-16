/**
 * Subtle page/view transitions: fade + slight slide, duration < 350ms.
 */

import { animate } from "animejs";
import type { AnimationParams } from "animejs";
import { prefersReducedMotion } from "./prefers-reduced-motion";

const DURATION_MS = 280;
const SLIDE_PX = 8;
const EASE = "outCubic";

/**
 * Animate a page/view container in (on enter).
 */
export function animatePageIn(container: HTMLElement | null): void {
  if (container == null || !container.isConnected) return;
  if (prefersReducedMotion()) {
    container.style.opacity = "1";
    container.style.transform = "";
    return;
  }
  try {
    animate(container, {
      opacity: [0, 1],
      translateY: [SLIDE_PX, 0],
      duration: DURATION_MS / 1000,
      ease: EASE,
    } as AnimationParams);
  } catch {
    container.style.opacity = "1";
    container.style.transform = "";
  }
}

/**
 * Animate a page/view container out (before unmount or route change).
 * Returns a Promise that resolves when the animation completes.
 */
export function animatePageOut(container: HTMLElement | null): Promise<void> {
  if (container == null || !container.isConnected || prefersReducedMotion())
    return Promise.resolve();
  try {
    const anim = animate(container, {
      opacity: [1, 0],
      translateY: [0, -SLIDE_PX],
      duration: DURATION_MS / 1000,
      ease: EASE,
    } as AnimationParams);
    if (anim && "then" in anim && typeof anim.then === "function") {
      return anim.then(() => undefined) as Promise<void>;
    }
  } catch {
    // no-op
  }
  return new Promise((resolve) => setTimeout(resolve, DURATION_MS));
}
