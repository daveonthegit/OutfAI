import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUser } from "./auth";

/** List external products for recommendation. Optional limit for performance. */
export const list = query({
  args: {
    limit: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) return [];
    const limit = args.limit ?? 50;
    if (args.category != null && args.category !== "") {
      const results = await ctx.db
        .query("external_products")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .take(limit);
      return results;
    }
    return await ctx.db.query("external_products").take(limit);
  },
});

/** Get a single product by id. */
export const getById = query({
  args: { id: v.id("external_products") },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) return null;
    return ctx.db.get(args.id);
  },
});

/** Upsert a single external product (for ingestion). Idempotent by source + sourceProductId. Internal-only. */
export const upsert = internalMutation({
  args: {
    source: v.string(),
    sourceProductId: v.string(),
    name: v.string(),
    brand: v.optional(v.string()),
    category: v.string(),
    subcategory: v.optional(v.string()),
    color: v.optional(v.string()),
    styleTags: v.optional(v.array(v.string())),
    occasionTags: v.optional(v.array(v.string())),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    productUrl: v.string(),
    affiliateUrl: v.optional(v.string()),
    availability: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("external_products")
      .withIndex("by_source_product", (q) =>
        q.eq("source", args.source).eq("sourceProductId", args.sourceProductId)
      )
      .first();
    const now = Date.now();
    const doc = {
      ...args,
      createdAt: existing?._creationTime ?? now,
      updatedAt: now,
    };
    if (existing) {
      await ctx.db.patch(existing._id, doc);
      return existing._id;
    }
    return await ctx.db.insert("external_products", doc);
  },
});

/** Seed dev external products (mock data). No auth required for dev seeding. */
export const seedDevProducts = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");
    const now = Date.now();
    const products = [
      {
        source: "mock",
        sourceProductId: "mock-jacket-1",
        name: "Neutral Wool Blend Blazer",
        brand: "Mock Brand",
        category: "outerwear",
        subcategory: "blazer",
        color: "navy",
        styleTags: ["classic", "smart-casual"],
        occasionTags: ["work", "smart-casual"],
        price: 129.99,
        currency: "USD",
        imageUrl:
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400",
        productUrl: "https://example.com/p/mock-jacket-1",
        availability: "in_stock",
        createdAt: now,
        updatedAt: now,
      },
      {
        source: "mock",
        sourceProductId: "mock-shoes-1",
        name: "White Leather Sneakers",
        brand: "Mock Brand",
        category: "shoes",
        subcategory: "sneakers",
        color: "white",
        styleTags: ["casual", "minimalist"],
        occasionTags: ["casual", "weekend"],
        price: 89.99,
        currency: "USD",
        imageUrl:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        productUrl: "https://example.com/p/mock-shoes-1",
        availability: "in_stock",
        createdAt: now,
        updatedAt: now,
      },
      {
        source: "mock",
        sourceProductId: "mock-outerwear-2",
        name: "Beige Trench Coat",
        brand: "Mock Brand",
        category: "outerwear",
        subcategory: "coat",
        color: "beige",
        styleTags: ["classic", "minimalist"],
        occasionTags: ["work", "smart-casual"],
        price: 199.99,
        currency: "USD",
        imageUrl:
          "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400",
        productUrl: "https://example.com/p/mock-outerwear-2",
        availability: "in_stock",
        createdAt: now,
        updatedAt: now,
      },
      {
        source: "mock",
        sourceProductId: "mock-accessory-1",
        name: "Leather Belt",
        brand: "Mock Brand",
        category: "accessory",
        subcategory: "belt",
        color: "brown",
        styleTags: ["classic"],
        occasionTags: ["casual", "formal"],
        price: 45.99,
        currency: "USD",
        imageUrl:
          "https://images.unsplash.com/photo-1624222247344-550fb60583c2?w=400",
        productUrl: "https://example.com/p/mock-accessory-1",
        availability: "in_stock",
        createdAt: now,
        updatedAt: now,
      },
    ];
    const ids: string[] = [];
    for (const p of products) {
      const existing = await ctx.db
        .query("external_products")
        .withIndex("by_source_product", (q) =>
          q.eq("source", p.source).eq("sourceProductId", p.sourceProductId)
        )
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, { ...p });
        ids.push(existing._id);
      } else {
        const id = await ctx.db.insert("external_products", p);
        ids.push(id);
      }
    }
    return { seeded: ids.length };
  },
});
