# OutfAI Codebase Review

Date: 2026-03-27

## 1. Executive Summary

### Overall Quality Assessment

OutfAI has a polished UI surface, but the implementation underneath still behaves more like an ambitious MVP than a production-capable foundation. The app shows strong product intent, but core flows still rely on prototype-era shortcuts in authentication, data modeling, upload handling, and recommendation orchestration.

### Biggest Technical Risks

- Secrets exposure via environment loading in the Next.js app.
- Weak authentication enforcement on non-auth API routes.
- Missing ownership validation for referenced garment IDs in some Convex mutations.
- Garment image storage modeled around `imageUrl` instead of durable storage references.
- Recommendation logic that cannot represent important real-world cases such as outerwear and explicit occasion handling.

### Biggest Product Risks

- Empty wardrobes are auto-seeded with mock items, which breaks trust and hides the real first-run experience.
- The app collects preference data that the main recommendation flow does not really use.
- Important actions in archive and outfit views depend on hover behavior that does not translate well to mobile.
- The recommendation experience presents as AI-assisted, but much of the product value is still rigid heuristics.

### Product Maturity Assessment

This repo is beyond a raw prototype, but it is not yet a strong long-term production foundation. The best label is: polished MVP with meaningful technical debt and several security issues that should be addressed before scale.

## 2. Findings Table

| Severity | Category             | Location                                                                                                                                                                                                                  | Issue                                                                                              | Why it matters                                                                          | Recommended fix                                                                                           |
| -------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| critical | security             | `apps/web/next.config.ts`                                                                                                                                                                                                 | Loads root `.env.local` and injects all values into `nextConfig.env`                               | This can expose non-public secrets to client bundles if they exist in the root env file | Remove blanket env injection and explicitly expose only `NEXT_PUBLIC_*` values                            |
| critical | security             | `convex/auth.ts`                                                                                                                                                                                                          | `minPasswordLength: 1` in auth config                                                              | This is far below acceptable account security for a real product                        | Raise password requirements and move test-account behavior to a dev-only path                             |
| high     | security             | `apps/web/middleware.ts`, `apps/web/app/api/recommendations/route.ts`, `apps/web/app/api/analyze-garment-image/route.ts`, `apps/web/app/api/style-insights/route.ts`, `apps/web/app/api/product-recommendations/route.ts` | Protected API routes rely on cookie presence or no auth check at all                               | Callers can hit expensive or sensitive routes without verified server auth              | Verify auth inside each route and add request size/rate controls                                          |
| high     | security             | `convex/outfits.ts`, `convex/packingLists.ts`                                                                                                                                                                             | `garmentIds` are accepted without validating ownership                                             | Users can create outfits or trips containing garments they do not own if IDs leak       | Resolve each garment ID and enforce `garment.userId === currentUser._id`                                  |
| high     | security             | `convex/profile.ts`                                                                                                                                                                                                       | `getByUserId` is publicly queryable despite being labeled internal use                             | Arbitrary profile docs can be looked up by user ID                                      | Make it internal-only or add strict auth/privacy checks                                                   |
| high     | security             | `convex/externalProducts.ts`                                                                                                                                                                                              | Any authenticated user can upsert shared external product data                                     | One user can poison shared catalog data or inject bad links                             | Move ingestion to internal/admin-only actions                                                             |
| high     | reliability          | `convex/account.ts`                                                                                                                                                                                                       | Account deletion removes app docs but not the Better Auth account or garment blobs                 | Privacy expectations are violated and users may still be able to sign back in           | Implement full account deletion across auth, storage, and application data                                |
| high     | architecture         | `convex/garments.ts`, `convex/schema.ts`                                                                                                                                                                                  | Garments persist `imageUrl` but not `storageId`                                                    | You cannot safely replace, delete, or re-resolve uploaded garment media                 | Store durable `storageId` and derive URLs on read                                                         |
| high     | security             | `apps/web/app/add/page.tsx`, `apps/web/app/profile/page.tsx`, `convex/garments.ts`, `convex/profile.ts`                                                                                                                   | Upload validation is mostly client-side                                                            | Client checks are easy to bypass and upload abuse is possible                           | Validate file type/size server-side before associating uploads with records                               |
| high     | product logic        | `server/services/outfitRecommendationService.ts`                                                                                                                                                                          | Candidate generation never includes outerwear                                                      | Cold and rainy recommendations can be obviously wrong                                   | Make outerwear an optional or required layer based on weather and temperature                             |
| high     | product logic        | `server/services/outfitRecommendationService.ts`                                                                                                                                                                          | `occasion` exists in input but is not used in generation or scoring                                | Event-based planning will feel fake and unreliable                                      | Thread `occasion` through filtering, ranking, and explanation                                             |
| high     | product/ux           | `convex/seed.ts`, `apps/web/components/home/authenticated-home.tsx`                                                                                                                                                       | Real users with empty closets are auto-seeded with mock garments                                   | This hides the real empty-state UX and damages recommendation trust                     | Make seeding dev-only and show a true onboarding/empty state                                              |
| high     | architecture         | `apps/web/components/outfit-recommendation-card.tsx`, `apps/web/app/archive/page.tsx`, `apps/web/app/outfit/page.tsx`                                                                                                     | The outfit page uses query-string JSON as a data transport                                         | This is brittle, user-tamperable, and can exceed URL limits                             | Route by stable outfit or recommendation ID and load canonical data                                       |
| medium   | performance          | `convex/outfits.ts`, `convex/userPreferences.ts`, `convex/outfitPlans.ts`                                                                                                                                                 | Full collection scans and N+1 reads are common                                                     | Archive, profile, calendar, and learned preferences will degrade as data grows          | Add pagination, indexed range access, and denormalized read models                                        |
| medium   | data/domain          | `convex/schema.ts`, `shared/types/index.ts`                                                                                                                                                                               | Domain fields are mostly free-form strings and there is type drift across layers                   | Inconsistent data will accumulate and make future features harder to build safely       | Move more invariants into validators and align generated/shared types                                     |
| medium   | architecture         | `apps/web/app/layout.tsx`, `apps/web/components/providers.tsx`, `apps/web/components/home/authenticated-home.tsx`                                                                                                         | Main app flows are heavily client-driven and the home surface is a large orchestrator component    | This makes loading behavior, testing, and future refactors harder                       | Split route shells from smaller client islands and move more reads server-side                            |
| medium   | performance          | `apps/web/next.config.ts`                                                                                                                                                                                                 | `images.unoptimized: true` in an image-heavy app                                                   | Mobile users pay the full image cost and remote images are not optimized                | Configure proper image optimization and allowed remote sources                                            |
| medium   | uiux / accessibility | `apps/web/app/outfit/page.tsx`, `apps/web/app/archive/page.tsx`, `apps/web/app/closet/page.tsx`                                                                                                                           | Important information and actions depend on hover states, and some overlays are custom non-dialogs | Mobile and keyboard accessibility are weakened                                          | Replace hover-only affordances with explicit mobile-safe controls and use accessible dialogs consistently |
| medium   | product logic        | `apps/web/components/home/authenticated-home.tsx`, `apps/web/app/profile/page.tsx`                                                                                                                                        | Preferences are collected and stored, but the main recommendation flow does not fetch or use them  | Users will not believe the system is learning their style                               | Fetch preferences in the home flow and reflect them in ranking and explanations                           |
| low      | testing              | `e2e/critical-path.spec.ts`                                                                                                                                                                                               | E2E coverage barely touches real core flows                                                        | Regressions in uploads, archive, planning, and recommendation trust will slip through   | Expand E2E coverage around the actual product-critical paths                                              |

## 3. Deep Review By Category

### Architecture

The architecture is not cleanly partitioned. Business logic lives in Convex mutations, Next API routes, server-side services, and client hooks at the same time. There is also legacy surface area still present, including old tRPC router code with mock behavior, which increases maintenance cost and ambiguity.

The biggest boundary problem is that canonical product flows are not clearly owned by one backend layer. Recommendations, style insights, and product recommendations all run through stateless Next API routes that accept user-supplied wardrobe payloads instead of resolving canonical data server-side. That weakens trust, security, and maintainability.

### Next.js / React

The app leans too hard on client components. `apps/web/components/home/authenticated-home.tsx` is doing geolocation, weather fetching, dev seeding, recommendation orchestration, logging, selection state, and grid rendering in one large component. That is already hard to reason about and will become painful to scale.

The root app shell is also heavily client-driven because `Providers`, `OnboardingGuard`, page transitions, theme handling, and app shell composition all sit in `apps/web/app/layout.tsx`. This creates blank render windows and makes server/client separation weaker than it should be for a Next.js App Router codebase.

### Convex

Some Convex ownership checks are good, but they are not consistently applied. Garment lookup and removal validate ownership, but outfit and packing-list mutations trust referenced garment IDs. External product writes are especially risky because they are shared data but are writable by any authenticated user.

Query design is also still MVP-level. Several queries read a whole collection and then resolve nested docs with N+1 `ctx.db.get` patterns. That is tolerable for small user datasets, but not for long-term growth in wardrobe history, archive size, calendar usage, or learned preference derivation.

### Data / Domain Modeling

The garment model is underspecified for an image-heavy wardrobe app. It tracks `imageUrl` but not durable storage identity, which means you cannot safely support replacement, deletion, cleanup, or long-lived media rendering. This is one of the clearest signs that the repo still carries prototype assumptions.

The schema also uses too many unconstrained strings for domain-critical concepts like category, action, season, weather, and recommendation context. Shared types know more than the storage layer does, so invalid or inconsistent values can enter the system and quietly degrade recommendation quality.

### Recommendation / AI Pipeline

The recommendation system is explainable but still shallow. It is essentially a rule engine, which is fine for an MVP, but the current rules omit key apparel realities. The most obvious example is that outerwear is never part of generated outfit candidates, even though weather sensitivity is a central product promise.

There is also a mismatch between what the product implies and what the pipeline actually does. Users are asked for preferences and style goals, but the main home flow does not pull those preferences into the recommendation call. That creates a gap between claimed personalization and real personalization.

### Uploads / Image Handling

Garment uploads have a reasonably good client-side compression step, but the overall backend design is weak. The server generates upload URLs and then accepts `storageId`, but the resulting garment only stores a transient-looking URL field and not the storage reference.

Avatar handling is better than garment handling, which makes the garment implementation look even less mature by comparison. For a wardrobe product, garment media should be the more robust path, not the weaker one.

### Security

The strongest security finding is secret handling. `apps/web/next.config.ts` reads the root `.env.local` and injects everything into the app config, which is exactly the kind of convenience hack that can leak server-only credentials into a client bundle.

The second major issue is trust boundaries. Several Next API routes do not verify auth server-side, and middleware only checks whether a cookie exists. That may be acceptable as a UX redirect heuristic, but it is not sufficient protection for routes that invoke paid services or process user wardrobe data.

### Performance

The app will struggle first on reads, then on images. The Convex layer repeatedly collects broad result sets and resolves nested docs one by one. At the same time, the web app has disabled Next image optimization entirely, which is a poor fit for a product centered on wardrobe photos and image-rich cards.

The home page also does too much orchestration in one client component, which increases render churn and makes it harder to isolate expensive work. This is especially noticeable around recommendation generation, wardrobe mapping, and UI state management.

### UI / UX

The visual design is ahead of the product ergonomics. The app looks intentional, but some core flows are still avoiding the hard product problems instead of solving them. The clearest example is the empty wardrobe experience, where the system seeds mock garments rather than forcing a clean first-run flow.

There is also a mobile parity issue. Archive actions, closet detail overlays, and some explanation affordances are hover-centric. That works on desktop demos but creates friction or invisibility on touch devices, especially in a consumer product where mobile use matters.

### Accessibility

Accessibility is uneven. Some parts use solid Radix primitives, but others fall back to custom overlays and hover-only reveal patterns. `apps/web/app/outfit/page.tsx` uses a custom full-screen overlay for garment details instead of the dialog primitives used elsewhere, which weakens consistency and accessibility support.

Forms and labels are generally better than average, but keyboard and screen-reader behavior around image cards, archive actions, and non-hover alternatives still need work.

### Reliability / Edge Cases

The code handles some edge states, but often cosmetically rather than structurally. Denied location permission falls back to manual city entry, but that path is still awkward. Empty wardrobe behavior is masked by mock seeding. Garment uploads can fail, but the model does not robustly support later correction or cleanup.

The outfit-detail route is especially brittle because it depends on encoded JSON in the URL. That will eventually break under longer explanations, larger outfits, copied links, or tampered payloads.

## 4. Top 10 Priority Fixes

1. Remove root env injection from `apps/web/next.config.ts`.
2. Raise password requirements in `convex/auth.ts`.
3. Add real server auth and rate limiting to all non-auth API routes.
4. Enforce garment ownership in `convex/outfits.ts` and `convex/packingLists.ts`.
5. Redesign garment uploads to persist `storageId`, not only `imageUrl`.
6. Remove automatic mock closet seeding from real user home flow.
7. Replace query-string outfit payloads with canonical IDs.
8. Make `external_products` ingestion internal or admin-only.
9. Update recommendation generation to include outerwear and explicit occasion handling.
10. Implement real account deletion across auth, storage, and application data.

## 5. Quick Wins

- Re-enable Next image optimization with proper configuration.
- Replace hover-only archive actions with always-visible mobile-safe actions.
- Fetch user preferences in the home recommendation flow and pass them into ranking.
- Add enum-like validation for category, action, mood, weather, and season at the schema or mutation boundary.
- Add pagination or range queries for archive, calendar, and preference derivation.
- Replace the custom outfit overlay with the dialog primitives already used elsewhere.

## 6. Manual Verification Checklist

- Hit `/api/analyze-garment-image` and `/api/recommendations` without verified auth and confirm whether they are truly protected.
- Verify whether any non-public env values appear in client-rendered code.
- Upload a non-image file directly to the generated upload URL and see whether it can still be attached to a garment or avatar.
- Delete an account and then try signing back in with the same credentials.
- Add outerwear, switch to cold or rainy conditions, and verify whether recommendations ever include it.
- Pass explicit occasion context and verify whether recommendation results change.
- Test archive actions on touch devices.
- Try long explanations or large outfits and check when the query-string outfit route breaks.
- Verify whether stored garment image URLs remain valid after time passes.
- Disable mock seeding and test the true empty-closet first-run experience.

## Second Pass

### 1. The 10 Most Likely Real-World Production Bugs

1. Outfit detail routing breaks because encoded JSON in the URL gets too large.
2. Cold-weather outfits omit the user’s jacket because outerwear is never included in candidate generation.
3. Occasion-aware planning appears broken because `occasion` is accepted but ignored.
4. Garment images become stale or orphaned because garments do not store `storageId`.
5. Account deletion appears successful but the user can still sign back in.
6. Archive actions are effectively hidden on touch devices.
7. Calendar, archive, and profile stats slow down badly as saved outfits grow.
8. Weather permission denial leaves users in an awkward fallback state.
9. Mock garments contaminate real user wardrobes.
10. Build instability around Next/SWC version drift causes avoidable deployment failures.

### 2. The 10 Most Likely Security Issues

1. Secret leakage via `apps/web/next.config.ts`.
2. Weak password policy via `convex/auth.ts`.
3. API route access without verified server auth.
4. Upload abuse or cost abuse on image-analysis endpoints.
5. Cross-tenant garment references in outfits and packing lists.
6. Public profile lookup by arbitrary user ID.
7. Shared external product catalog poisoning by regular users.
8. Missing server-side file validation for uploads.
9. Misleading account deletion that leaves auth identity intact.
10. Weak schema validation allowing malformed business data into core tables.

### 3. The 10 Most Likely Reasons Users Would Abandon the Product

1. The app claims personalization but recommendations do not visibly learn from saved preferences.
2. Sample garments blur what is real and reduce trust.
3. Adding garments is still too manual for an image-centric wardrobe product.
4. Recommendations feel repetitive once the novelty wears off.
5. Weather-aware suggestions feel obviously wrong in layered or cold-weather cases.
6. Archive and planning flows are awkward on mobile.
7. The app does not clearly explain why a recommendation is good in a trustworthy way.
8. Empty and failure states are masked instead of solved.
9. Upload management feels fragile if an image fails or needs replacement.
10. The UI looks premium, but the interaction model still feels like an early build.

## Verification Notes

- `npm run typecheck` passed locally in this environment.
- `npm run lint` passed with warnings.
- `npm test` and `npm run build` could not be fully validated in this sandbox because Node child-process spawning failed with `EPERM`.
- The build also emitted a real `@next/swc` version mismatch warning before failing.
