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
 * Skips null/disconnected elements to avoid "reading 'duration' of null" in anime.js.
 */
export function staggerFadeIn(
  elements: HTMLElement[],
  options?: { delayPerItem?: number; duration?: number }
): void {
  const valid = elements.filter(
    (el): el is HTMLElement =>
      el != null && typeof el.isConnected === "boolean" && el.isConnected
  );
  if (valid.length === 0) return;
  if (prefersReducedMotion()) {
    valid.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "";
    });
    return;
  }

  const delayPerItem = options?.delayPerItem ?? STAGGER_DELAY_MS;
  const durationMs = options?.duration ?? DURATION_MS;
  const durationSec = Number(durationMs) / 1000;
  if (!Number.isFinite(durationSec) || durationSec <= 0) return;

  try {
    const tl = createTimeline();

    valid.forEach((el, i) => {
      if (!el?.isConnected) return;
      const delay = (i * delayPerItem) / 1000;
      const params: AnimationParams = {
        opacity: [0, 1],
        y: [TRANSLATE_Y_PX, 0],
        duration: durationSec,
        delay,
        ease: EASE,
      };
      tl.add(el, params, "<");
    });

    tl.play();
  } catch (err) {
    if (typeof console !== "undefined" && console.warn) {
      console.warn("[staggerFadeIn] animation skipped:", err);
    }
  }
}

/**
 * Run stagger fade-in on a container's direct children.
 * No-op if container is null or disconnected (avoids anime.js errors on slow/hydration).
 */
export function staggerFadeInContainer(
  container: HTMLElement | null,
  options?: { delayPerItem?: number; duration?: number }
): void {
  if (container == null || !container.isConnected) return;
  const children = Array.from(container.children).filter(
    (c): c is HTMLElement => c instanceof HTMLElement && c.isConnected
  );
  staggerFadeIn(children, options);
}
