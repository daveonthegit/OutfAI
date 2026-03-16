/**
 * Animation utility layer — Framer Motion helpers for OutfAI.
 * Use these instead of inline animation logic.
 */

export { animateShuffle, animateShuffleGrid } from "./shuffle";
export {
  staggerContainerVariants,
  staggerItemVariants,
  staggerContainerVariantsReduced,
  staggerItemVariantsReduced,
  getStaggerVariants,
  STAGGER_DURATION_MS,
  STAGGER_DELAY_PER_ITEM_MS,
} from "./stagger";
export { getCardHoverMotionProps, getCardGlowMotionProps } from "./hover";
export {
  pageEnterVariants,
  pageExitVariants,
  shouldAnimatePage,
  PAGE_TRANSITION_DURATION_MS,
} from "./pageTransitions";
export {
  prefersReducedMotion,
  resetReducedMotionCache,
} from "./prefers-reduced-motion";
