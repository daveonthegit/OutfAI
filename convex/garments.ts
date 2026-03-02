import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUser } from "./auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return [];
    return ctx.db
      .query("garments")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    primaryColor: v.string(),
    tags: v.array(v.string()),
    style: v.optional(v.array(v.string())),
    fit: v.optional(v.string()),
    occasion: v.optional(v.array(v.string())),
    versatility: v.optional(v.string()),
    vibrancy: v.optional(v.string()),
    material: v.optional(v.string()),
    season: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");
    return ctx.db.insert("garments", {
      userId: user._id,
      ...args,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("garments"),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    style: v.optional(v.array(v.string())),
    fit: v.optional(v.string()),
    occasion: v.optional(v.array(v.string())),
    versatility: v.optional(v.string()),
    vibrancy: v.optional(v.string()),
    material: v.optional(v.string()),
    season: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");
    const garment = await ctx.db.get(id);
    if (!garment || garment.userId !== user._id) throw new Error("Not found");
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("garments") },
  handler: async (ctx, { id }) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");
    const garment = await ctx.db.get(id);
    if (!garment || garment.userId !== user._id) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
