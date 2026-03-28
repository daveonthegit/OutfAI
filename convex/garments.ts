import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { v } from "convex/values";

const garmentCategory = v.union(
  v.literal("top"),
  v.literal("bottom"),
  v.literal("shoes"),
  v.literal("outerwear"),
  v.literal("accessory")
);
import { getAuthUser } from "./auth";
import { getDefaultTagsForGarment } from "../shared/garment-default-tags";
import { assertStorageIsImage } from "./storageImage";

async function withResolvedImageUrl(
  ctx: QueryCtx,
  garment: Doc<"garments">
): Promise<Doc<"garments">> {
  if (garment.imageStorageId) {
    const url =
      (await ctx.storage.getUrl(garment.imageStorageId)) ?? garment.imageUrl;
    return { ...garment, imageUrl: url ?? garment.imageUrl };
  }
  return garment;
}

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");
    return await ctx.storage.generateUploadUrl();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return [];
    const rows = await ctx.db
      .query("garments")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    return Promise.all(rows.map((g) => withResolvedImageUrl(ctx, g)));
  },
});

export const getById = query({
  args: { id: v.id("garments") },
  handler: async (ctx, { id }) => {
    const user = await getAuthUser(ctx);
    if (!user) return null;
    const garment = await ctx.db.get(id);
    if (!garment || garment.userId !== user._id) return null;
    return withResolvedImageUrl(ctx, garment);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    category: garmentCategory,
    primaryColor: v.string(),
    tags: v.optional(v.array(v.string())),
    style: v.optional(v.array(v.string())),
    fit: v.optional(v.string()),
    occasion: v.optional(v.array(v.string())),
    versatility: v.optional(v.string()),
    vibrancy: v.optional(v.string()),
    material: v.optional(v.string()),
    season: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    /** @deprecated use imageStorageId */
    storageId: v.optional(v.id("_storage")),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");
    const imageStorageId = args.imageStorageId ?? args.storageId;
    if (imageStorageId) {
      await assertStorageIsImage(ctx, imageStorageId);
    }
    const tags =
      args.tags && args.tags.length > 0
        ? args.tags
        : getDefaultTagsForGarment(
            args.category,
            args.primaryColor,
            args.season ?? undefined
          );
    let imageUrl = args.imageUrl;
    if (imageStorageId) {
      imageUrl = (await ctx.storage.getUrl(imageStorageId)) ?? undefined;
    }
    const { storageId: _s, imageStorageId: _i, ...rest } = args;
    return ctx.db.insert("garments", {
      userId: user._id,
      name: rest.name,
      category: rest.category,
      primaryColor: rest.primaryColor,
      tags,
      style: rest.style,
      fit: rest.fit,
      occasion: rest.occasion,
      versatility: rest.versatility,
      vibrancy: rest.vibrancy,
      material: rest.material,
      season: rest.season,
      imageUrl,
      imageStorageId,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("garments"),
    name: v.optional(v.string()),
    category: v.optional(garmentCategory),
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
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { id, imageStorageId, ...fields }) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");
    const garment = await ctx.db.get(id);
    if (!garment || garment.userId !== user._id) throw new Error("Not found");

    const prevStorageId = garment.imageStorageId;
    const patch: Record<string, unknown> = { ...fields };

    if (imageStorageId !== undefined) {
      if (imageStorageId) {
        await assertStorageIsImage(ctx, imageStorageId);
        patch.imageStorageId = imageStorageId;
        patch.imageUrl =
          (await ctx.storage.getUrl(imageStorageId)) ?? garment.imageUrl;
      }
    }

    await ctx.db.patch(id, patch);

    if (
      imageStorageId !== undefined &&
      imageStorageId &&
      prevStorageId &&
      prevStorageId !== imageStorageId
    ) {
      await ctx.storage.delete(prevStorageId);
    }
  },
});

export const remove = mutation({
  args: { id: v.id("garments") },
  handler: async (ctx, { id }) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");
    const garment = await ctx.db.get(id);
    if (!garment || garment.userId !== user._id) throw new Error("Not found");
    if (garment.imageStorageId) {
      await ctx.storage.delete(garment.imageStorageId);
    }
    await ctx.db.delete(id);
  },
});

export const removeMany = mutation({
  args: { ids: v.array(v.id("garments")) },
  handler: async (ctx, { ids }) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");
    for (const id of ids) {
      const garment = await ctx.db.get(id);
      if (garment && garment.userId === user._id) {
        if (garment.imageStorageId) {
          await ctx.storage.delete(garment.imageStorageId);
        }
        await ctx.db.delete(id);
      }
    }
  },
});
