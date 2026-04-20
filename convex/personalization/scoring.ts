import type { Doc } from "../_generated/dataModel";
import {
  COLD_START_ACTION_TARGET,
  EXPLICIT_AVOID_COLOR_DELTA,
  EXPLICIT_PREF_COLOR_DELTA,
  EXPLICIT_PREF_STYLE_DELTA,
  PERSONAL_SCORE_CLAMP,
  WEIGHT_CLAMP_MAX,
  WEIGHT_CLAMP_MIN,
} from "./constants";

export type RecommendationContext = {
  mood?: string;
  weather?: string;
  temperature?: number;
};

export type LearnedWeights = NonNullable<
  Doc<"userPreferences">["learnedWeights"]
>;

export type ExplicitPrefs = Pick<
  Doc<"userPreferences">,
  "preferredStyles" | "preferredColors" | "avoidedColors"
>;

export type ScoreContributor = {
  dim: string;
  value: string;
  contribution: number;
};

export type PersonalizedScoreResult = {
  baseScore: number;
  personalScore: number;
  /** Combined term that feeds rank: clamp(α·learned + (1−α)·explicit, ±0.5). */
  combinedPersonal: number;
  finalScore: number;
  topContributors: ScoreContributor[];
  /** Maps to UI ScoreBreakdown (legacy bar chart). */
  breakdown: {
    colorHarmony: number;
    occasionFit: number;
    weatherFit: number;
    versatility: number;
    completeness: number;
  };
};

function attrsInDim(
  g: Doc<"garments">,
  dim: "color" | "style" | "tag" | "occasion" | "category"
): number {
  switch (dim) {
    case "color":
    case "category":
      return 1;
    case "style":
      return Math.max(1, g.style?.length ?? 0);
    case "tag":
      return Math.max(1, g.tags?.length ?? 0);
    case "occasion":
      return Math.max(1, g.occasion?.length ?? 0);
    default:
      return 1;
  }
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export function colorHarmony(garments: Doc<"garments">[]): number {
  const colors = garments
    .map((g) => g.primaryColor?.trim().toLowerCase())
    .filter(Boolean);
  if (colors.length === 0) return 0.55;
  const unique = new Set(colors);
  if (unique.size === 1) return 1;
  if (unique.size === 2) return 0.85;
  if (unique.size === 3) return 0.72;
  return 0.58;
}

export function occasionFit(
  garments: Doc<"garments">[],
  mood?: string
): number {
  if (!mood?.trim()) return 0.68;
  const m = mood.trim().toLowerCase();
  let hits = 0;
  let total = 0;
  for (const g of garments) {
    for (const occ of g.occasion ?? []) {
      total++;
      const o = occ.toLowerCase();
      if (o.includes(m) || m.includes(o)) hits++;
    }
    for (const st of g.style ?? []) {
      total++;
      const s = st.toLowerCase();
      if (s.includes(m) || m.includes(s)) hits++;
    }
  }
  if (total === 0) return 0.62;
  return hits / total;
}

export function weatherFit(
  garments: Doc<"garments">[],
  weather?: string,
  temp?: number
): number {
  let score = 0.72;
  const rainy = weather === "rainy";
  const cold = temp != null && temp < 10;
  const hot = temp != null && temp > 26;

  if (rainy) {
    const hasOuter = garments.some((g) => g.category === "outerwear");
    if (hasOuter) score += 0.12;
  }
  if (cold) {
    const warmish = garments.some(
      (g) =>
        g.category === "outerwear" ||
        g.season === "winter" ||
        g.season === "fall"
    );
    score += warmish ? 0.18 : -0.08;
  }
  if (hot) {
    const heavyOuter = garments.filter(
      (g) => g.category === "outerwear"
    ).length;
    if (heavyOuter > 0) score -= 0.12;
  }
  return clamp(score, 0, 1);
}

export function versatilityAvg(garments: Doc<"garments">[]): number {
  if (garments.length === 0) return 0.55;
  let sum = 0;
  for (const g of garments) {
    const v = g.versatility;
    sum += v === "high" ? 1 : v === "medium" ? 0.65 : v === "low" ? 0.35 : 0.58;
  }
  return sum / garments.length;
}

export function completeness(garments: Doc<"garments">[]): number {
  const cats = new Set(garments.map((g) => g.category));
  const need: Array<Doc<"garments">["category"]> = ["top", "bottom", "shoes"];
  const present = need.filter((c) => cats.has(c)).length;
  return present / 3;
}

function weightLookup(
  learned: LearnedWeights | undefined,
  dim: keyof LearnedWeights,
  value: string
): number {
  const map = learned?.[dim];
  if (!map) return 0;
  return map[value] ?? 0;
}

function accumulateLearned(
  garments: Doc<"garments">[],
  learned: LearnedWeights | undefined,
  contributors: Map<string, ScoreContributor>
): number {
  let sum = 0;
  for (const g of garments) {
    const col = g.primaryColor?.trim().toLowerCase();
    if (col) {
      const n = attrsInDim(g, "color");
      const w = weightLookup(learned, "color", col) / n;
      sum += w;
      addContrib(contributors, "color", col, w);
    }
    const cat = g.category?.trim().toLowerCase();
    if (cat) {
      const n = attrsInDim(g, "category");
      const w = weightLookup(learned, "category", cat) / n;
      sum += w;
      addContrib(contributors, "category", cat, w);
    }
    for (const s of g.style ?? []) {
      const v = s.trim().toLowerCase();
      if (!v) continue;
      const n = attrsInDim(g, "style");
      const w = weightLookup(learned, "style", v) / n;
      sum += w;
      addContrib(contributors, "style", v, w);
    }
    for (const t of g.tags ?? []) {
      const v = t.trim().toLowerCase();
      if (!v) continue;
      const n = attrsInDim(g, "tag");
      const w = weightLookup(learned, "tag", v) / n;
      sum += w;
      addContrib(contributors, "tag", v, w);
    }
    for (const o of g.occasion ?? []) {
      const v = o.trim().toLowerCase();
      if (!v) continue;
      const n = attrsInDim(g, "occasion");
      const w = weightLookup(learned, "occasion", v) / n;
      sum += w;
      addContrib(contributors, "occasion", v, w);
    }
  }
  return sum;
}

function addContrib(
  contributors: Map<string, ScoreContributor>,
  dim: string,
  value: string,
  delta: number
): void {
  const key = `${dim}:${value}`;
  const prev = contributors.get(key);
  if (prev) {
    contributors.set(key, {
      ...prev,
      contribution: prev.contribution + delta,
    });
  } else {
    contributors.set(key, { dim, value, contribution: delta });
  }
}

function accumulateExplicit(
  garments: Doc<"garments">[],
  explicit: ExplicitPrefs | undefined,
  contributors: Map<string, ScoreContributor>
): number {
  if (!explicit) return 0;
  const prefColors = new Set(
    (explicit.preferredColors ?? []).map((c) => c.trim().toLowerCase())
  );
  const avoidColors = new Set(
    (explicit.avoidedColors ?? []).map((c) => c.trim().toLowerCase())
  );
  const prefStyles = new Set(
    (explicit.preferredStyles ?? []).map((c) => c.trim().toLowerCase())
  );

  let sum = 0;
  for (const g of garments) {
    const col = g.primaryColor?.trim().toLowerCase();
    if (col) {
      if (prefColors.has(col)) {
        const w = EXPLICIT_PREF_COLOR_DELTA;
        sum += w;
        addContrib(contributors, "color", col, w);
      }
      if (avoidColors.has(col)) {
        const w = EXPLICIT_AVOID_COLOR_DELTA;
        sum += w;
        addContrib(contributors, "color", col, w);
      }
    }
    for (const s of g.style ?? []) {
      const v = s.trim().toLowerCase();
      if (v && prefStyles.has(v)) {
        const n = attrsInDim(g, "style");
        const w = EXPLICIT_PREF_STYLE_DELTA / n;
        sum += w;
        addContrib(contributors, "style", v, w);
      }
    }
  }
  return sum;
}

function topContributorsFromMap(
  contributors: Map<string, ScoreContributor>,
  limit: number
): ScoreContributor[] {
  return [...contributors.values()]
    .sort(
      (a, b) =>
        Math.abs(b.contribution) - Math.abs(a.contribution) ||
        b.contribution - a.contribution
    )
    .slice(0, limit);
}

/**
 * Pure personalized scoring for one outfit (resolved garments).
 */
export function scoreOutfitPersonalized(
  garments: Doc<"garments">[],
  context: RecommendationContext,
  learnedWeights: LearnedWeights | undefined,
  explicitPrefs: ExplicitPrefs | undefined,
  totalActions: number
): PersonalizedScoreResult {
  const ch = colorHarmony(garments);
  const of = occasionFit(garments, context.mood);
  const wf = weatherFit(garments, context.weather, context.temperature);
  const va = versatilityAvg(garments);
  const comp = completeness(garments);

  const baseScore = 0.3 * ch + 0.25 * of + 0.2 * wf + 0.15 * va + 0.1 * comp;

  const alpha = Math.min(totalActions / COLD_START_ACTION_TARGET, 1);

  const learnedContrib = new Map<string, ScoreContributor>();
  const explicitContrib = new Map<string, ScoreContributor>();

  const learnedPersonal = accumulateLearned(
    garments,
    learnedWeights,
    learnedContrib
  );
  const explicitPersonal = accumulateExplicit(
    garments,
    explicitPrefs,
    explicitContrib
  );

  const learnedClamped = clamp(
    learnedPersonal,
    -PERSONAL_SCORE_CLAMP,
    PERSONAL_SCORE_CLAMP
  );
  const explicitClamped = clamp(
    explicitPersonal,
    -PERSONAL_SCORE_CLAMP,
    PERSONAL_SCORE_CLAMP
  );

  const combinedPersonal = clamp(
    alpha * learnedClamped + (1 - alpha) * explicitClamped,
    -PERSONAL_SCORE_CLAMP,
    PERSONAL_SCORE_CLAMP
  );

  const merged = new Map<string, ScoreContributor>();
  const keys = new Set([...learnedContrib.keys(), ...explicitContrib.keys()]);
  for (const key of keys) {
    const l = learnedContrib.get(key)?.contribution ?? 0;
    const e = explicitContrib.get(key)?.contribution ?? 0;
    const c = alpha * l + (1 - alpha) * e;
    if (Math.abs(c) < 1e-9) continue;
    const parts = key.split(":");
    const dim = parts[0] ?? "";
    const value = parts.slice(1).join(":");
    merged.set(key, { dim, value, contribution: c });
  }

  const topContributors = topContributorsFromMap(merged, 2);

  const finalScore = baseScore + combinedPersonal;

  return {
    baseScore,
    personalScore: learnedClamped,
    combinedPersonal,
    finalScore,
    topContributors,
    breakdown: {
      colorHarmony: ch,
      occasionFit: of,
      weatherFit: wf,
      versatility: va,
      completeness: comp,
    },
  };
}

/** Clamp a single preference weight after an update. */
export function clampWeight(w: number): number {
  return clamp(w, WEIGHT_CLAMP_MIN, WEIGHT_CLAMP_MAX);
}
