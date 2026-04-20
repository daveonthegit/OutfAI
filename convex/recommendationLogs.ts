import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUser } from "./auth";
import { onActionLogged } from "./personalization/hooks";

const actionValidator = v.union(
  v.literal("shown"),
  v.literal("saved"),
  v.literal("skipped"),
  v.literal("worn")
);

export const logOutfitAction = mutation({
  args: {
    outfitId: v.optional(v.id("outfits")),
    outfitPreviewId: v.optional(v.id("outfitPreviews")),
    garmentIds: v.array(v.string()),
    action: actionValidator,
    mood: v.optional(v.string()),
    weather: v.optional(v.string()),
    pickMode: v.optional(v.union(v.literal("exploit"), v.literal("explore"))),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const logId = await ctx.db.insert("recommendationLogs", {
      userId: user._id,
      outfitId: args.outfitId,
      outfitPreviewId: args.outfitPreviewId,
      garmentIds: args.garmentIds,
      action: args.action,
      mood: args.mood,
      weather: args.weather,
      pickMode: args.pickMode,
      loggedAt: Date.now(),
    });

    const log = await ctx.db.get(logId);
    if (log) {
      await onActionLogged(ctx, user._id, log);
    }

    return { logId };
  },
});

/**
 * @deprecated Prefer `logOutfitAction` (typed action + optional pickMode / preview id).
 */
export const log = mutation({
  args: {
    outfitId: v.optional(v.id("outfits")),
    garmentIds: v.array(v.string()),
    action: v.string(),
    mood: v.optional(v.string()),
    weather: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const logId = await ctx.db.insert("recommendationLogs", {
      userId: user._id,
      loggedAt: Date.now(),
      outfitId: args.outfitId,
      garmentIds: args.garmentIds,
      action: args.action,
      mood: args.mood,
      weather: args.weather,
    });

    const log = await ctx.db.get(logId);
    if (log) {
      await onActionLogged(ctx, user._id, log);
    }

    return logId;
  },
});
