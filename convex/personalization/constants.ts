/**
 * Centralized tuning knobs for the personalization pipeline (signals, scoring, exploration).
 * @see docs/features/personalization-plan.md
 */

/** Per-action signal strength applied per garment attribute (before per-dimension split). */
export const ACTION_DELTAS = {
  shown: 0,
  saved: 0.08,
  skipped: -0.05,
  worn: 0.15,
} as const;

export type OutfitAction = keyof typeof ACTION_DELTAS;

/** Daily multiplicative decay on each weight entry. */
export const DECAY_FACTOR = 0.98;

/** Remove learned entries whose absolute weight falls below this after decay. */
export const PRUNE_THRESHOLD = 0.02;

/** Clamp for each stored weight dimension value. */
export const WEIGHT_CLAMP_MIN = -1;
export const WEIGHT_CLAMP_MAX = 1;

/** ε-greedy exploration rate when totalActions ≤ this threshold. */
export const EPSILON_HIGH = 0.15;

/** ε after the user has enough feedback history. */
export const EPSILON_LOW = 0.08;

export const EPSILON_ACTION_THRESHOLD = 50;

/** Cold-start blend: explicit prefs vs learned; α = min(totalActions / this, 1). */
export const COLD_START_ACTION_TARGET = 10;

/** Max magnitude of the personalization term added to base score (before α). */
export const PERSONAL_SCORE_CLAMP = 0.5;

/** Uniform noise added to rank score when exploration triggers. */
export const EXPLORATION_NOISE_MAX = 0.1;

/** Cold-start seed boosts from onboarding (explicit preferences). */
export const EXPLICIT_PREF_STYLE_DELTA = 0.2;
export const EXPLICIT_PREF_COLOR_DELTA = 0.2;
export const EXPLICIT_AVOID_COLOR_DELTA = -0.3;

/** Saved-count milestones for one-time taste nudge toasts. */
export const TASTE_NUDGE_SAVE_THRESHOLDS = [5, 20, 50] as const;

/** Hide "why this outfit" chips until enough feedback exists. */
export const WHY_OUTFIT_MIN_ACTIONS = 5;
