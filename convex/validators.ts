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
