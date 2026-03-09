/**
 * Respect user preference for reduced motion.
 * When true, non-essential animations should be disabled or simplified.
 */

function getPrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

let cached: boolean | null = null;

/**
 * Returns whether the user prefers reduced motion.
 * Cached per session to avoid repeated matchMedia queries.
 */
export function prefersReducedMotion(): boolean {
  if (cached === null) cached = getPrefersReducedMotion();
  return cached;
}

/**
 * Reset cache (e.g. for testing or when media query might have changed).
 */
export function resetReducedMotionCache(): void {
  cached = null;
}
