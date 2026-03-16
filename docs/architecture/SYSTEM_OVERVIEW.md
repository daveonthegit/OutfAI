# OutfAI — System Architecture

> High-level system architecture and major components. Tech details: [TECH_STACK.md](./TECH_STACK.md).

---

## Overview

OutfAI uses a web-first architecture with a single TypeScript codebase. The client talks to Convex (database, server functions, auth, file storage) and to Next.js API routes for the recommendation engine and auth proxy.

```text
Client (Next.js App Router / React)
        ↓
Next.js (API routes + Convex React client)
        ↓
Convex Cloud (DB, server functions, BetterAuth, file storage)
        +
Next.js API routes → OutfitRecommendationService → Convex (garments)
        ↓
External APIs (Weather, e.g. Open-Meteo)
```

---

## Key Decisions

| Area                | Choice                                              | Rationale                                                           |
| ------------------- | --------------------------------------------------- | ------------------------------------------------------------------- |
| **Monorepo**        | Single repo for frontend and backend                | Shared types in `shared/`; fewer integration issues.                |
| **Backend**         | Convex                                              | DB, server functions, auth (BetterAuth), file storage in one place. |
| **Auth**            | BetterAuth 1.4.9 via `@convex-dev/better-auth`      | Email/password, username, email verification; stored in Convex.     |
| **API**             | Convex queries/mutations + Next.js API routes       | CRUD via Convex; recommendations and image analysis via API routes. |
| **Recommendations** | `OutfitRecommendationService` in `server/services/` | Invoked from `POST /api/recommendations`; rule-based, explainable.  |

---

## Data and API

- **Database:** All app data (garments, outfits, recommendation logs, profiles, userPreferences) lives in Convex. User/session data from BetterAuth component in Convex.
- **File storage:** Convex storage for garment (and profile) images; signed upload URLs via Convex mutations.
- **API routes:** `POST /api/recommendations`, `POST /api/style-insights`, `POST /api/product-recommendations`, `POST /api/analyze-garment-image`; auth proxied at `/api/auth/[...all]`. Legacy tRPC at `/api/trpc` is not used for main flows.

---

## Non-Goals

- No microservices, message queues, or custom auth.
- No heavy ML pipelines in MVP (learning pipeline is Phase 4).
