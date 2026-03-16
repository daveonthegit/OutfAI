# OutfAI — Feature Expansion Proposals

> New capabilities to expand the project into a more powerful platform.  
> Each proposal includes: problem, user flow, technical architecture, schema, API, and frontend components.  
> Linked to PRODUCT_GAPS.md and EXPANSION_ROADMAP.md.

---

## Core Product Expansion

### 1. Wire Recommendation Logs in UI

**Problem:** Recommendation engine cannot learn from user behavior because "shown", "saved", "skipped", and "worn" are never logged.

**User flow:** User generates outfits → each shown set is logged as "shown". User taps Save → "saved" with outfitId. User taps Skip/Next → "skipped". From archive, user taps "I wore this" → "worn". No extra UI for logging; existing actions trigger logs.

**Technical architecture:** Frontend calls Convex `recommendationLogs.log` mutation after each action. Pass garmentIds, optional outfitId, mood, weather. No new service; Convex mutation already exists.

**Schema changes:** None (recommendationLogs already has required fields).

**Required API endpoints:** None (Convex mutation only). Optionally ensure POST /api/recommendations does not need to log "shown" if client does it after receive.

**Frontend components:** Authenticated home (Today): after generate, call log with action "shown" for each outfit batch. Outfit card: on Save, call log "saved" then outfits.save. Add Skip/Next button; on click call log "skipped". Archive / outfit detail: "I wore this" calls log "worn". Reuse existing Convex `api.recommendationLogs.log`.

---

### 2. User Preferences UI (Favorite Moods, Styles, Colors)

**Problem:** userPreferences table exists but users cannot set favorite moods, preferred styles/colors, or avoided colors; recommendations cannot personalize.

**User flow:** User opens Profile → Settings (or Preferences). Sets favorite moods (multi-select), preferred styles, preferred colors, avoided colors. Save. Recommendation engine already reads preferences when present.

**Technical architecture:** Convex mutations/queries for userPreferences (getOrCreate, update). OutfitRecommendationService already accepts preferences. Add settings UI that reads and writes Convex.

**Schema changes:** None (userPreferences already defined).

**Required API endpoints:** Convex only: query to get preferences, mutation to update (or upsert by userId).

**Frontend components:** Profile settings page or new "Preferences" section: form with multi-select for moods, tag inputs for styles/colors, avoided colors. Use Convex useQuery(api.userPreferences.get) and useMutation(api.userPreferences.update). Link from profile/settings.

---

### 3. Complete Onboarding Flow (Complete Profile + Checklist)

**Problem:** New users land with no guidance; onboarding is a stub. Low activation and retention.

**User flow:** After signup/verify, redirect to onboarding. Step 1: Complete profile (name, optional avatar). Step 2: Add at least one garment (or "Skip for now"). Step 3: Optional mood/weather preferences. Checklist: "Add 3 garments", "Generate first outfit", "Save an outfit". Progress visible; optional reminder to complete.

**Technical architecture:** Onboarding route(s) with step state (URL or state). Convex: optional `profiles.onboardingCompletedAt` or `userPreferences.onboardingChecklist`. Middleware: after first login, redirect to onboarding if not completed (with escape).

**Schema changes:** Optional: `profiles.onboardingCompletedAt: v.optional(v.number())` or checklist flags in userPreferences.

**Required API endpoints:** Convex: update profile (existing or new fields), update userPreferences for checklist. No new HTTP API.

**Frontend components:** Onboarding layout (no bottom nav). Multi-step form or wizard. Checklist component (progress list). Redirect logic in layout or middleware.

---

### 4. Editable Profile (Name, Username, Avatar)

**Problem:** Profile is read-only; users cannot change name, username, or avatar.

**User flow:** Profile → Edit profile (or Settings). Change name, username, upload avatar. Save. BetterAuth for identity fields; Convex profiles for avatarStorageId/bio.

**Technical architecture:** BetterAuth update user (name, username); Convex profile update for bio and avatar (generateUploadUrl, store avatarStorageId). Validation: username uniqueness, rate limit on changes.

**Schema changes:** None for Convex (profiles already has avatarStorageId, updatedAt). BetterAuth user table managed by auth.

**Required API endpoints:** Auth: use BetterAuth client for update user. Convex: profile.update mutation, generateUploadUrl for avatar.

**Frontend components:** Profile edit form (name, username, avatar upload). Use authClient and Convex mutations. Show current avatar; crop/upload flow.

---

### 5. Password Reset (Forgot Password)

**Problem:** Users who forget password cannot self-serve; support burden and lockout.

**User flow:** Login page → "Forgot password?" → enter email → submit. Email with reset link (BetterAuth + Resend). User clicks link → set new password → redirect to login. Toasts for "Check your email" and errors.

**Technical architecture:** BetterAuth forgot-password and reset-password flows; Resend for email (already used for verification). Same Convex HTTP auth routes.

**Schema changes:** None (BetterAuth handles tokens).

**Required API endpoints:** BetterAuth endpoints (forgot-password, reset); already mounted on Convex HTTP and proxied.

**Frontend components:** Login page: "Forgot password?" link. New page or modal: email input, submit. Reset page: new password form (landed from email link). Use authClient.forgetPassword / reset flow. Toasts.

---

### 6. Data Export (Download My Data)

**Problem:** Users and compliance (e.g. GDPR) expect a way to download their data.

**User flow:** Profile → Settings → "Download my data". Request export. Option A: synchronous download (small accounts). Option B: "We'll email you a link" (async job). File: JSON or ZIP with garments, outfits, profile, recommendation logs (optional).

**Technical architecture:** Convex: export mutation or HTTP action that gathers user's garments, outfits, profile, optional recommendationLogs; format as JSON. If async: store export in Convex storage, send email with signed link (Resend). Rate limit: one export per N hours.

**Schema changes:** Optional: export_jobs table (userId, status, storageId, createdAt) for async exports.

**Required API endpoints:** Convex mutation or HTTP action `exportMyData` returning JSON or storage URL. Or Next.js API route that calls Convex and returns file.

**Frontend components:** Settings: "Download my data" button. Loading state; then download link or "Check your email" message.

---

### 7. Closet Search by Name

**Problem:** Large closets are hard to browse; no search by name.

**User flow:** Closet page: search input. Type name (or substring) → list filters to matching garments (client or server filter).

**Technical architecture:** Option A: Convex query with filter on name (requires index or full scan). Option B: Client-side filter on garments.list() result. For large closets, server-side with index is better.

**Schema changes:** Optional: Convex index on garments e.g. `by_userId_name` for prefix search if supported, or use existing list and filter in query.

**Required API endpoints:** Convex garments.list with optional `search: string`; in handler filter by name substring (or use index).

**Frontend components:** Closet page: search input above grid. Debounced input → update Convex query args or client filter. Clear button.

---

### 8. Manual Weather Fallback (City Input)

**Problem:** When geolocation is denied, users cannot get weather-based recommendations.

**User flow:** Style/Today page: weather section shows "Use my location" or "Enter city". If user chooses city, type city name → fetch weather by city (Open-Meteo geocoding + weather). Display weather and use in recommendation request.

**Technical architecture:** Client or Next.js API: geocode city (Open-Meteo or other) to lat/lon, then call weather API. Store last-used city in localStorage or userPreferences. Reuse existing weather display and recommendation payload.

**Schema changes:** Optional: userPreferences.lastWeatherCity for default.

**Required API endpoints:** Either client-side Open-Meteo geocoding + weather, or Next.js route GET /api/weather?city=... that returns same shape as current weather.

**Frontend components:** Weather block on Today/style: toggle or input "City". City search input, then show weather badge. Pass weather into useOutfitRecommendations as today.

---

## Advanced Features

### 9. Score Breakdown UI (Expand Outfit for Category Scores)

**Problem:** Engine returns per-category scores (color harmony, mood, etc.) but UI does not show them; explainability underused.

**User flow:** Outfit card: expand or "See why" → show breakdown (e.g. Color Harmony 15, Mood 12, Diversity 10, Base 50). Optional short reason per category.

**Technical architecture:** OutfitRecommendationService already returns or can return score breakdown; ensure API and types include category scores. Frontend displays in expandable section.

**Schema changes:** None (computed at request time).

**Required API endpoints:** POST /api/recommendations response already includes per-outfit data; extend type to include scoreBreakdown if not present.

**Frontend components:** Outfit card: expandable section or modal. Bar or list of category labels + scores. Use existing design tokens (BrutalistCard, etc.).

---

### 10. Outfit Calendar (Plan Outfits for Upcoming Days)

**Problem:** Users cannot plan what to wear in advance.

**User flow:** Calendar view (week/month). Tap day → assign a saved outfit (or generate and assign). View shows which days have an outfit. Optional: weather forecast for day and nudge if mismatch.

**Technical architecture:** New table or field: outfit_plans (userId, date, outfitId) or outfits.plannedDate. Convex queries: list by userId and date range. Calendar UI: fetch plans, display; mutation to assign/remove.

**Schema changes:** Option A: outfit_plans table (userId, date string YYYY-MM-DD, outfitId). Option B: add optional plannedDate to outfits and allow one outfit per user per date (or allow multiple via join table). Index by userId and date.

**Required API endpoints:** Convex: outfitPlans.list(range), outfitPlans.assign(date, outfitId), outfitPlans.remove(date). No new HTTP API.

**Frontend components:** Calendar page (new route). Week/month view (recharts or custom grid). Day cell: show assigned outfit thumbnail; click to assign or change. "Plan for…" from archive: date picker → assign.

---

### 11. Packing Planner (Trip Capsule Wardrobe)

**Problem:** Travelers cannot build a capsule wardrobe for a trip.

**User flow:** New "Packing" flow: set trip dates (and optional destination for weather). Select garments to pack (multi-select from closet). Generate outfit ideas from packed items only. Optional: "Suggest what to add" based on gaps and trip length.

**Technical architecture:** New concept: packing_list (userId, tripName, tripStart, tripEnd, garmentIds). Recommendations can filter to those garmentIds. Style insights could run on packed set for gaps.

**Schema changes:** packing_lists table: userId, name, startDate, endDate, garmentIds, createdAt. Index by userId.

**Required API endpoints:** Convex: packingLists.list, create, update, remove. POST /api/recommendations accepts optional garmentIds filter (already has garments array; can pass subset). Optional GET weather forecast for destination.

**Frontend components:** Packing page: create trip (name, dates), then "Add from closet" multi-select. List of packed items. Button "Generate outfits for trip" → recommendations with packed-only garments. Optional "Suggest items to add" from styleInsights.

---

### 12. Delete Account

**Problem:** Users cannot delete their account and data; compliance and trust.

**User flow:** Settings → Danger zone → "Delete account". Confirm (e.g. type "DELETE"). Delete all user data (garments, outfits, logs, profile, preferences) and then BetterAuth account. Redirect to landing with toast.

**Technical architecture:** Convex: deleteAccount mutation (or HTTP action) that deletes all documents for userId (garments, outfits, recommendationLogs, userPreferences, profiles, commerceInteractionLogs). Then call BetterAuth delete user. Require re-auth or token.

**Schema changes:** None (cascading deletes in mutation).

**Required API endpoints:** Convex mutation deleteAccount (and BetterAuth delete user). Or Next.js route that runs Convex mutations and auth delete.

**Frontend components:** Settings: "Delete account" button. Confirmation dialog (checkbox + type DELETE). Loading and success/error toast. Redirect to /.

---

## AI Features

### 13. AI Vision Auto-Tagging (Extract from Photo)

**Problem:** Manual tagging is tedious; new users may skip it, hurting recommendation quality.

**User flow:** Add garment: upload photo → "Analyze" → suggested category, color, material, season, tags. User confirms or edits → save.

**Technical architecture:** Existing POST /api/analyze-garment-image (Google Vision or similar). Return structured suggestions; frontend pre-fills form. Handle failures; optional daily cap.

**Schema changes:** None.

**Required API endpoints:** POST /api/analyze-garment-image (extend if needed) returns { category, primaryColor, material, season, tags[] }.

**Frontend components:** Add garment form: after image upload, "Suggest from photo" button. Pre-fill fields from API response; user can edit. Error state: "Could not analyze — fill in manually."

---

### 14. Learning Pipeline (Improve Scoring from Feedback)

**Problem:** Engine does not adapt to what the user saves or skips.

**User flow:** No direct UI change. Over time, recommendations shift toward styles/combos user saves or wears; optional "Because you liked similar outfits" in explanation.

**Technical architecture:** Recommendation logs (shown/saved/skipped/worn) already defined. Job or on-log: aggregate per user, compute simple weights (e.g. colorHarmonyWeight, moodWeight) and store in userPreferences or userScoringWeights table. OutfitRecommendationService reads weights and adjusts scores. Keep explainable.

**Schema changes:** userPreferences: optional scoringWeights (object or separate table user_scoring_weights). recommendationLogs: ensure by_userId and optionally by_userId_loggedAt for analytics.

**Required API endpoints:** Internal: Convex function or cron to aggregate logs and update weights. Recommendation API already reads preferences; extend to use weights.

**Frontend components:** Optional: "Why this?" that says "Based on outfits you've liked." No required UI for learning itself.

---

### 15. Garment Auto-Tagging Stub (Rules-Based Suggestions in UI)

**Problem:** New garments get default tags from rules but UI does not show "suggested tags" or one-click apply.

**User flow:** Add/edit garment: after category (and optionally color/season) selected, show "Suggested tags" (from getDefaultTagsForGarment). User can add all or pick. Existing create/update already applies defaults if tags empty; this surfaces them for editing.

**Technical architecture:** shared/garment-default-tags already has getDefaultTagsForGarment. Frontend calls it (or Convex query that returns suggestions) and shows as chips; user adds to form tags.

**Schema changes:** None.

**Required API endpoints:** Convex query optional: getDefaultTagsForCategory(category, color?, season?) or use shared function in client.

**Frontend components:** Add/edit garment form: when category (and optionally color/season) change, show "Suggested tags" with one-click add. Merge with existing tag input.

---

## Automation

### 16. Scheduled or Triggered Recommendation Digest

**Problem:** Users forget to open the app; no pull to re-engage.

**User flow:** Optional: "Daily outfit suggestion" email or push. User enables in settings. Each morning (or on demand) system generates one outfit and sends summary with link to app.

**Technical architecture:** Convex cron or external scheduler. For each opted-in user: fetch garments, get weather (user location or last city), call OutfitRecommendationService, send email via Resend (or push). Store preference in userPreferences (digestEnabled, digestTime).

**Schema changes:** userPreferences: digestEnabled, digestTime (optional). Optional digest_logs for idempotency.

**Required API endpoints:** Convex cron or HTTP action; Resend for email. No public API.

**Frontend components:** Settings: toggle "Daily outfit email" and optional time. No other UI.

---

### 17. Sync External Product Feeds (Scheduled Refresh)

**Problem:** external_products can become stale; no defined refresh.

**User flow:** No direct user flow. Admin or cron refreshes feeds so product suggestions stay current.

**Technical architecture:** Convex cron or HTTP action: call fetchFromProviders (or equivalent), normalize, upsert into external_products. Rate limit per provider. Optional: clear old products by source/updatedAt.

**Schema changes:** Optional: last_sync_per_source (or in config) to avoid over-calling providers.

**Required API endpoints:** Internal only: Convex action or Next.js route protected by secret; or Convex cron.

**Frontend components:** None for end users; optional admin "Refresh products" button.

---

## Integrations

### 18. Weather API Abstraction and Caching

**Problem:** Weather called without central caching; rate limits and latency.

**User flow:** Unchanged. Weather loads faster and does not hit rate limits.

**Technical architecture:** Next.js API route GET /api/weather?lat=&lon= or ?city=. Server-side cache (in-memory or Redis) with 5–10 min TTL. Call Open-Meteo from server. Return same shape as current client call.

**Schema changes:** None.

**Required API endpoints:** GET /api/weather (query params: lat, lon or city). Response: { condition, temperature, ... }.

**Frontend components:** Today/style: call /api/weather instead of direct Open-Meteo (or keep client call but document server option for caching). Optional manual city fallback uses same API with city param.

---

### 19. Retailer / Affiliate Configuration Dashboard (Internal)

**Problem:** Enabling product suggestions requires env vars and code; no visibility into which providers are active.

**User flow:** Admin or internal: page that shows which providers are configured (no secrets), last sync time, and maybe "Test" to run one fetch. Optional: enable/disable providers via Convex config.

**Technical architecture:** Convex config or env: list of provider keys (e.g. AMAZON_ACCESS_KEY set or not). Internal route or Convex dashboard. No secrets in UI.

**Schema changes:** Optional: provider_status table (source, lastSuccess, lastError) updated by sync job.

**Required API endpoints:** Convex query providerStatus.list or internal API. No public API.

**Frontend components:** Internal admin page: table of providers, status, last sync. Optional "Refresh" button (calls internal action).

---

## Analytics

### 20. Activity and Stats on Profile

**Problem:** Users have no view of their own activity; engagement and transparency missing.

**User flow:** Profile: section "Your activity" — e.g. garments count, outfits saved this week/month, outfits generated, optional "Most worn" or "Favorite mood".

**Technical architecture:** Convex queries: count garments, count outfits in date range, aggregate recommendationLogs (saved/worn). Optional: cache or materialized stats if expensive.

**Schema changes:** None; use existing recommendationLogs and outfits. Optional: analytics_cache table for pre-aggregated counts per user.

**Required API endpoints:** Convex: profile.getStats or separate queries (garments.count, outfits.countByRange, recommendationLogs.aggregate). No new HTTP API.

**Frontend components:** Profile page: "Activity" or "Stats" section. Cards or list: total garments, saved outfits, generated this week, etc. Use existing design system.

---

### 21. Recommendation Logs Analytics (Internal or Future ML)

**Problem:** Logs are stored but not queried for product or ML use.

**User flow:** No user-facing flow. Internal: dashboard or exports for "saved rate", "skip rate", mood/weather distribution. Feeds learning pipeline and product decisions.

**Technical architecture:** Convex queries with indexes (by_userId, by_userId_loggedAt). Optional: export to analytics warehouse or run aggregations in scheduled job.

**Schema changes:** recommendationLogs: ensure index by_userId and optionally (userId, loggedAt) for time-range queries.

**Required API endpoints:** Convex queries only (internal). Optional export job.

**Frontend components:** None for users; internal dashboard or scripts.

---

_Last updated: as part of product expansion analysis._
