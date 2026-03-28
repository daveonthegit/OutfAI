/**
 * Account lifecycle: delete all user data (for account deletion) and data export.
 */

import { mutation, query } from "./_generated/server";
import { getAuthUser } from "./auth";

/**
 * Delete all data for the current user. Call after user confirms account deletion.
 * Order: commerceInteractionLogs → recommendationLogs → outfits → garments → userPreferences → profiles.
 * Auth/session is managed by BetterAuth; client should sign out after this.
 */
export const deleteAllUserData = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const userId = user._id;

    const commerceLogs = await ctx.db
      .query("commerceInteractionLogs")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const doc of commerceLogs) {
      await ctx.db.delete(doc._id);
    }

    const recLogs = await ctx.db
      .query("recommendationLogs")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const doc of recLogs) {
      await ctx.db.delete(doc._id);
    }

    const outfitPlans = await ctx.db
      .query("outfitPlans")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const doc of outfitPlans) {
      await ctx.db.delete(doc._id);
    }

    const userOutfits = await ctx.db
      .query("outfits")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const doc of userOutfits) {
      await ctx.db.delete(doc._id);
    }

    const packingLists = await ctx.db
      .query("packingLists")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const doc of packingLists) {
      await ctx.db.delete(doc._id);
    }

    const userGarments = await ctx.db
      .query("garments")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const doc of userGarments) {
      if (doc.imageStorageId) {
        await ctx.storage.delete(doc.imageStorageId);
      }
      await ctx.db.delete(doc._id);
    }

    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (prefs) await ctx.db.delete(prefs._id);

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (profile) {
      if (profile.avatarStorageId) {
        await ctx.storage.delete(profile.avatarStorageId);
      }
      await ctx.db.delete(profile._id);
    }

    return { deleted: true };
  },
});

/**
 * Return all exportable data for the current user (GDPR-style data export).
 * Client should trigger a JSON download.
 */
export const getExportData = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return null;

    const userId = user._id;

    const garments = await ctx.db
      .query("garments")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const outfits = await ctx.db
      .query("outfits")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const recommendationLogs = await ctx.db
      .query("recommendationLogs")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    const userPreferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    const outfitPlans = await ctx.db
      .query("outfitPlans")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const packingLists = await ctx.db
      .query("packingLists")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    return {
      exportedAt: new Date().toISOString(),
      userId,
      garments,
      outfits,
      recommendationLogs,
      profile: profile ?? null,
      userPreferences: userPreferences ?? null,
      outfitPlans,
      packingLists,
    };
  },
});
