import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUser } from "./auth";
import { assertGarmentsOwnedByUser } from "./garmentGuards";

export const create = mutation({
  args: {
    label: v.string(),
    garmentIds: v.array(v.id("garments")),
    explanation: v.optional(v.string()),
    scoreBreakdown: v.optional(v.any()),
    contextMood: v.optional(v.string()),
    contextWeather: v.optional(v.string()),
    contextTemperature: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");
    if (args.garmentIds.length === 0) {
      throw new Error("At least one garment is required");
    }
    await assertGarmentsOwnedByUser(ctx, user._id, args.garmentIds);
    return ctx.db.insert("outfitPreviews", {
      userId: user._id,
      label: args.label,
      garmentIds: args.garmentIds,
      explanation: args.explanation,
      scoreBreakdown: args.scoreBreakdown,
      contextMood: args.contextMood,
      contextWeather: args.contextWeather,
      contextTemperature: args.contextTemperature,
      createdAt: Date.now(),
    });
  },
});

export const get = query({
  args: { id: v.id("outfitPreviews") },
  handler: async (ctx, { id }) => {
    const user = await getAuthUser(ctx);
    if (!user) return null;
    const preview = await ctx.db.get(id);
    if (!preview || preview.userId !== user._id) return null;

    const garments = await Promise.all(
      preview.garmentIds.map((gid) => ctx.db.get(gid))
    );
    const resolved = garments.filter(Boolean);
    return {
      ...preview,
      garments: resolved,
    };
  },
});
