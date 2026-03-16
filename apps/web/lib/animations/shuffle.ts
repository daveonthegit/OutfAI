/**
 * Shuffle animations: items smoothly reposition with translate/scale.
 * Used for outfit cards, inventory items, recommendation lists.
 */

import { createTimeline } from "animejs";
import type { AnimationParams } from "animejs";
import { prefersReducedMotion } from "./prefers-reduced-motion";

const DURATION = 320;
const STAGGER_MS = 45;
const EASE = "outQuad";

/**
 * Animate a list of elements as if they shuffled into new positions.
 * Uses translate + scale only (no layout thrashing).
 * Skips null/disconnected elements to avoid "reading 'duration' of null" in anime.js.
 */
export function animateShuffle(elements: HTMLElement[]): void {
  const valid = elements.filter(
    (el): el is HTMLElement =>
      el != null && typeof el.isConnected === "boolean" && el.isConnected
  );
  if (valid.length === 0) return;
  if (prefersReducedMotion()) return;

  const tl = createTimeline();
  const durationSec = DURATION / 1000;

  valid.forEach((el, i) => {
    const delay = (i * STAGGER_MS) / 1000;
    const params: AnimationParams = {
      scale: [0.98, 1],
      opacity: [0.85, 1],
      duration: durationSec,
      delay,
      ease: EASE,
    };
    tl.add(el, params, "<");
  });

  tl.play();
}

/**
 * Run a quick "shuffle feedback" on a container's children (e.g. grid items).
 * Call after updating the list order in React; pass the container and it animates direct children.
 * No-op if container is null or disconnected (avoids anime.js errors on slow/hydration).
 */
export function animateShuffleGrid(container: HTMLElement | null): void {
  if (container == null || !container.isConnected) return;
  if (prefersReducedMotion()) return;
  const children = Array.from(container.children).filter(
    (c): c is HTMLElement => c instanceof HTMLElement && c.isConnected
  );
  animateShuffle(children);
}
