# OutfAI — Implementation Plan

> Phased roadmap for building OutfAI from current state to capstone-demo-ready MVP.
> Derived from the [PRD](./OutfAI_PRD.md), [DB Design](./OutfAI_Database_Design.md), [Project Structure](./OutfAI_Project_Structure.md), and [Recommendation Engine](./OUTFIT_RECOMMENDATION_ENGINE.md) docs.

---

## Current State

| Area                  | Status                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------- |
| Frontend shell        | Next.js 15 app router with brutalist UI components, shadcn/ui                               |
| Recommendation engine | `OutfitRecommendationService` implemented with 3-stage pipeline (filter → generate → score) |
| tRPC API              | `recommendations` router with mock data                                                     |
| Database              | Schema designed (docs only) — no Prisma schema, no migrations                               |
| Auth                  | None                                                                                        |
| Image upload          | None                                                                                        |
| Weather API           | None                                                                                        |
| Shared types          | `shared/types/index.ts` with core interfaces                                                |

---

## Phase 0 — Foundation

**Goal:** Wire up the infrastructure so every subsequent phase builds on real plumbing, not mocks.

### Tasks

- [ ] **0.1 — Supabase project setup**
  - Create Supabase project (or local Docker instance via `supabase init`)
  - Store connection string in `.env.local` (never committed)
  - _Acceptance:_ `supabase status` returns healthy, `.env.local` is in `.gitignore`

- [ ] **0.2 — Install and configure Prisma**
  - `npm install prisma @prisma/client`
  - `npx prisma init` → creates `prisma/schema.prisma`
  - Set `provider = "postgresql"` and `url = env("DATABASE_URL")`
  - _Acceptance:_ `npx prisma validate` passes

- [ ] **0.3 — Initial Prisma schema**
  - Translate all tables from [DB Design](./OutfAI_Database_Design.md) into Prisma models: `User`, `Garment`, `GarmentTag`, `Outfit`, `OutfitItem`, `RecommendationLog`
  - Add indexes from the DB design (`@@index([userId])` on garments, outfits, etc.)
  - _Acceptance:_ `npx prisma migrate dev --name init` succeeds, tables visible in Supabase dashboard

- [ ] **0.4 — Prisma client singleton**
  - Create `server/db/client.ts` exporting a shared `PrismaClient` instance
  - _Acceptance:_ Importable from any server file; no "multiple PrismaClient instances" warning in dev

- [ ] **0.5 — Supabase Auth configuration**
  - Enable email/password provider in Supabase dashboard
  - Install `@supabase/supabase-js` and `@supabase/auth-helpers-nextjs`
  - Create `lib/supabase/client.ts` (browser) and `lib/supabase/server.ts` (server-side)
  - _Acceptance:_ `supabase.auth.signUp()` returns a session in a scratch test

- [ ] **0.6 — tRPC context with auth**
  - Update `server/api/trpc.ts` to accept Supabase session from request headers
  - Create `protectedProcedure` that rejects unauthenticated calls
  - _Acceptance:_ Calling a protected endpoint without a token returns 401

- [ ] **0.7 — CI skeleton**
  - Add GitHub Actions workflow: `lint` → `typecheck` → `build`
  - _Acceptance:_ Push to `main` triggers a green pipeline

- [ ] **0.8 — Auto-generate DB docs**
  - Run `npm run gen:db-docs` to produce `docs/supabase-structure.md` from the Prisma schema
  - _Acceptance:_ Generated file matches the actual schema

### Files to touch

```
prisma/schema.prisma          (new)
server/db/client.ts            (new)
server/api/trpc.ts             (update)
apps/web/lib/supabase/         (new directory)
.env.local                     (new, gitignored)
.github/workflows/ci.yml       (new)
package.json                   (add deps + scripts)
```

### Risks

- Supabase free-tier row limits are generous but watch storage quotas for images later.
- Prisma + Supabase connection pooling: use `?pgbouncer=true&connection_limit=1` in `DATABASE_URL` for serverless.

### Definition of Done

A developer can clone the repo, run `npm install`, set `DATABASE_URL`, run `npx prisma migrate dev`, start `npm run dev`, and see the existing UI with a working (but empty) database behind it.

---

## Phase 1 — Vertical Slice

**Goal:** The shortest path to a demoable loop: **sign up → upload 1 garment → generate 1 outfit**.

### Tasks

- [ ] **1.1 — Sign-up / login pages**
  - Create `apps/web/app/auth/login/page.tsx` and `apps/web/app/auth/signup/page.tsx`
  - Use Supabase Auth helpers for email/password
  - Redirect to `/closet` on success
  - _Acceptance:_ New user can sign up, log in, and see the closet page. Session persists across refresh.

- [ ] **1.2 — Auth middleware**
  - Add Next.js middleware (`middleware.ts`) to protect `/closet`, `/mood`, `/style` routes
  - Redirect unauthenticated users to `/auth/login`
  - _Acceptance:_ Visiting `/closet` while logged out redirects to login

- [ ] **1.3 — Garment upload (minimal)**
  - Build `garments` resource following the [backend pattern](../rules/backend-patterns.mdc):
    - `shared/schemas/garments.ts` — Zod schemas for create/read
    - `server/actions/garmentActions.ts` — Prisma `create` + `findMany`
    - `server/services/garmentService.ts` — orchestrate create (validate → store → return)
    - `server/api/routers/garments.ts` — `create` and `list` endpoints
  - Register `garments` router in `server/api/routers/_app.ts`
  - Frontend: simple form on `/add` page (name, category, color, season — no image yet)
  - _Acceptance:_ User creates a garment via the form, it appears in the closet list, and it persists in the DB.

- [ ] **1.4 — Wire recommendation engine to real data**
  - Update `recommendations` router to fetch garments from DB instead of `MOCK_GARMENTS`
  - Filter by the authenticated user's `userId`
  - _Acceptance:_ `/style` page generates outfits from the user's actual garments

- [ ] **1.5 — Minimal outfit display**
  - Ensure the existing `OutfitRecommendationPanel` component works end-to-end
  - Show outfit score + explanation
  - _Acceptance:_ User with ≥3 garments sees at least 1 generated outfit with an explanation

### Files to touch

```
apps/web/app/auth/              (new)
apps/web/middleware.ts           (new)
shared/schemas/garments.ts       (new)
server/actions/garmentActions.ts (new)
server/services/garmentService.ts(new)
server/api/routers/garments.ts   (new)
server/api/routers/_app.ts       (update)
server/api/routers/recommendations.ts (update — remove mock data)
apps/web/app/add/page.tsx        (update)
apps/web/app/closet/page.tsx     (update)
```

### Risks

- Without image upload, the closet feels bare. Mitigate by allowing a placeholder thumbnail.
- Generating outfits with <3 garments returns empty — show a helpful "add more items" message.

### Definition of Done

**Vertical Slice Milestone:** A user can sign up, add 3+ garments via the form, navigate to the style page, and see a generated outfit composed of their own garments with a score and explanation. This is the first end-to-end demo.

---

## Phase 2 — Core Closet Management

**Goal:** Full garment lifecycle with images, making the closet feel like a real product.

### Tasks

- [ ] **2.1 — Image upload**
  - Configure Supabase Storage bucket `garment-images` (public read, authenticated write)
  - Create `server/actions/storageActions.ts` for upload/delete
  - Update garment creation flow: upload image → get URL → save to `garments.image_original_url`
  - Generate thumbnail on upload (client-side resize or Supabase image transform)
  - _Acceptance:_ Uploaded image displays in the closet grid. Deleting a garment removes the image.

- [ ] **2.2 — Garment CRUD (full)**
  - Add `update` and `delete` endpoints to garments router
  - Add corresponding service + action methods
  - Frontend: edit modal, delete confirmation, swipe-to-delete on mobile
  - _Acceptance:_ User can edit name/category/color and delete a garment. Changes persist.

- [ ] **2.3 — Garment tagging**
  - Store tags in `garment_tags` table
  - On garment create: auto-generate tags from category + color + material (stub — no ML)
  - Allow user to add/remove tags manually
  - _Acceptance:_ Tags appear on garment detail. User-added tags are marked `source: "user"`.

- [ ] **2.4 — Closet grid and filters**
  - Display garments in a responsive image grid on `/closet`
  - Filter by category, season, color
  - Search by name
  - _Acceptance:_ Filtering by "tops" shows only tops. Search for "shirt" returns matching garments.

### Files to touch

```
server/actions/storageActions.ts     (new)
server/actions/garmentActions.ts     (update)
server/services/garmentService.ts    (update)
server/api/routers/garments.ts       (update)
shared/schemas/garments.ts           (update)
apps/web/app/closet/page.tsx         (update)
apps/web/app/add/page.tsx            (update)
apps/web/components/garment-card.tsx  (new or update)
apps/web/components/garment-grid.tsx  (new)
```

### Risks

- Large image uploads on slow connections. Mitigate: client-side compression before upload, progress indicator.
- Supabase Storage free tier: 1 GB. Sufficient for demo.

### Definition of Done

The closet page shows a grid of garment photos with category filters. Users can add (with photo), edit, tag, and delete garments.

---

## Phase 3 — Recommendation Engine (Full Integration)

**Goal:** Make outfit generation context-aware with real mood + weather inputs.

### Tasks

- [ ] **3.1 — Mood input UI**
  - Build mood selector component (emoji buttons or styled cards for the 7 moods)
  - Persist selection in URL params or local state for the generate call
  - _Acceptance:_ Selecting "cozy" and generating outfits filters toward warm materials and cozy tags.

- [ ] **3.2 — Weather API integration**
  - Create `server/actions/weatherActions.ts` calling a free weather API (OpenWeatherMap or Open-Meteo)
  - Create `server/services/weatherService.ts` to fetch + cache weather (5 min TTL)
  - Auto-detect user location via browser geolocation or IP
  - Display current weather on the style page
  - _Acceptance:_ Weather badge shows current conditions. Outfits respect weather constraints (no wool on a 30 C day).

- [ ] **3.3 — Outfit persistence**
  - Save generated outfits to `outfits` + `outfit_items` tables
  - Create `outfits` resource (router/service/actions/schema)
  - _Acceptance:_ Generated outfits can be retrieved later by ID.

- [ ] **3.4 — Save / skip / worn actions**
  - Wire `recommendations.logInteraction` to write to `recommendation_logs`
  - Add save (heart) and skip (X) buttons on outfit cards
  - Add "I wore this" action from saved outfits
  - _Acceptance:_ Logs appear in `recommendation_logs`. Saved outfits show in a "Saved" tab.

- [ ] **3.5 — Explainability UI**
  - Show score breakdown (color harmony, mood alignment, diversity) on outfit detail
  - Show per-garment reasoning ("Blue Linen Shirt: matches casual mood, breathable for summer")
  - _Acceptance:_ Every outfit card has a toggleable explanation section.

### Files to touch

```
server/actions/weatherActions.ts       (new)
server/services/weatherService.ts      (new)
server/actions/outfitActions.ts        (new)
server/services/outfitService.ts       (new)
server/api/routers/outfits.ts          (new)
shared/schemas/outfits.ts              (new)
server/api/routers/recommendations.ts  (update)
apps/web/components/mood-selector.tsx   (new)
apps/web/components/weather-badge.tsx   (new)
apps/web/components/outfit-card.tsx     (update)
apps/web/app/style/page.tsx             (update)
```

### Risks

- Weather API rate limits (free tiers usually 1000 calls/day). Mitigate: server-side caching.
- Geolocation permission denied. Mitigate: allow manual city entry fallback.

### Definition of Done

A user selects a mood, sees live weather, generates outfits from their real closet, and can save or skip them. Each outfit shows an explainable score breakdown.

---

## Phase 4 — Polish and Demo Readiness

**Goal:** Make it look and feel like a finished product for a 3-minute capstone demo.

### Tasks

- [ ] **4.1 — Onboarding flow**
  - First-time user: guided tour (sign up → upload 3 garments → generate first outfit)
  - Progress indicator ("3 of 3 garments added — ready to generate!")
  - _Acceptance:_ New user completes onboarding in <2 minutes

- [ ] **4.2 — Loading states and error handling**
  - Skeleton loaders on closet grid, outfit cards
  - Toast notifications for success/error (using sonner)
  - Empty states with CTAs ("No garments yet — add your first item")
  - _Acceptance:_ No raw error messages visible. Every async operation has a loading state.

- [ ] **4.3 — Mobile responsiveness pass**
  - Test all pages at 375px width
  - Bottom nav works on mobile (already exists, verify)
  - Swipe gestures on outfit cards (save right, skip left)
  - _Acceptance:_ Demo works smoothly on a phone-sized screen

- [ ] **4.4 — Seed data script**
  - Create `scripts/seed.ts` to populate a demo account with 10-15 garments + images
  - _Acceptance:_ `npm run seed` creates a ready-to-demo account in <10 seconds

- [ ] **4.5 — Demo rehearsal checklist**
  - Verify the 3-minute demo script from [mvp-features.md](./mvp-features.md)
  - Record a practice run
  - _Acceptance:_ Demo fits in 3 minutes, every click works, no dead ends

### Files to touch

```
apps/web/app/onboarding/page.tsx  (update)
apps/web/components/              (various updates)
scripts/seed.ts                    (new)
package.json                       (add seed script)
```

### Risks

- Scope creep into animations and micro-interactions. Keep it functional, not flashy.
- Demo on unreliable Wi-Fi. Mitigate: seed data so nothing depends on external APIs during demo.

### Definition of Done

The app feels complete: onboarding guides new users, the closet is full, outfit generation is instant with seeded data, and the 3-minute demo script runs without hitches.

---

## Phase 5 — Post-MVP

**Goal:** Features that extend the product beyond the capstone but are explicitly out of scope for the demo.

### Tasks (not estimated — backlog only)

- [ ] **5.1 — Storefront integration** — external product suggestions with affiliate links
- [ ] **5.2 — Learning pipeline** — track save/skip/worn to improve scoring weights per user
- [ ] **5.3 — Outfit calendar** — plan outfits for upcoming days
- [ ] **5.4 — Packing planner** — select trip dates + destination, generate a capsule wardrobe
- [ ] **5.5 — AI auto-tagging** — use a vision model to extract category, color, material from photos
- [ ] **5.6 — Mobile app** — React Native / Expo shell reusing shared types and API
- [ ] **5.7 — Social features** — share outfits, community inspiration feed

---

## Assumptions

- **Auth provider:** Supabase Auth (email/password + optional OAuth).
- **Image storage:** Supabase Storage (S3-compatible). Can swap to Cloudflare R2 later.
- **Weather API:** Open-Meteo (free, no API key required) preferred over OpenWeatherMap.
- **Deployment target:** Vercel for the Next.js app, Supabase for DB + storage + auth.
- **Timeline:** Phases 0-4 are scoped for a 6-8 week capstone. Phase 5 is post-capstone.
- **Team size:** Solo developer. Tasks are sequenced accordingly (no parallel workstreams).
