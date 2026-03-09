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
 * Each item gets a slight stagger and optional scale bounce.
 */
export function animateShuffle(elements: HTMLElement[]): void {
  if (elements.length === 0) return;
  if (prefersReducedMotion()) return;

  const tl = createTimeline();

  elements.forEach((el, i) => {
    const delay = (i * STAGGER_MS) / 1000;
    tl.add(
      el,
      {
        scale: [0.98, 1],
        opacity: [0.85, 1],
        duration: DURATION / 1000,
        delay,
        ease: EASE,
      } as AnimationParams,
      "<"
    );
  });

  tl.play();
}

/**
 * Run a quick "shuffle feedback" on a container's children (e.g. grid items).
 * Call after updating the list order in React; pass the container and it animates direct children.
 */
export function animateShuffleGrid(container: HTMLElement): void {
  if (prefersReducedMotion()) return;
  const children = Array.from(container.children).filter(
    (c): c is HTMLElement => c instanceof HTMLElement
  );
  animateShuffle(children);
}
