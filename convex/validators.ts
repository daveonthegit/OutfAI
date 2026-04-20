import { v } from "convex/values";

/** Matches shared `ScoreBreakdown` — recommendation explainability scores. */
export const scoreBreakdownValidator = v.object({
  base: v.number(),
  colorHarmony: v.number(),
  moodAlignment: v.number(),
  styleCoherence: v.number(),
  occasionMatching: v.number(),
  versatility: v.number(),
  fit: v.number(),
  vibrancy: v.number(),
  diversity: v.number(),
  preferences: v.number(),
  repetitionPenalty: v.number(),
});

/**
 * Provider-specific blobs (e.g. affiliate rank, feed version).
 * Flat string-keyed maps with JSON-serializable leaf values only.
 */
export const externalProductMetadataValidator = v.optional(
  v.record(v.string(), v.union(v.string(), v.number(), v.boolean(), v.null()))
);

/** Learned attribute weights per dimension (−1..+1), keyed by normalized value. */
export const learnedWeightsValidator = v.object({
  color: v.optional(v.record(v.string(), v.number())),
  style: v.optional(v.record(v.string(), v.number())),
  tag: v.optional(v.record(v.string(), v.number())),
  occasion: v.optional(v.record(v.string(), v.number())),
  category: v.optional(v.record(v.string(), v.number())),
});

/** Usage and retention counters for personalization; all keys optional for partial rows. */
export const userPreferenceStatsValidator = v.object({
  totalActions: v.optional(v.number()),
  savedCount: v.optional(v.number()),
  skippedCount: v.optional(v.number()),
  wornCount: v.optional(v.number()),
  lastUpdated: v.optional(v.number()),
  streakDays: v.optional(v.number()),
  lastActionDate: v.optional(v.string()),
  /** Milestone thresholds (e.g. 5, 20, 50) for which a taste nudge toast was already shown. */
  tasteNudgesFired: v.optional(v.array(v.number())),
});
