import type { GenericQueryCtx } from "convex/server";
import { query } from "./_generated/server";
import { v } from "convex/values";
import type { DataModel, Doc, Id } from "./_generated/dataModel";
import { getAuthUser } from "./auth";

import { generateCandidates } from "./recommendations/candidates";
import {
  scoreOutfitPersonalized,
  type RecommendationContext,
} from "./personalization/scoring";
import {
  EPSILON_ACTION_THRESHOLD,
  EPSILON_HIGH,
  EPSILON_LOW,
  EXPLORATION_NOISE_MAX,
} from "./personalization/constants";

type AppQueryCtx = GenericQueryCtx<DataModel>;

const RANK_LIMIT_MAX = 30;

async function listGarmentsWithUrls(
  ctx: AppQueryCtx,
  userId: string
): Promise<Doc<"garments">[]> {
  const rows = await ctx.db
    .query("garments")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  return Promise.all(
    rows.map(async (g) => {
      if (g.imageStorageId) {
        const url = (await ctx.storage.getUrl(g.imageStorageId)) ?? g.imageUrl;
        return { ...g, imageUrl: url ?? g.imageUrl };
      }
      return g;
    })
  );
}

/** Maps personalized scorer output to legacy UI breakdown bars (0..max scale). */
function toUiScoreBreakdown(p: ReturnType<typeof scoreOutfitPersonalized>) {
  const b = p.breakdown;
  const pref = Math.max(0, Math.min(15, (p.combinedPersonal + 0.5) * 15));
  return {
    base: p.baseScore * 50,
    colorHarmony: b.colorHarmony * 20,
    moodAlignment: b.occasionFit * 20,
    styleCoherence: Math.max(0, b.colorHarmony * 10),
    occasionMatching: b.occasionFit * 12,
    versatility: b.versatility * 8,
    fit: 6,
    vibrancy: b.colorHarmony * 8,
    diversity: 6,
    preferences: pref,
    repetitionPenalty: 0,
  };
}

function buildExplanation(
  mood: string | undefined,
  p: ReturnType<typeof scoreOutfitPersonalized>
): string {
  if (p.topContributors.length === 0) {
    return mood
      ? `Balanced look for a ${mood} day.`
      : "Balanced look for today.";
  }
  const bits = p.topContributors.map((t) => `${t.dim}: ${t.value}`);
  return `${bits.join(" · ")} — tuned from your feedback.`;
}

export const getRankedRecommendations = query({
  args: {
    mood: v.optional(v.string()),
    weather: v.optional(v.string()),
    temperature: v.optional(v.number()),
    occasion: v.optional(v.string()),
    limit: v.optional(v.number()),
    /** When set, only these garment IDs (must belong to the user) are used for candidates. */
    garmentIds: v.optional(v.array(v.string())),
    /** Client-supplied cache-buster so repeated "Generate" with same args can refresh exploration noise. */
    nonce: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    void args.nonce;
    const user = await getAuthUser(ctx);
    if (!user) {
      return {
        outfits: [] as const,
        pickModes: [] as const,
        totalActions: 0,
        streakDays: 0,
        candidateCount: 0,
      };
    }

    let garments = await listGarmentsWithUrls(ctx, user._id);
    if (args.garmentIds && args.garmentIds.length > 0) {
      const allow = new Set(args.garmentIds.map(String));
      garments = garments.filter((g) => allow.has(g._id as string));
    }
    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    const totalActions = prefs?.stats?.totalActions ?? 0;
    const epsilon =
      totalActions > EPSILON_ACTION_THRESHOLD ? EPSILON_LOW : EPSILON_HIGH;

    const context: RecommendationContext = {
      mood: args.mood,
      weather: args.weather,
      temperature: args.temperature,
    };

    const candidates = generateCandidates(garments, context);
    const limit = Math.min(Math.max(args.limit ?? 8, 1), RANK_LIMIT_MAX);

    if (candidates.length === 0) {
      return {
        outfits: [],
        pickModes: [],
        totalActions,
        streakDays: prefs?.stats?.streakDays ?? 0,
        candidateCount: 0,
      };
    }

    const explicitPrefs = prefs
      ? {
          preferredStyles: prefs.preferredStyles,
          preferredColors: prefs.preferredColors,
          avoidedColors: prefs.avoidedColors,
        }
      : undefined;

    type Scored = {
      garmentIds: Id<"garments">[];
      rankScore: number;
      pickMode: "exploit" | "explore";
      score: ReturnType<typeof scoreOutfitPersonalized>;
      exploreNoise: number;
    };

    const scored: Scored[] = candidates.map((c) => {
      const explore = Math.random() < epsilon;
      const exploreNoise = explore ? Math.random() * EXPLORATION_NOISE_MAX : 0;
      const s = scoreOutfitPersonalized(
        c.garments,
        context,
        prefs?.learnedWeights,
        explicitPrefs,
        totalActions
      );
      const rankScore = s.finalScore + exploreNoise;
      return {
        garmentIds: c.garmentIds,
        rankScore,
        pickMode: explore ? ("explore" as const) : ("exploit" as const),
        score: s,
        exploreNoise,
      };
    });

    scored.sort((a, b) => b.rankScore - a.rankScore);
    const top = scored.slice(0, limit);

    const outfits = top.map((row) => {
      const p = row.score;
      return {
        garmentIds: row.garmentIds.map((id) => id as string),
        explanation: buildExplanation(args.mood, p),
        score: row.rankScore,
        baseScore: p.baseScore,
        personalScore: p.combinedPersonal,
        scoreBreakdown: toUiScoreBreakdown(p),
        topContributors: p.topContributors,
        pickMode: row.pickMode,
      };
    });

    return {
      outfits,
      pickModes: top.map((t) => t.pickMode),
      totalActions,
      streakDays: prefs?.stats?.streakDays ?? 0,
      candidateCount: candidates.length,
    };
  },
});
