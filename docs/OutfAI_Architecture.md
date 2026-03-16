# OutfAI — System Architecture

> **Canonical architecture docs** are in [architecture/SYSTEM_OVERVIEW.md](architecture/SYSTEM_OVERVIEW.md) and [architecture/TECH_STACK.md](architecture/TECH_STACK.md). This file is kept for backward compatibility.

---

## Architecture Overview

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

## Key Architectural Decisions

### Monorepo

- Single repository for frontend and backend
- Shared types and utilities in `shared/`
- Faster development and fewer integration issues

### Convex as Backend

- **Database:** All app data (garments, outfits, recommendation logs) lives in Convex. User and session data are managed by the BetterAuth component stored in Convex via `@convex-dev/better-auth`.
- **Server functions:** Convex queries and mutations replace a traditional REST/tRPC backend for CRUD (e.g. `garments.list`, `outfits.save`).
- **Auth:** BetterAuth 1.4.9 with email/password and username plugin; auth routes are mounted on Convex HTTP and proxied from Next.js `/api/auth/[...all]`.
- **File storage:** Convex file storage for garment images (and optional profile images); signed upload URLs via Convex mutations.

### Next.js API Routes

- **Recommendations:** `POST /api/recommendations` calls `OutfitRecommendationService` with garments (from Convex) and returns generated outfits. The client uses the `useOutfitRecommendations` hook, which calls this endpoint.
- **Auth:** Thin proxy to Convex HTTP (BetterAuth) for session handling.
- A legacy tRPC route exists at `/api/trpc` but the primary data and recommendation flow uses Convex and the recommendations API route.

### Service Layer

- `OutfitRecommendationService` in `server/services/` holds business logic for filtering, generating, and scoring outfits. It is invoked from the recommendations API route, not from Convex.

### Recommendation Engine

- Rule-based for MVP
- Explainable outputs
- Recommendation logs stored in Convex for future ML improvements

---

## Non-Goals

- No microservices
- No message queues
- No custom auth system (BetterAuth is used)
- No heavy ML pipelines in MVP

This architecture prioritizes simplicity, clarity, and extensibility.
