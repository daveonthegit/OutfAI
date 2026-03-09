/**
 * List reordering (FLIP-style): capture positions, update DOM, animate to new positions.
 * Animates translateX, translateY, scale, opacity.
 */

import { createLayout } from "animejs";
import type { AutoLayout } from "animejs";
import { prefersReducedMotion } from "./prefers-reduced-motion";

const DURATION_MS = 300;
const EASE = "outCubic";

/**
 * FLIP reorder controller. Call record(container) before updating list order,
 * then after React has re-rendered call animate() to run the transition.
 */
export function createReorderController() {
  let layout: AutoLayout | null = null;

  return {
    record(container: HTMLElement | null) {
      if (!container || prefersReducedMotion()) return;
      layout = createLayout(container, {
        children: Array.from(container.children) as HTMLElement[],
        duration: DURATION_MS / 1000,
        ease: EASE,
      });
      layout.record();
    },
    animate() {
      if (layout) {
        layout.animate();
        layout = null;
      }
    },
  };
}

/**
 * Run FLIP animate on an existing layout (e.g. after DOM was updated).
 * Only use if you have already called controller.record(container) before the DOM update.
 */
export type ReorderController = ReturnType<typeof createReorderController>;
