import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUser } from "./auth";

const BIO_MAX_LENGTH = 500;

/**
 * Get the current user's profile. Does not create; returns null if missing.
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    return profile;
  },
});

/**
 * Get current user's profile with avatar URL resolved (for display). Returns null if no profile.
 */
export const getWithAvatarUrl = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!profile) return null;

    const avatarUrl = profile.avatarStorageId
      ? await ctx.storage.getUrl(profile.avatarStorageId)
      : null;

    return {
      ...profile,
      avatarUrl,
    };
  },
});

/**
 * Get profile by userId. For internal use; returns null if not found (no auto-creation).
 */
export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

/**
 * Ensure profile exists for the current user; create with defaults if missing.
 * Returns the profile (existing or newly created).
 */
export const getOrCreate = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (existing) return existing._id;

    const now = Date.now();
    return ctx.db.insert("profiles", {
      userId: user._id,
      updatedAt: now,
    });
  },
});

/**
 * Update the current user's profile (bio only). Identity fields (name, username) are updated via Better Auth client.
 */
export const update = mutation({
  args: {
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    if (args.bio !== undefined) {
      if (args.bio.length > BIO_MAX_LENGTH) {
        throw new Error(`Bio must be at most ${BIO_MAX_LENGTH} characters`);
      }
    }

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    const now = Date.now();
    const patch: { bio?: string; updatedAt: number } = { updatedAt: now };
    if (args.bio !== undefined)
      patch.bio = args.bio === "" ? undefined : args.bio;

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    return ctx.db.insert("profiles", {
      userId: user._id,
      ...patch,
      bio: patch.bio,
    });
  },
});

/**
 * Generate an upload URL for avatar. Client uploads file to this URL, then calls setAvatar with the returned storage ID.
 */
export const generateAvatarUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Set avatar from an uploaded storage ID. Deletes previous avatar blob if any. Returns the public URL for the new avatar.
 * Client should then call authClient.updateUser({ image: url }) so Better Auth user has the image.
 */
export const setAvatar = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const url = await ctx.storage.getUrl(storageId);
    if (!url) throw new Error("Invalid or expired upload");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    const now = Date.now();
    const previousStorageId = existing?.avatarStorageId;

    if (existing) {
      await ctx.db.patch(existing._id, {
        avatarStorageId: storageId,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("profiles", {
        userId: user._id,
        avatarStorageId: storageId,
        updatedAt: now,
      });
    }

    if (previousStorageId) {
      await ctx.storage.delete(previousStorageId);
    }

    return url;
  },
});

/**
 * Remove the current user's avatar. Deletes the storage blob and clears avatarStorageId.
 * Client should call authClient.updateUser({ image: null }) or equivalent to clear Better Auth user image.
 */
export const removeAvatar = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!existing?.avatarStorageId) return;

    await ctx.storage.delete(existing.avatarStorageId);
    await ctx.db.patch(existing._id, {
      avatarStorageId: undefined,
      updatedAt: Date.now(),
    });
  },
});
