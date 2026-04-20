/**
 * Account lifecycle: delete all user data (for account deletion) and data export.
 */

import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { getAuthUser } from "./auth";

/**
 * Remove all application data for a user. Safe to call when tables are already empty (idempotent).
 */
export async function purgeAllDataForUserId(
  ctx: MutationCtx,
  userId: string
): Promise<{ deleted: true }> {
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

  const outfitPreviews = await ctx.db
    .query("outfitPreviews")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  for (const doc of outfitPreviews) {
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
}

/**
 * Delete all data for the current user while the session is still valid.
 * Idempotent.
 */
export const deleteAllUserData = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");
    return await purgeAllDataForUserId(ctx, user._id);
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
