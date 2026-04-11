<!--
  ╔══════════════════════════════════════════════════════════╗
  ║  GENERATED FILE — DO NOT EDIT MANUALLY                  ║
  ║                                                         ║
  ║  Source: convex/schema.ts                               ║
  ║  Command: npm run gen:db-docs                           ║
  ╚══════════════════════════════════════════════════════════╝
-->

# OutfAI — Convex Schema

> Auto-generated from [`convex/schema.ts`](../convex/schema.ts) by [`scripts/generate-convex-docs.ts`](../scripts/generate-convex-docs.ts).
> Last generated: 2026-04-11

---

## Collections

- [`garments`](#garments)
- [`outfitPreviews`](#outfitPreviews)
- [`outfits`](#outfits)
- [`recommendationLogs`](#recommendationLogs)
- [`outfitPlans`](#outfitPlans)
- [`packingLists`](#packingLists)
- [`userPreferences`](#userPreferences)
- [`profiles`](#profiles)
- [`external_products`](#external_products)
- [`commerceInteractionLogs`](#commerceInteractionLogs)

---

## `garments`

| Field | Type | Required |
|-------|------|----------|
| `userId` | `string` | yes |
| `name` | `string` | yes |
| `category` | `string` | yes |
| `primaryColor` | `string` | yes |
| `tags` | `array<string>` | yes |
| `style` | `array<string>` | no |
| `fit` | `string` | no |
| `occasion` | `array<string>` | no |
| `versatility` | `string` | no |
| `vibrancy` | `string` | no |
| `material` | `string` | no |
| `season` | `string` | no |
| `imageUrl` | `string` | no |
| `imageStorageId` | `id<_storage>` | no |

---

## `outfitPreviews`

| Field | Type | Required |
|-------|------|----------|
| `userId` | `string` | yes |
| `label` | `string` | yes |
| `garmentIds` | `array<id<garments>>` | yes |
| `explanation` | `string` | no |
| `scoreBreakdown` | `any` | no |
| `contextMood` | `string` | no |
| `contextWeather` | `string` | no |
| `contextTemperature` | `number` | no |
| `createdAt` | `number` | yes |

---

## `outfits`

| Field | Type | Required |
|-------|------|----------|
| `userId` | `string` | yes |
| `garmentIds` | `array<id<garments>>` | yes |
| `contextMood` | `string` | no |
| `contextWeather` | `string` | no |
| `contextTemperature` | `number` | no |
| `explanation` | `string` | no |
| `savedAt` | `number` | yes |

---

## `recommendationLogs`

| Field | Type | Required |
|-------|------|----------|
| `userId` | `string` | yes |
| `outfitId` | `id<outfits>` | no |
| `garmentIds` | `array<string>` | yes |
| `action` | `string` | yes |
| `mood` | `string` | no |
| `weather` | `string` | no |
| `loggedAt` | `number` | yes |

---

## `outfitPlans`

| Field | Type | Required |
|-------|------|----------|
| `userId` | `string` | yes |
| `date` | `string` | yes |
| `outfitId` | `id<outfits>` | yes |

---

## `packingLists`

| Field | Type | Required |
|-------|------|----------|
| `userId` | `string` | yes |
| `name` | `string` | yes |
| `startDate` | `number` | yes |
| `endDate` | `number` | yes |
| `garmentIds` | `array<id<garments>>` | yes |
| `createdAt` | `number` | yes |
| `updatedAt` | `number` | yes |

---

## `userPreferences`

| Field | Type | Required |
|-------|------|----------|
| `userId` | `string` | yes |
| `favoriteMoods` | `array<string>` | no |
| `preferredStyles` | `array<string>` | no |
| `preferredColors` | `array<string>` | no |
| `avoidedColors` | `array<string>` | no |
| `styleGoal` | `string` | no |
| `styleGoalTags` | `array<string>` | no |

---

## `profiles`

| Field | Type | Required |
|-------|------|----------|
| `userId` | `string` | yes |
| `bio` | `string` | no |
| `avatarStorageId` | `id<_storage>` | no |
| `onboardingComplete` | `boolean` | no |
| `updatedAt` | `number` | yes |

---

## `external_products`

| Field | Type | Required |
|-------|------|----------|
| `source` | `string` | yes |
| `sourceProductId` | `string` | yes |
| `name` | `string` | yes |
| `brand` | `string` | no |
| `category` | `string` | yes |
| `subcategory` | `string` | no |
| `color` | `string` | no |
| `styleTags` | `array<string>` | no |
| `occasionTags` | `array<string>` | no |
| `price` | `number` | no |
| `currency` | `string` | no |
| `imageUrl` | `string` | no |
| `productUrl` | `string` | yes |
| `affiliateUrl` | `string` | no |
| `availability` | `string` | no |
| `metadata` | `any` | no |
| `createdAt` | `number` | yes |
| `updatedAt` | `number` | yes |

---

## `commerceInteractionLogs`

| Field | Type | Required |
|-------|------|----------|
| `userId` | `string` | yes |
| `productId` | `id<external_products>` | yes |
| `action` | `string` | yes |
| `loggedAt` | `number` | yes |

---
