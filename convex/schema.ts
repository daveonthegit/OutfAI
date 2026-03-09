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
  }).index("by_userId", ["userId"]),

  // Per-user style preferences that can be used to personalize recommendations.
  userPreferences: defineTable({
    userId: v.string(),
    favoriteMoods: v.optional(v.array(v.string())),
    preferredStyles: v.optional(v.array(v.string())),
    preferredColors: v.optional(v.array(v.string())),
    avoidedColors: v.optional(v.array(v.string())),
  }).index("by_userId", ["userId"]),

  // User profile extension: bio, avatar storage. Identity (name, username, email) lives in Better Auth user table.
  profiles: defineTable({
    userId: v.string(),
    bio: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
});
