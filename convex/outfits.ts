import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUser } from "./auth";
import { assertGarmentsOwnedByUser } from "./garmentGuards";

/** Single saved outfit with resolved garments (for /outfit?saved=…). */
export const getWithGarments = query({
  args: { id: v.id("outfits") },
  handler: async (ctx, { id }) => {
    const user = await getAuthUser(ctx);
    if (!user) return null;
    const outfit = await ctx.db.get(id);
    if (!outfit || outfit.userId !== user._id) return null;
    const garments = await Promise.all(
      outfit.garmentIds.map((gid) => ctx.db.get(gid))
    );
    return {
      ...outfit,
      garments: garments.filter(Boolean),
    };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return [];
    const outfits = await ctx.db
      .query("outfits")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(400);

    // Display order: Top → Outerwear → Bottom → Shoes → Accessory
    const CATEGORY_ORDER = [
      "top",
      "outerwear",
      "bottom",
      "shoes",
      "accessory",
    ] as const;
    const categoryRank = (c: string) => {
      const i = CATEGORY_ORDER.indexOf(c as (typeof CATEGORY_ORDER)[number]);
      return i === -1 ? CATEGORY_ORDER.length : i;
    };

    // Resolve garment details for each outfit and sort by category order
    const outfitsWithGarments = await Promise.all(
      outfits.map(async (outfit) => {
        const garments = await Promise.all(
          outfit.garmentIds.map((id) => ctx.db.get(id))
        );
        const filtered = garments.filter(Boolean) as Array<{
          _id: (typeof outfit.garmentIds)[0];
          category: string;
          [key: string]: unknown;
        }>;
        filtered.sort(
          (a, b) => categoryRank(a.category) - categoryRank(b.category)
        );
        return {
          ...outfit,
          garments: filtered,
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
    await assertGarmentsOwnedByUser(ctx, user._id, args.garmentIds);
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
