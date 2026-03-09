# OutfAI — Database Design

## Overview

The database is designed to be wardrobe-first, extensible, and friendly to future recommendation improvements. The single source of truth for the schema is [convex/schema.ts](../convex/schema.ts). An auto-generated reference is [convex-schema.md](./convex-schema.md).

**Database:** Convex  
**Schema:** Convex `defineSchema` / `defineTable` (no separate ORM). User and session data are managed by the BetterAuth component (stored in Convex via `@convex-dev/better-auth`) and are not defined in the application schema.

---

## Core Collections

### garments

Individual clothing items owned by a user. Tags from the original design (a separate `garment_tags` table) are flattened into a `tags` array on each document.

| Field        | Type            | Required | Notes                                         |
| ------------ | --------------- | -------- | --------------------------------------------- |
| userId       | string          | yes      | BetterAuth user id (string)                   |
| name         | string          | yes      |                                               |
| category     | string          | yes      | e.g. top, bottom, shoes, outerwear, accessory |
| primaryColor | string          | yes      |                                               |
| tags         | array of string | yes      | Replaces garment_tags table                   |
| style        | array of string | no       |                                               |
| fit          | string          | no       |                                               |
| occasion     | array of string | no       |                                               |
| versatility  | string          | no       | high / medium / low                           |
| vibrancy     | string          | no       | muted / balanced / vibrant                    |
| material     | string          | no       |                                               |
| season       | string          | no       |                                               |
| imageUrl     | string          | no       | From Convex file storage (or external URL)    |

Index: `by_userId` on `userId`.

---

### outfits

Saved outfit instances. The original design had an `outfit_items` join table; for MVP, garment IDs are embedded as `garmentIds` on the outfit document to avoid multi-document reads.

| Field              | Type                  | Required | Notes                            |
| ------------------ | --------------------- | -------- | -------------------------------- |
| userId             | string                | yes      |                                  |
| garmentIds         | array of id(garments) | yes      | Replaces outfit_items join table |
| contextMood        | string                | no       |                                  |
| contextWeather     | string                | no       |                                  |
| contextTemperature | number                | no       |                                  |
| explanation        | string                | no       | Human-readable reasoning         |
| savedAt            | number                | yes      | Timestamp                        |

Index: `by_userId` on `userId`.

---

### recommendationLogs

Tracks user interactions with recommendations (shown, saved, skipped, worn) for future learning and analytics.

| Field      | Type            | Required | Notes                             |
| ---------- | --------------- | -------- | --------------------------------- |
| userId     | string          | yes      |                                   |
| outfitId   | id(outfits)     | no       |                                   |
| garmentIds | array of string | yes      | Garment IDs as strings            |
| action     | string          | yes      | shown \| saved \| skipped \| worn |
| mood       | string          | no       |                                   |
| weather    | string          | no       |                                   |
| loggedAt   | number          | yes      | Timestamp                         |

Index: `by_userId` on `userId`.

---

## Users and sessions

User identity and sessions are not defined in the application schema. They are managed by **BetterAuth** with the Convex adapter (`@convex-dev/better-auth`). Tables used by BetterAuth live in the same Convex deployment; see the [BetterAuth + Convex docs](https://labs.convex.dev/better-auth/framework-guides/next) for details.

---

## Commerce (storefront integration)

Implemented as part of wardrobe-first product recommendations. See [commerce/IMPLEMENTATION.md](commerce/IMPLEMENTATION.md) and [commerce/SCRAPING_NON_GOAL.md](commerce/SCRAPING_NON_GOAL.md).

### external_products

Normalized external products from affiliate/partner feeds. Single source of truth: [convex/schema.ts](../convex/schema.ts).

| Field           | Type      | Notes                              |
| --------------- | --------- | ---------------------------------- |
| source          | string    | Provider/source identifier         |
| sourceProductId | string    | Id in source system                |
| name            | string    |                                    |
| brand           | string?   |                                    |
| category        | string    | Normalized (top, bottom, shoes, …) |
| subcategory     | string?   |                                    |
| color           | string?   | Normalized color                   |
| styleTags       | string[]? |                                    |
| occasionTags    | string[]? |                                    |
| price           | number?   |                                    |
| currency        | string?   |                                    |
| imageUrl        | string?   |                                    |
| productUrl      | string    |                                    |
| affiliateUrl    | string?   |                                    |
| availability    | string?   |                                    |
| createdAt       | number    |                                    |
| updatedAt       | number    |                                    |

Indexes: `by_source`, `by_source_product`, `by_category`.

### commerceInteractionLogs

Optional interaction logs (click-through, dismissed). Consent-aware; do not track without consent.

| Field     | Type                  | Notes                    |
| --------- | --------------------- | ------------------------ |
| userId    | string                |                          |
| productId | id(external_products) |                          |
| action    | string                | "clicked" \| "dismissed" |
| loggedAt  | number                |                          |

Index: `by_userId`.

Product–wardrobe “matches” are computed on demand by the recommendation service (not stored in a separate table).

---

## Legacy reference (pre-Convex)

The original design used SQL-style tables (users, garment_tags, outfit_items, etc.). The current Convex schema flattens tags into `garments.tags` and outfit items into `outfits.garmentIds` as described in [MIGRATION_NOTES.md](../MIGRATION_NOTES.md). The SQL versions are no longer used.

---

## Design principles

- Wardrobe-first: garments and outfits are the core entities.
- Log interactions (recommendationLogs), not opinions.
- Keep explanations first-class (e.g. outfit explanation field).
- Avoid schema rewrites later; Convex schema is the single source of truth.

This schema supports MVP needs while enabling future personalization and learning.
