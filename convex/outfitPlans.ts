/**
 * Outfit calendar: assign saved outfits to specific dates (YYYY-MM-DD).
 */

import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { getAuthUser } from "./auth";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateStr(s: string): boolean {
  if (!DATE_REGEX.test(s)) return false;
  const d = new Date(s);
  return !isNaN(d.getTime());
}

/**
 * List outfit plans for the current user in a date range (inclusive).
 * startDate and endDate are YYYY-MM-DD strings.
 */
export const listByDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, { startDate, endDate }) => {
    const user = await getAuthUser(ctx);
    if (!user) return [];

    if (!isValidDateStr(startDate) || !isValidDateStr(endDate)) {
      return [];
    }
    if (startDate > endDate) return [];

    const plans = await ctx.db
      .query("outfitPlans")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const filtered = plans.filter(
      (p) => p.date >= startDate && p.date <= endDate
    );

    const outfitIds = [...new Set(filtered.map((p) => p.outfitId))];
    const outfitRows = await Promise.all(outfitIds.map((id) => ctx.db.get(id)));
    const outfitById = new Map(
      outfitRows.filter(Boolean).map((o) => [o!._id, o!])
    );

    const garmentIdSet = new Set<Id<"garments">>();
    for (const oid of outfitIds) {
      const o = outfitById.get(oid);
      if (o && o.userId === user._id) {
        for (const gid of o.garmentIds) {
          garmentIdSet.add(gid);
        }
      }
    }
    const garmentRows = await Promise.all(
      [...garmentIdSet].map((id) => ctx.db.get(id))
    );
    const garmentById = new Map(
      garmentRows.filter(Boolean).map((g) => [g!._id, g!])
    );

    const withOutfits = filtered.map((plan) => {
      const outfit = outfitById.get(plan.outfitId);
      if (!outfit || outfit.userId !== user._id) {
        return { ...plan, outfit: null, garments: [] };
      }
      const resolved = outfit.garmentIds
        .map((id) => garmentById.get(id))
        .filter(Boolean);
      return {
        ...plan,
        outfit: { ...outfit, garments: resolved },
      };
    });

    return withOutfits;
  },
});

/**
 * Get the single plan for a given date (if any).
 */
export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const user = await getAuthUser(ctx);
    if (!user) return null;
    if (!isValidDateStr(date)) return null;

    const plan = await ctx.db
      .query("outfitPlans")
      .withIndex("by_userId_date", (q) =>
        q.eq("userId", user._id).eq("date", date)
      )
      .unique();

    if (!plan) return null;

    const outfit = await ctx.db.get(plan.outfitId);
    if (!outfit || outfit.userId !== user._id) return { ...plan, outfit: null };
    const garments = await Promise.all(
      outfit.garmentIds.map((id) => ctx.db.get(id))
    );
    return {
      ...plan,
      outfit: { ...outfit, garments: garments.filter(Boolean) },
    };
  },
});

/**
 * Assign an outfit to a date. Replaces any existing plan for that date.
 */
export const assign = mutation({
  args: {
    date: v.string(),
    outfitId: v.id("outfits"),
  },
  handler: async (ctx, { date, outfitId }) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");
    if (!isValidDateStr(date))
      throw new Error("Invalid date format (use YYYY-MM-DD)");

    const outfit = await ctx.db.get(outfitId);
    if (!outfit || outfit.userId !== user._id) {
      throw new Error("Outfit not found");
    }

    const existing = await ctx.db
      .query("outfitPlans")
      .withIndex("by_userId_date", (q) =>
        q.eq("userId", user._id).eq("date", date)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { outfitId });
      return existing._id;
    }

    return ctx.db.insert("outfitPlans", {
      userId: user._id,
      date,
      outfitId,
    });
  },
});

/**
 * Remove the outfit plan for a date.
 */
export const remove = mutation({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const plan = await ctx.db
      .query("outfitPlans")
      .withIndex("by_userId_date", (q) =>
        q.eq("userId", user._id).eq("date", date)
      )
      .unique();

    if (plan) await ctx.db.delete(plan._id);
  },
});
