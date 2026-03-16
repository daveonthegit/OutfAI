# OutfAI — Product Gaps

> Missing functionality that prevents the project from being full production-ready.  
> Used to drive FEATURE_EXPANSION.md and EXPANSION_ROADMAP.md.

---

## Product Features

| Gap                              | Description                                                                                                                                       | Impact                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Recommendation loop**          | Implemented: `recommendationLogs.log` is called from Today (shown/saved/skipped) and Archive (worn).                                              | Learning pipeline (issue #27) can use logs.                               |
| **Onboarding incomplete**        | Onboarding is a stub page. No "complete profile" flow or checklist (issues #8, #9).                                                               | New users lack guidance; lower activation and retention.                  |
| **Profile/settings incomplete**  | Editable profile (name, username, avatar), change password/email, delete account, sessions/2FA are documented but not implemented (issues #1–#6). | Users cannot fully manage identity or account; trust and compliance gaps. |
| **Missing CRUD for preferences** | `userPreferences` table exists; no UI to set favorite moods, preferred styles/colors, avoided colors (issue #7).                                  | Recommendations cannot be personalized from explicit preferences.         |
| **No closet search**             | Cannot search garments by name (issue #18).                                                                                                       | Poor discoverability in large closets.                                    |
| **No data export**               | "Download my data" / GDPR-style export not implemented (issue #10).                                                                               | Compliance and user trust gap.                                            |
| **Activity/stats on profile**    | No activity or stats on profile (issue #11).                                                                                                      | Missed engagement and transparency.                                       |
| **Quick actions / help**         | No quick actions or in-app help on profile (issue #12).                                                                                           | Self-serve support missing.                                               |
| **Display name vs username**     | Display name and profile visibility not implemented (issue #13).                                                                                  | Limited profile customization.                                            |
| **Invite/referral**              | No invite or referral flow (issue #14).                                                                                                           | No growth loop.                                                           |
| **Manual weather fallback**      | Implemented (Phase 1): city input when geolocation denied; Open-Meteo geocoding + forecast.                                                       | —                                                                         |
| **Score breakdown UI**           | Implemented (Phase 1): API returns scoreBreakdown; outfit card "See why" expandable (issue #21).                                                  | —                                                                         |
| **Explicit Skip on outfits**     | Implemented: Skip button on cards with "skipped" logging (issue #15).                                                                             | —                                                                         |
| **Storefront default-off**       | Product suggestions require provider config; not on home by default.                                                                              | Optional commerce underused without clear enable path.                    |
| **Outfit calendar**              | No plan outfits for upcoming days (issue #24).                                                                                                    | No forward planning.                                                      |
| **Packing planner**              | No trip/capsule wardrobe (issue #25).                                                                                                             | Missing use case for travelers.                                           |
| **Social features**              | No share outfits or community feed (issue #32).                                                                                                   | No viral or retention hook.                                               |
| **Mobile app**                   | Web only; no React Native/Expo app (issue #31).                                                                                                   | Mobile-native experience missing.                                         |

---

## AI / Intelligence

| Gap                             | Description                                                                                                                         | Impact                                                 |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **No learning from feedback**   | Recommendation logs not wired; no pipeline to improve scoring from saved/skipped/worn (issue #27).                                  | Engine stays rule-based; no personalization over time. |
| **AI vision auto-tagging**      | Optional Google Vision API exists; not required. Full "extract tags from photo" flow and UX not complete (issue #26).               | Manual tagging burden remains.                         |
| **Garment auto-tagging stub**   | Rules-based defaults by category exist (`getDefaultTagsForGarment`); no UI to show "suggested tags" or one-click apply (issue #30). | New users may leave tags empty.                        |
| **No embeddings or similarity** | No garment or outfit embeddings for "similar items" or semantic search.                                                             | Limited discovery and recommendation sophistication.   |
| **No classification pipeline**  | No automated classification of garments (e.g. occasion, formality) beyond rules.                                                    | Heavier reliance on manual tags.                       |

---

## Data Architecture

| Gap                                          | Description                                                                              | Impact                                         |
| -------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------- |
| **Single index on garments**                 | Only `by_userId`; no index by category, season, or tags.                                 | Filtered list queries may not scale optimally. |
| **No composite indexes for recommendations** | recommendationLogs only `by_userId`; no time-range or action-type indexes for analytics. | Analytics queries may be slow as data grows.   |
| **external_products scaling**                | Products stored in Convex; no sync/refresh strategy or TTL for feeds.                    | Stale or unbounded growth if many providers.   |
| **No soft delete**                           | Garments/outfits are hard-deleted.                                                       | No "undo" or audit trail.                      |
| **No schema versioning/migrations**          | Convex schema changes are additive; no formal migration docs for breaking changes.       | Risk when evolving schema.                     |

---

## Infrastructure

| Gap                             | Description                                                                                  | Impact                                                     |
| ------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **No E2E tests**                | Only unit tests (Vitest); no Playwright/Cypress for critical flows (issue #29).              | Regressions possible on auth, add garment, generate, save. |
| **CI does not run E2E**         | E2E not in CI.                                                                               | Broken flows can reach main.                               |
| **No structured logging**       | No app-level logging to external system (e.g. structured JSON, log aggregation).             | Hard to debug production issues.                           |
| **No monitoring/alerting**      | No APM, error tracking, or uptime alerts beyond Convex/Vercel defaults.                      | Slower incident response.                                  |
| **No rate limiting**            | API routes (recommendations, style-insights, product-recommendations) have no rate limiting. | Abuse and cost risk.                                       |
| **Error handling inconsistent** | Some errors surface as raw messages or uncaught; no global error boundary strategy.          | Poor UX and debugging.                                     |
| **No feature flags**            | Cannot turn features on/off without deploy.                                                  | Hard to do gradual rollouts or kill switches.              |

---

## Security

| Gap                        | Description                                                                                         | Impact                                 |
| -------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **Password reset missing** | Forgot-password flow not implemented (issue #22).                                                   | Locked-out users cannot self-serve.    |
| **No rate limiting**       | Auth and API endpoints not rate-limited.                                                            | Brute-force and abuse risk.            |
| **Input validation**       | Convex validators and Zod used in places; no centralized request validation doc for all API routes. | Risk of invalid or oversized payloads. |
| **Access control**         | Convex functions use `getAuthUser`; no document-level "user can only access own X" audit doc.       | Assumed but not formally documented.   |
| **Secrets and env**        | Secrets in Convex env and .env; no doc for rotation or least-privilege.                             | Operational security debt.             |
| **Sessions/2FA**           | No connected sessions or 2FA (issue #6).                                                            | Higher-risk accounts less protected.   |

---

## UX

| Gap                   | Description                                                                                         | Impact                                         |
| --------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| **Desktop vs mobile** | Layout is responsive; some touch targets and spacing may not be optimized for all viewports.        | Inconsistent experience on small screens.      |
| **Empty states**      | Some lists lack clear empty state + CTA (issue #19).                                                | Dead ends and confusion.                       |
| **Loading states**    | Not every async path has skeleton or loading UI (issue #19).                                        | Perceived slowness or blank screens.           |
| **Toasts**            | Sonner exists; not used consistently for all success/error (issue #19).                             | Inconsistent feedback.                         |
| **Accessibility**     | No formal a11y audit; focus order, labels, contrast, screen reader not fully validated (issue #28). | Excludes some users and may violate standards. |
| **Swipe gestures**    | No swipe on outfit cards (issue #20).                                                               | Mobile interaction not fully leveraged.        |
| **Score breakdown**   | Expandable score breakdown not in UI (issue #21).                                                   | Explainability underused.                      |

---

_Last updated: as part of product expansion analysis._
