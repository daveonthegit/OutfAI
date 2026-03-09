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
> Last generated: 2026-03-08

---

## Collections

- [`garments`](#garments)
- [`outfits`](#outfits)
- [`recommendationLogs`](#recommendationLogs)
- [`userPreferences`](#userPreferences)

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
