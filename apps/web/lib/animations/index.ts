/**
 * Animation utility layer — Anime.js helpers for OutfAI.
 * Use these instead of inline animation logic.
 */

export { animateShuffle, animateShuffleGrid } from "./shuffle";
export { staggerFadeIn, staggerFadeInContainer } from "./stagger";
export {
  animateCardHoverIn,
  animateCardHoverOut,
  animateCardGlowIn,
} from "./hover";
export { createReorderController } from "./reorder";
export type { ReorderController } from "./reorder";
export { animatePageIn, animatePageOut } from "./pageTransitions";
export {
  prefersReducedMotion,
  resetReducedMotionCache,
} from "./prefers-reduced-motion";
