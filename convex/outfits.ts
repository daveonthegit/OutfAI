import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUser } from "./auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return [];
    const outfits = await ctx.db
      .query("outfits")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    // Resolve garment details for each outfit
    const outfitsWithGarments = await Promise.all(
      outfits.map(async (outfit) => {
        const garments = await Promise.all(
          outfit.garmentIds.map((id) => ctx.db.get(id))
        );
        return {
          ...outfit,
          garments: garments.filter(Boolean),
        };
      })
    );

    return outfitsWithGarments;
  },
});

export const save = mutation({
  args: {
    garmentIds: v.array(v.id("garments")),
    contextMood: v.optional(v.string()),
    contextWeather: v.optional(v.string()),
    contextTemperature: v.optional(v.number()),
    explanation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");
    return ctx.db.insert("outfits", {
      userId: user._id,
      savedAt: Date.now(),
      ...args,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("outfits") },
  handler: async (ctx, { id }) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");
    const outfit = await ctx.db.get(id);
    if (!outfit || outfit.userId !== user._id) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
