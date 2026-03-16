# OutfAI — Expansion Roadmap

> Phased roadmap to expand capabilities and long-term value.  
> Features are drawn from [FEATURE_EXPANSION.md](../product/FEATURE_EXPANSION.md) and [PRODUCT_GAPS.md](../product/PRODUCT_GAPS.md).  
> Each phase includes implementation notes.

---

## Phase 1 — Critical Improvements

Focus: Close the recommendation loop, improve trust and safety, and fix high-impact UX gaps so the product is production-ready and learnable.

| #   | Feature                                  | Implementation notes                                                                                                                                                                                                                                                                                                                                                                          | Depends on |
| --- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | **Wire recommendation logs in UI**       | Call `api.recommendationLogs.log` from authenticated home: (1) after outfits are returned from generate → log "shown" per batch with garmentIds, mood, weather; (2) on Save → log "saved" with outfitId and garmentIds, then save outfit; (3) add Skip/Next button on cards → log "skipped"; (4) archive/outfit detail "I wore this" → log "worn". No schema change. Reuse existing mutation. | —          |
| 2   | **Password reset (forgot password)**     | Add "Forgot password?" on login; page/modal for email → `authClient.forgetPassword`. BetterAuth reset flow; Resend for email. Reset confirmation page from magic link. Toasts. See docs/issues/22-password-reset.md.                                                                                                                                                                          | —          |
| 3   | **Loading states, toasts, empty states** | Skeleton loaders for closet grid and outfit cards (Convex useQuery loading). Use Sonner consistently for create/update/delete/save and API errors. Empty states: closet → "No garments yet" + CTA to /add; no outfits → message + "Add more items"; archive → "No saved outfits" + CTA. See docs/issues/19-loading-empty-states.md.                                                           | —          |
| 4   | **Score breakdown UI**                   | Ensure recommendation API returns per-category scores (e.g. colorHarmony, moodAlignment, diversity). Outfit card: expandable section or "See why" showing breakdown bars/list. Reuse BrutalistCard and tokens.                                                                                                                                                                                | —          |
| 5   | **Manual weather fallback**              | Weather block on Today/style: "Enter city" option. Geocode city (Open-Meteo or API) → fetch weather. Pass to recommendations. Optional: store last city in userPreferences.                                                                                                                                                                                                                   | —          |

**Exit criteria for Phase 1:** Recommendation loop is closed (logs in Convex); users can reset password; main flows have loading/empty states and toasts; users can see score breakdown and set weather by city.

**Status (implemented):** All five Phase 1 items are complete. See [PHASE_1_SUMMARY.md](./PHASE_1_SUMMARY.md).

---

## Phase 2 — Product Expansion

Focus: Complete profile/settings, onboarding, preferences, and discoverability so the product feels complete and personal.

| #   | Feature                                       | Implementation notes                                                                                                                                                                                                                                                | Depends on                  |
| --- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| 1   | **User preferences UI**                       | Convex userPreferences: ensure get (or getOrCreate) and update mutations. Settings or Profile: form for favoriteMoods, preferredStyles, preferredColors, avoidedColors. OutfitRecommendationService already uses preferences.                                       | —                           |
| 2   | **Editable profile (name, username, avatar)** | BetterAuth update user for name/username. Convex profile update for bio; Convex generateUploadUrl + store avatarStorageId. Profile edit page: form + avatar upload. See docs/issues/01-editable-profile.md, 02-profile-image-upload.md.                             | —                           |
| 3   | **Complete onboarding flow**                  | Onboarding route (no nav). Steps: profile completion, add first garment (or skip), optional preferences. Checklist: add 3 garments, generate outfit, save outfit. Redirect new users to onboarding until completed; store completion in profile or userPreferences. | Editable profile (optional) |
| 4   | **Closet search by name**                     | garments.list: add optional `search` arg; in handler filter by name substring (or add index by_userId_name if Convex supports). Closet page: search input, debounced, update query.                                                                                 | —                           |
| 5   | **Delete account**                            | Convex mutation: delete all user data (garments, outfits, recommendationLogs, userPreferences, profiles, commerceInteractionLogs). Call BetterAuth delete user. Settings: danger zone, confirm (e.g. type "DELETE"). Redirect to /.                                 | —                           |
| 6   | **Data export**                               | Convex mutation or HTTP action: gather user's garments, outfits, profile; optional recommendationLogs. Return JSON or write to storage and email link. Rate limit. Settings: "Download my data" button.                                                             | —                           |
| 7   | **Account settings (change password, email)** | BetterAuth flows for change password and change email; use existing Resend for verification. Settings: separate sections for password and email with forms. See docs/issues/03-account-password-email.md.                                                           | —                           |

**Exit criteria for Phase 2:** Users can edit profile, set preferences, complete onboarding, search closet, delete account, export data, and change password/email.

**Status (implemented):** All seven Phase 2 items are complete. See [PHASE_2_SUMMARY.md](./PHASE_2_SUMMARY.md).

---

## Phase 3 — Platform Features

Focus: Calendar, packing, style insights refinement, optional commerce visibility, and infrastructure for scale and reliability.

| #   | Feature                                 | Implementation notes                                                                                                                                                                                                                         | Depends on                |
| --- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| 1   | **Outfit calendar**                     | Schema: outfit_plans (userId, date, outfitId) or plannedDate on outfits. Convex: list by date range, assign, remove. New route: calendar view (week/month), assign outfit to day from archive or "Plan for…".                                | —                         |
| 2   | **Packing planner**                     | Schema: packing_lists (userId, name, startDate, endDate, garmentIds). Convex CRUD. Packing page: create trip, multi-select garments from closet, generate outfits from packed set only. Optional "Suggest items to add" from style insights. | —                         |
| 3   | **Activity and stats on profile**       | Convex queries: counts (garments, outfits, saved this week). Optional aggregation from recommendationLogs. Profile: "Your activity" section with cards.                                                                                      | Recommendation logs wired |
| 4   | **Weather API abstraction and caching** | Next.js GET /api/weather?lat=&lon= or ?city=. Server-side cache (e.g. 5–10 min TTL). Open-Meteo from server. Client calls this instead of direct; manual city uses ?city=.                                                                   | —                         |
| 5   | **E2E tests**                           | Playwright (or Cypress): sign up/login → add garment → generate outfits → save. Use test account and seed. Add to CI or nightly. See docs/issues/29-e2e-tests.md.                                                                            | —                         |
| 6   | **Accessibility audit and fixes**       | Run axe/Lighthouse on login, signup, closet, Today, profile. Fix focus order, labels, contrast, aria; document limitations. See docs/issues/28-accessibility-audit.md.                                                                       | —                         |
| 7   | **Storefront visibility and config**    | Optional: enable product suggestions on home when provider is configured; or add "Shop" tab. Internal: doc or simple admin view of provider status (no secrets).                                                                             | —                         |

**Exit criteria for Phase 3:** Calendar and packing are usable; profile shows activity; weather is cached; E2E covers critical path; a11y improved; optional commerce has a clear path.

---

## Phase 4 — Long-Term Innovation

Focus: AI improvement, learning, automation, and optional social/mobile.

| #   | Feature                              | Implementation notes                                                                                                                                                                                                                                                     | Depends on                |
| --- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------- |
| 1   | **Learning pipeline**                | Use recommendationLogs (shown/saved/skipped/worn). Periodic job or on-log: compute per-user scoring weights; store in userPreferences or user_scoring_weights. OutfitRecommendationService reads weights; keep explanations. Optional "Because you liked similar" in UI. | Recommendation logs wired |
| 2   | **AI vision auto-tagging**           | Extend POST /api/analyze-garment-image to return category, color, material, season, tags. Add garment form: "Suggest from photo" → pre-fill; handle errors. Optional cap for cost. See docs/issues/26-ai-vision-autotagging.md.                                          | —                         |
| 3   | **Garment auto-tagging stub in UI**  | Surface getDefaultTagsForGarment in add/edit form as "Suggested tags"; one-click add. See FEATURE_EXPANSION §15.                                                                                                                                                         | —                         |
| 4   | **Scheduled recommendation digest**  | userPreferences: digestEnabled, digestTime. Convex cron: for opted-in users, generate one outfit, send email via Resend. Settings: toggle and time.                                                                                                                      | —                         |
| 5   | **Sync external product feeds**      | Convex cron or HTTP action: fetch from providers, normalize, upsert external_products. Optional last_sync tracking.                                                                                                                                                      | —                         |
| 6   | **Sessions and 2FA (optional)**      | BetterAuth plugins for sessions list and 2FA. Settings: show sessions, revoke; enable 2FA. See docs/issues/06-sessions-2fa.md.                                                                                                                                           | —                         |
| 7   | **Social features (share, feed)**    | Optional: share outfit as link or image; optional community feed. Large scope; split into smaller issues (share outfit, public outfit link, feed). See docs/issues/32-social-features.md.                                                                                | —                         |
| 8   | **Mobile app (React Native / Expo)** | Separate app; shared types and possibly API. Out of scope for this repo until decided. See docs/issues/31-mobile-app.md.                                                                                                                                                 | —                         |

**Exit criteria for Phase 4:** Learning pipeline improves recommendations over time; vision auto-tagging and tag suggestions reduce manual work; digest and product sync run; optional 2FA and social are scoped and started.

---

## Cross-Cutting

- **Rate limiting:** Add to Next.js API routes (recommendations, style-insights, product-recommendations, auth proxy) in Phase 1 or 2.
- **Structured logging:** Introduce structured logs (e.g. JSON) and optional aggregation in Phase 2 or 3.
- **Monitoring/alerting:** Error tracking and uptime in Phase 3.
- **Feature flags:** Optional in Phase 3 for gradual rollouts (e.g. calendar, packing).

---

## How to Use This Roadmap

- **Prioritization:** Phase 1 first; then Phase 2 for completeness; Phase 3 for platform; Phase 4 for differentiation.
- **Linking to issues:** Create or update GitHub issues from FEATURE_EXPANSION.md; tag with phase or milestone (e.g. Phase 1, Core Product).
- **Implementation:** Pick one feature per branch; follow existing patterns; add tests where appropriate. See FEATURE_EXPANSION.md for technical detail.

_Last updated: as part of product expansion analysis._
