/**
 * Packing lists (trip capsule): create trips with selected garments for outfit generation.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUser } from "./auth";
import { assertGarmentsOwnedByUser } from "./garmentGuards";

/**
 * List all packing lists for the current user (newest first).
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return [];

    const lists = await ctx.db
      .query("packingLists")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return lists;
  },
});

/**
 * Get a single packing list by ID with resolved garment details.
 */
export const get = query({
  args: { id: v.id("packingLists") },
  handler: async (ctx, { id }) => {
    const user = await getAuthUser(ctx);
    if (!user) return null;

    const list = await ctx.db.get(id);
    if (!list || list.userId !== user._id) return null;

    const garments = await Promise.all(
      list.garmentIds.map((gId) => ctx.db.get(gId))
    );
    return {
      ...list,
      garments: garments.filter(Boolean),
    };
  },
});

/**
 * Create a new packing list.
 */
export const create = mutation({
  args: {
    name: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    garmentIds: v.optional(v.array(v.id("garments"))),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const name = args.name.trim();
    if (!name) throw new Error("Trip name is required");
    if (args.startDate > args.endDate) {
      throw new Error("End date must be on or after start date");
    }

    const garmentIds = args.garmentIds ?? [];
    if (garmentIds.length > 0) {
      await assertGarmentsOwnedByUser(ctx, user._id, garmentIds);
    }
    const now = Date.now();
    return ctx.db.insert("packingLists", {
      userId: user._id,
      name,
      startDate: args.startDate,
      endDate: args.endDate,
      garmentIds,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update a packing list (name, dates, or garmentIds).
 */
export const update = mutation({
  args: {
    id: v.id("packingLists"),
    name: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    garmentIds: v.optional(v.array(v.id("garments"))),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const list = await ctx.db.get(args.id);
    if (!list || list.userId !== user._id) throw new Error("Not found");

    const updates: {
      name?: string;
      startDate?: number;
      endDate?: number;
      garmentIds?: typeof list.garmentIds;
      updatedAt: number;
    } = { updatedAt: Date.now() };

    if (args.name !== undefined) {
      const name = args.name.trim();
      if (!name) throw new Error("Trip name is required");
      updates.name = name;
    }
    if (args.startDate !== undefined) updates.startDate = args.startDate;
    if (args.endDate !== undefined) updates.endDate = args.endDate;
    if (args.garmentIds !== undefined) {
      await assertGarmentsOwnedByUser(ctx, user._id, args.garmentIds);
      updates.garmentIds = args.garmentIds;
    }

    if (updates.startDate !== undefined && updates.endDate !== undefined) {
      if (updates.startDate > updates.endDate) {
        throw new Error("End date must be on or after start date");
      }
    } else if (
      updates.startDate !== undefined &&
      updates.startDate > list.endDate
    ) {
      throw new Error("End date must be on or after start date");
    } else if (
      updates.endDate !== undefined &&
      list.startDate > updates.endDate
    ) {
      throw new Error("End date must be on or after start date");
    }

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

/**
 * Delete a packing list.
 */
export const remove = mutation({
  args: { id: v.id("packingLists") },
  handler: async (ctx, { id }) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const list = await ctx.db.get(id);
    if (!list || list.userId !== user._id) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
