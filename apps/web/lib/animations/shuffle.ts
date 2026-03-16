/**
 * Shuffle animations: items smoothly reposition with scale + opacity.
 * Used for outfit cards, recommendation grid after "Shuffle" click.
 */

import { animate } from "framer-motion";
import { prefersReducedMotion } from "./prefers-reduced-motion";

const DURATION_MS = 320;
const STAGGER_MS = 45;
const EASE = [0.25, 0.46, 0.45, 0.94] as const; // outQuad-like

/**
 * Animate a list of elements as if they shuffled into new positions.
 * Uses scale + opacity only. Skips null/disconnected elements.
 */
export function animateShuffle(elements: HTMLElement[]): void {
  const valid = elements.filter(
    (el): el is HTMLElement =>
      el != null && typeof el.isConnected === "boolean" && el.isConnected
  );
  if (valid.length === 0) return;
  if (prefersReducedMotion()) return;

  const durationSec = DURATION_MS / 1000;
  valid.forEach((el, i) => {
    if (!el?.isConnected) return;
    const delay = (i * STAGGER_MS) / 1000;
    // Start from slightly scaled down and faded, then animate to full
    animate(
      el,
      { scale: [0.98, 1], opacity: [0.85, 1] },
      {
        duration: durationSec,
        delay,
        ease: EASE,
      }
    );
  });
}

/**
 * Run shuffle feedback on a container's direct children.
 * Call after updating the list order in React (e.g. after Shuffle click).
 */
export function animateShuffleGrid(container: HTMLElement | null): void {
  if (container == null || !container.isConnected) return;
  if (prefersReducedMotion()) return;
  const children = Array.from(container.children).filter(
    (c): c is HTMLElement => c instanceof HTMLElement && c.isConnected
  );
  animateShuffle(children);
}
