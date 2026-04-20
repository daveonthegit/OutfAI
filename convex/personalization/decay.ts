import type { Doc } from "../_generated/dataModel";
import { PRUNE_THRESHOLD } from "./constants";

type Learned = NonNullable<Doc<"userPreferences">["learnedWeights"]>;

function decayRecord(
  rec: Record<string, number> | undefined,
  factor: number,
  threshold: number
): Record<string, number> | undefined {
  if (!rec || Object.keys(rec).length === 0) return undefined;
  const next: Record<string, number> = {};
  for (const [k, v] of Object.entries(rec)) {
    const nv = v * factor;
    if (Math.abs(nv) >= threshold) {
      next[k] = nv;
    }
  }
  return Object.keys(next).length ? next : undefined;
}

/**
 * Multiply all learned weights by `factor`, drop entries below `threshold`.
 * Does not mutate the input object.
 */
export function applyDecay(
  learnedWeights: Learned | undefined,
  decayFactor: number,
  pruneThreshold: number = PRUNE_THRESHOLD
): Learned | undefined {
  if (!learnedWeights) return undefined;

  const color = decayRecord(learnedWeights.color, decayFactor, pruneThreshold);
  const style = decayRecord(learnedWeights.style, decayFactor, pruneThreshold);
  const tag = decayRecord(learnedWeights.tag, decayFactor, pruneThreshold);
  const occasion = decayRecord(
    learnedWeights.occasion,
    decayFactor,
    pruneThreshold
  );
  const category = decayRecord(
    learnedWeights.category,
    decayFactor,
    pruneThreshold
  );

  if (!color && !style && !tag && !occasion && !category) {
    return undefined;
  }

  return { color, style, tag, occasion, category };
}
