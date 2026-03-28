import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Individual clothing items owned by a user.
  // garment_tags (Prisma-era design) is flattened into the `tags` array field.
  garments: defineTable({
    userId: v.string(),
    name: v.string(),
    category: v.string(), // "top" | "bottom" | "shoes" | "outerwear" | "accessory"
    primaryColor: v.string(),
    tags: v.array(v.string()),
    style: v.optional(v.array(v.string())),
    fit: v.optional(v.string()),
    occasion: v.optional(v.array(v.string())),
    versatility: v.optional(v.string()), // "high" | "medium" | "low"
    vibrancy: v.optional(v.string()), // "muted" | "balanced" | "vibrant"
    material: v.optional(v.string()),
    season: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    /** Durable file reference; prefer resolving display URL via storage. */
    imageStorageId: v.optional(v.id("_storage")),
  }).index("by_userId", ["userId"]),

  // Ephemeral outfit detail payloads (replaces huge JSON query strings).
  outfitPreviews: defineTable({
    userId: v.string(),
    label: v.string(),
    garmentIds: v.array(v.id("garments")),
    explanation: v.optional(v.string()),
    scoreBreakdown: v.optional(v.any()),
    contextMood: v.optional(v.string()),
    contextWeather: v.optional(v.string()),
    contextTemperature: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Saved outfit instances.
  // outfit_items (Prisma-era join table) is embedded as a garmentIds array to
  // avoid joins at MVP scale. See MIGRATION_NOTES.md for rationale.
  outfits: defineTable({
    userId: v.string(),
    garmentIds: v.array(v.id("garments")),
    contextMood: v.optional(v.string()),
    contextWeather: v.optional(v.string()),
    contextTemperature: v.optional(v.number()),
    explanation: v.optional(v.string()),
    savedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Interaction logs: shown / saved / skipped / worn.
  recommendationLogs: defineTable({
    userId: v.string(),
    outfitId: v.optional(v.id("outfits")),
    garmentIds: v.array(v.string()),
    action: v.string(), // "shown" | "saved" | "skipped" | "worn"
    mood: v.optional(v.string()),
    weather: v.optional(v.string()),
    loggedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_loggedAt", ["userId", "loggedAt"]),

  // Outfit calendar: plan which outfit to wear on a given date.
  outfitPlans: defineTable({
    userId: v.string(),
    date: v.string(), // YYYY-MM-DD
    outfitId: v.id("outfits"),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_date", ["userId", "date"]),

  // Packing lists (trip capsule): name, dates, selected garment IDs.
  packingLists: defineTable({
    userId: v.string(),
    name: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    garmentIds: v.array(v.id("garments")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Per-user style preferences that can be used to personalize recommendations.
  userPreferences: defineTable({
    userId: v.string(),
    favoriteMoods: v.optional(v.array(v.string())),
    preferredStyles: v.optional(v.array(v.string())),
    preferredColors: v.optional(v.array(v.string())),
    avoidedColors: v.optional(v.array(v.string())),
    styleGoal: v.optional(v.string()),
    styleGoalTags: v.optional(v.array(v.string())),
  }).index("by_userId", ["userId"]),

  // User profile extension: bio, avatar storage, onboarding. Identity (name, username, email) lives in Better Auth user table.
  profiles: defineTable({
    userId: v.string(),
    bio: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
    onboardingComplete: v.optional(v.boolean()),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // External products from affiliate/partner feeds. Normalized; multiple sources supported.
  external_products: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_source", ["source"])
    .index("by_source_product", ["source", "sourceProductId"])
    .index("by_category", ["category"]),

  // Optional: commerce interaction logs (click-through, dismissed). Consent-aware; do not track without consent.
  commerceInteractionLogs: defineTable({
    userId: v.string(),
    productId: v.id("external_products"),
    action: v.string(), // "clicked" | "dismissed"
    loggedAt: v.number(),
  }).index("by_userId", ["userId"]),
});
