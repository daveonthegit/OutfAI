import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUser } from "./auth";
import type { Doc, Id } from "./_generated/dataModel";
import type { PreferenceSignal } from "./personalization/signals";
import { applySignalsToLearnedWeights } from "./personalization/preferenceStore";
import { TASTE_NUDGE_SAVE_THRESHOLDS } from "./personalization/constants";

const signalDim = v.union(
  v.literal("color"),
  v.literal("style"),
  v.literal("tag"),
  v.literal("occasion"),
  v.literal("category")
);

const signalValidator = v.object({
  dim: signalDim,
  value: v.string(),
  delta: v.number(),
});

const OUTFIT_SAMPLE_CAP = 500;

export const get = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return null;

    const explicit = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    // Derive lightweight preferences from saved outfits (behavior).
    const outfits = await ctx.db
      .query("outfits")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(OUTFIT_SAMPLE_CAP);

    const garmentIdSet = new Set<Id<"garments">>();
    for (const outfit of outfits) {
      for (const gid of outfit.garmentIds) {
        garmentIdSet.add(gid);
      }
    }
    const garmentRows = await Promise.all(
      [...garmentIdSet].map((id) => ctx.db.get(id))
    );
    const garmentById = new Map(
      garmentRows.filter(Boolean).map((g) => [g!._id, g!])
    );

    const styleCounts = new Map<string, number>();
    const colorCounts = new Map<string, number>();
    const moodCounts = new Map<string, number>();

    const increment = (map: Map<string, number>, key: string, amount = 1) => {
      if (!key) return;
      const normalized = key.toLowerCase();
      map.set(normalized, (map.get(normalized) ?? 0) + amount);
    };

    for (const outfit of outfits) {
      if (outfit.contextMood) {
        increment(moodCounts, outfit.contextMood, 2);
      }

      for (const gid of outfit.garmentIds) {
        const garment = garmentById.get(gid);
        if (!garment) continue;

        if (garment.primaryColor) {
          increment(colorCounts, garment.primaryColor, 2);
        }

        if (Array.isArray(garment.style)) {
          for (const style of garment.style) {
            increment(styleCounts, style, 2);
          }
        }
      }
    }

    const topKeys = (map: Map<string, number>, limit: number): string[] =>
      Array.from(map.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([key]) => key);

    const learned = {
      favoriteMoods: topKeys(moodCounts, 3),
      preferredStyles: topKeys(styleCounts, 5),
      preferredColors: topKeys(colorCounts, 5),
    };

    return {
      explicit: explicit ?? null,
      learned,
      stats: explicit?.stats ?? null,
      learnedWeights: explicit?.learnedWeights ?? null,
    };
  },
});

export const save = mutation({
  args: {
    favoriteMoods: v.optional(v.array(v.string())),
    preferredStyles: v.optional(v.array(v.string())),
    preferredColors: v.optional(v.array(v.string())),
    avoidedColors: v.optional(v.array(v.string())),
    styleGoal: v.optional(v.string()),
    styleGoalTags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
      });
      return existing._id;
    }

    return ctx.db.insert("userPreferences", {
      userId: user._id,
      ...args,
    });
  },
});

export const updatePreferenceWeights = mutation({
  args: {
    signals: v.array(signalValidator),
  },
  handler: async (ctx, { signals }) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");
    await applySignalsToLearnedWeights(
      ctx,
      user._id,
      signals as PreferenceSignal[]
    );
  },
});

function topEntryFromMaps(
  learned: Doc<"userPreferences">["learnedWeights"] | undefined
): { dim: string; value: string; weight: number } | null {
  if (!learned) return null;
  let best: { dim: string; value: string; weight: number } | null = null;
  const dims: (keyof typeof learned)[] = [
    "color",
    "style",
    "tag",
    "occasion",
    "category",
  ];
  for (const dim of dims) {
    const rec = learned[dim];
    if (!rec) continue;
    for (const [value, weight] of Object.entries(rec)) {
      if (!best || Math.abs(weight) > Math.abs(best.weight)) {
        best = { dim, value, weight };
      }
    }
  }
  return best;
}

export const getTopLearnedAttribute = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return null;
    const row = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (!row?.learnedWeights) return null;
    return topEntryFromMaps(row.learnedWeights);
  },
});

export const acknowledgeTasteNudge = mutation({
  args: { threshold: v.number() },
  handler: async (ctx, { threshold }) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");
    const row = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    const prev = row?.stats?.tasteNudgesFired ?? [];
    if (prev.includes(threshold)) return;
    const next = [...prev, threshold].sort((a, b) => a - b);
    if (row) {
      await ctx.db.patch(row._id, {
        stats: { ...row.stats, tasteNudgesFired: next },
      });
    } else {
      await ctx.db.insert("userPreferences", {
        userId: user._id,
        stats: { tasteNudgesFired: next },
      });
    }
  },
});

export const pendingTasteNudges = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return [];
    const row = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    const saved = row?.stats?.savedCount ?? 0;
    const fired = new Set(row?.stats?.tasteNudgesFired ?? []);
    const top = topEntryFromMaps(row?.learnedWeights);
    const pending: { threshold: number; label: string }[] = [];
    for (const t of TASTE_NUDGE_SAVE_THRESHOLDS) {
      if (saved >= t && !fired.has(t) && top) {
        pending.push({
          threshold: t,
          label: `${top.dim} “${top.value}”`,
        });
      }
    }
    return pending;
  },
});
