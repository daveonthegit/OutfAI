/**
 * Staggered entry animations: fade in + translateY with per-element delay.
 */

import { createTimeline } from "animejs";
import type { AnimationParams } from "animejs";
import { prefersReducedMotion } from "./prefers-reduced-motion";

const DURATION_MS = 280;
const STAGGER_DELAY_MS = 60;
const TRANSLATE_Y_PX = 12;
const EASE = "outCubic";

/**
 * Staggered fade-in with slight translateY for a list of elements.
 * delay = index * 60ms by default.
 */
export function staggerFadeIn(
  elements: HTMLElement[],
  options?: { delayPerItem?: number; duration?: number }
): void {
  if (elements.length === 0) return;
  if (prefersReducedMotion()) {
    elements.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "";
    });
    return;
  }

  const delayPerItem = options?.delayPerItem ?? STAGGER_DELAY_MS;
  const duration = options?.duration ?? DURATION_MS;

  const tl = createTimeline();

  elements.forEach((el, i) => {
    const delay = (i * delayPerItem) / 1000;
    tl.add(
      el,
      {
        opacity: [0, 1],
        y: [TRANSLATE_Y_PX, 0],
        duration: duration / 1000,
        delay,
        ease: EASE,
      } as AnimationParams,
      "<"
    );
  });

  tl.play();
}

/**
 * Run stagger fade-in on a container's direct children.
 */
export function staggerFadeInContainer(
  container: HTMLElement,
  options?: { delayPerItem?: number; duration?: number }
): void {
  const children = Array.from(container.children).filter(
    (c): c is HTMLElement => c instanceof HTMLElement
  );
  staggerFadeIn(children, options);
}
