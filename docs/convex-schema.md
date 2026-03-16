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
> Last generated: 2026-03-14

---

## Collections

- [`garments`](#garments)
- [`outfits`](#outfits)
- [`recommendationLogs`](#recommendationLogs)
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

## `userPreferences`

| Field | Type | Required |
|-------|------|----------|
| `userId` | `string` | yes |
| `favoriteMoods` | `array<string>` | no |
| `preferredStyles` | `array<string>` | no |
| `preferredColors` | `array<string>` | no |
| `avoidedColors` | `array<string>` | no |

---

## `profiles`

| Field | Type | Required |
|-------|------|----------|
| `userId` | `string` | yes |
| `bio` | `string` | no |
| `avatarStorageId` | `id<_storage>` | no |
| `updatedAt` | `number` | yes |

---

## `external_products`

Used for **optional** external product suggestions (e.g. “Suggested for your wardrobe” with links). The current home-page suggestion feature is Style insights (text-only; no product table required).

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
