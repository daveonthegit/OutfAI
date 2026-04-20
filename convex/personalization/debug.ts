import { query } from "../_generated/server";
import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { getAuthUser } from "../auth";
import { scoreOutfitPersonalized, type RecommendationContext } from "./scoring";

/**
 * Dev-only: full score breakdown for tuning. Set `ENABLE_PERSONALIZATION_DEBUG=true` in Convex env.
 */
export const debugScoreOutfit = query({
  args: {
    garmentIds: v.array(v.id("garments")),
    mood: v.optional(v.string()),
    weather: v.optional(v.string()),
    temperature: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (process.env.ENABLE_PERSONALIZATION_DEBUG !== "true") {
      return null;
    }
    const user = await getAuthUser(ctx);
    if (!user) return null;

    const garments: Doc<"garments">[] = [];
    for (const id of args.garmentIds) {
      const g = await ctx.db.get(id);
      if (!g || g.userId !== user._id) continue;
      garments.push(g);
    }
    if (garments.length === 0) return { error: "No valid garments" as const };

    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    const totalActions = prefs?.stats?.totalActions ?? 0;
    const context: RecommendationContext = {
      mood: args.mood,
      weather: args.weather,
      temperature: args.temperature,
    };

    const explicitPrefs = prefs
      ? {
          preferredStyles: prefs.preferredStyles,
          preferredColors: prefs.preferredColors,
          avoidedColors: prefs.avoidedColors,
        }
      : undefined;

    const result = scoreOutfitPersonalized(
      garments,
      context,
      prefs?.learnedWeights,
      explicitPrefs,
      totalActions
    );

    return { garments: args.garmentIds, result };
  },
});
