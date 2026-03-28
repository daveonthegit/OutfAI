import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUser } from "./auth";
import type { Id } from "./_generated/dataModel";

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
