# OutfAI — Current Product State

> Summary of what the product does, core flows, features, architecture, and limitations.  
> Generated as part of the product expansion process.

---

## 1. What the Product Currently Does

**OutfAI** is a **wardrobe-first outfit intelligence** web app. It helps users decide what to wear by:

- **Managing a digital closet** — Add, edit, and delete garments with photos, categories, colors, tags, and metadata (season, material, etc.).
- **Generating context-aware outfits** — From the user’s own wardrobe, using **mood** (e.g. casual, formal, cozy) and **weather** (from Open-Meteo + geolocation).
- **Explaining recommendations** — Each outfit has a 0–100 score and human-readable reasoning (color harmony, mood alignment, diversity, etc.).
- **Saving and archiving** — Users can save outfits and view them in an archive; saved outfits can be marked “I wore this” (UI exists; logging not yet wired).
- **Style insights** — Text-only suggestions on the home page: wardrobe gaps, complete-the-look tips, and style/occasion advice. No product catalog required.
- **Optional product suggestions** — When configured, external product recommendations (Amazon, Walmart, Macy’s, Best Buy, JSON feed) can be shown with justify-how-it-fits reasoning; not shown on home by default.

**Tech:** Next.js 15 (App Router), React 19, TypeScript, Convex (DB + server functions + file storage + BetterAuth), Tailwind + Radix + “cybersigilism” design system. Deploys from `main` via Vercel.

---

## 2. Core User Flows

| Flow                 | Steps                                                                                                    | Status                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| **Sign up / Log in** | Signup (email + password + username) → email verification → login → redirect to home                     | ✅ Implemented                               |
| **Add garments**     | Go to Add → fill form (name, category, color, season, material, photo) → upload → garment in closet      | ✅ Implemented                               |
| **Browse closet**    | Closet page → grid of garments; filter by category/season                                                | ✅ Implemented                               |
| **Get outfit ideas** | Home (Today) → set mood + weather (auto or manual) → Generate → see scored outfit cards with explanation | ✅ Implemented                               |
| **Save outfit**      | On outfit card → Save → outfit persisted to Convex; appears in Archive                                   | ✅ Implemented                               |
| **View archive**     | Archive page → list of saved outfits with “I wore this”                                                  | ✅ Implemented (logging not wired)           |
| **Style insights**   | Home → after outfits, see gaps / complete-the-look / style tips                                          | ✅ Implemented                               |
| **Profile**          | Profile page → read-only name, username, email, wardrobe stats; Settings sub-route                       | ✅ Implemented (editable profile in backlog) |
| **Onboarding**       | Stub page only; full “complete profile” flow in backlog                                                  | ⚠️ Stub only                                 |

---

## 3. Existing Major Features

### Authentication

- **BetterAuth** 1.4.9 via `@convex-dev/better-auth`: email/password, username plugin, email verification (Resend).
- Auth routes mounted on Convex HTTP, proxied from Next.js `/api/auth/[...all]`.
- Middleware: session cookie check; unauthenticated users redirected to `/login`. Public routes: `/`, `/login`, `/signup`, `/check-email`, `/verify-email`.
- Current user: Convex `getCurrentUser` query; `useRequireAuth` for protected pages.

### Closet (Garments)

- Convex: `garments.list`, `create`, `update`, `remove`, `removeMany`, `generateUploadUrl`.
- Add page: full form + image upload (Convex storage). Closet page: grid, filters.
- Optional: `POST /api/analyze-garment-image` (Google Cloud Vision) for image analysis.

### Outfits and Recommendations

- **OutfitRecommendationService** (server): filter by context → generate candidates → score (color harmony, mood, diversity, user preferences) → rank; min score 60.
- **POST /api/recommendations**: accepts userId, mood, weather, temperature, garments; returns outfits + explanation. Client uses `useOutfitRecommendations` and passes garments from Convex.
- Convex: `outfits.list`, `save`, `remove`. Recommendation logs: `recommendationLogs.log` mutation exists but **is not called from the UI** (issue #15).

### Style Insights

- **styleInsightsService**: wardrobe gaps, complete-the-look, style/occasion tips (text-only).
- **POST /api/style-insights**: garments, optional outfitGarmentIds, mood, occasion, temperature → `{ gaps, completeTheLook, styleTips }`.
- Rendered in `StyleInsightsSection` on home.

### Commerce (Optional)

- **external_products** and **commerceInteractionLogs** in Convex; product providers (Amazon, Walmart, Macy’s, Best Buy, JSON feed); normalization in `server/commerce/normalize.ts`.
- **productRecommendationService**: scores external products by wardrobe fit; explainable justifications.
- **POST /api/product-recommendations**: optional; not shown on home by default. Commerce interaction logging consent-aware.

### Profile and Navigation

- Profile: read-only identity, wardrobe stats, My Closet, Sign out. Profile/settings route layout; editable profile, avatar, password/email, delete account in docs/issues.
- Bottom nav: Today, Mood, Closet, Add, Archive; theme toggle. No-nav routes centralized in `lib/routes.ts`.

### DevOps and Quality

- CI: format-check, lint, typecheck, test, build, docs-consistency, security audit (`.github/workflows/ci.yml`).
- Seed: `seedDevCloset`, `seedClosetForUserId`, `createTestAccount`. Vitest for unit tests; E2E in backlog.

---

## 4. Architecture Overview

```
Client (Next.js App Router / React)
        ↓
Next.js (API routes + Convex React client)
        ↓
Convex Cloud (DB, server functions, BetterAuth, file storage)
        +
Next.js API routes → OutfitRecommendationService / StyleInsightsService / ProductRecommendationService
        ↓
External: Open-Meteo (weather), Google Vision (optional), Resend (email), retailer APIs (optional)
```

- **Data:** Convex is source of truth (garments, outfits, recommendationLogs, userPreferences, profiles, external_products, commerceInteractionLogs). BetterAuth stores users/sessions in Convex.
- **API surface:** Convex queries/mutations for CRUD; Next.js routes for recommendations, style-insights, product-recommendations, analyze-garment-image, auth proxy.
- **Caching:** No application-level caching documented; weather could use TTL (docs mention 5 min).
- **Storage:** Convex file storage for garment (and optional profile) images; signed upload URLs via Convex mutations.
- **Patterns:** Shared types in `shared/`; design system in `apps/web` (style page, Brutalist\* components, design tokens).

---

## 5. Limitations or Missing Capabilities

- **Recommendation logging:** `recommendationLogs.log` is never called from the frontend (shown/saved/skipped/worn). No analytics or learning from feedback yet.
- **Onboarding:** Only a stub; no guided “complete profile” or checklist flow.
- **Profile/settings:** Editable profile (name, username, avatar), change password/email, delete account, sessions/2FA are in issue docs but not implemented.
- **UX polish:** Loading skeletons, consistent toasts, empty states with CTAs, and friendly error handling are partially done (issue #19).
- **Password reset:** Forgot-password flow not implemented (issue #22).
- **Closet search:** No search-by-name (issue #18).
- **Weather fallback:** Manual city input when geolocation denied is in backlog (issue #17).
- **Score breakdown UI:** Expand outfit for category-level scores (issue #21); data exists in service.
- **Storefront:** Product suggestions require provider config; not on home by default; Amazon PA-API deprecated 2026.
- **E2E tests:** Not implemented (issue #29).
- **Accessibility:** Audit and fixes in backlog (issue #28).
- **Rate limiting / validation:** No documented API rate limiting or request validation layer.
- **Monitoring / logging:** No structured app logging or monitoring beyond CI and Convex dashboard.

---

_Last updated: as part of product expansion analysis._
