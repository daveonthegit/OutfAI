# Phase 1 Audit — OutfAI

> Audit of Phase 1 items from [EXPANSION_ROADMAP.md](./EXPANSION_ROADMAP.md).  
> Source of truth: roadmap + codebase as of audit date.

---

## What Phase 1 Is Trying to Accomplish

Phase 1 focuses on **critical improvements** so the product is production-ready and learnable:

- **Close the recommendation loop** — Log shown/saved/skipped/worn so analytics and future learning pipeline can use feedback.
- **Improve trust and safety** — Password reset so locked-out users can self-serve.
- **Fix high-impact UX gaps** — Loading states, toasts, empty states so there are no dead ends or raw errors; score breakdown for explainability; manual weather when geolocation is denied.

**Exit criteria (roadmap):** Recommendation loop closed; users can reset password; main flows have loading/empty states and toasts; users can see score breakdown and set weather by city.

---

## Audit Table

| #   | Item                                     | Status       | Related files                                                                                                                       | Blockers / dependencies                                                             | Priority |
| --- | ---------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------- |
| 1   | **Wire recommendation logs in UI**       | **Complete** | `apps/web/components/home/authenticated-home.tsx`, `apps/web/app/archive/page.tsx`, `convex/recommendationLogs.ts`                  | —                                                                                   | —        |
| 2   | **Password reset (forgot password)**     | **Missing**  | `convex/auth.ts`, `apps/web/app/login/page.tsx`, new forgot-password + reset-password pages, `lib/auth-client.ts`                   | BetterAuth `sendResetPassword` in auth config; Resend for email                     | P0       |
| 3   | **Loading states, toasts, empty states** | **Partial**  | `apps/web/app/layout.tsx`, `apps/web/components/ui/sonner.tsx`, closet/archive/home pages                                           | Sonner not mounted; no skeleton on closet/outfit grid; toasts not used consistently | P0       |
| 4   | **Score breakdown UI**                   | **Missing**  | `server/services/outfitRecommendationService.ts`, `apps/web/app/api/recommendations/route.ts`, `shared/types`, outfit card + detail | Service returns only total score; need breakdown in API + types + UI                | P0       |
| 5   | **Manual weather fallback**              | **Missing**  | `apps/web/components/home/authenticated-home.tsx`, optional `userPreferences.lastWeatherCity`                                       | Open-Meteo geocoding or GET /api/weather?city=                                      | P0       |

---

## Item Details

### 1. Wire recommendation logs in UI — Complete

- **Shown:** After generate, `authenticated-home.tsx` logs each of the first 6 outfits with `action: "shown"` (deduped by batch key).
- **Saved:** On Save Look, after `saveOutfit`, `logRecommendation({ action: "saved", outfitId, garmentIds, mood, weather })`.
- **Skipped:** `handleSkip` logs `action: "skipped"` and card is hidden via `skippedIndices`.
- **Worn:** Archive page `handleWoreThis` calls `logRecommendation({ action: "worn", outfitId, garmentIds, mood, weather })`.
- Convex mutation `recommendationLogs.log` is used; no schema change.

### 2. Password reset — Missing

- Login page has no "Forgot password?" link.
- No page/modal for entering email to request reset.
- `convex/auth.ts` does not set `emailAndPassword.sendResetPassword` (Resend).
- No reset-password page for the magic-link callback (token + new password form).
- BetterAuth client API: `authClient.requestPasswordReset({ email, redirectTo })` and `authClient.resetPassword({ newPassword, token })`.

### 3. Loading states, toasts, empty states — Partial

- **Layout:** Root layout does not render `<Toaster />` from Sonner; Sonner component exists at `components/ui/sonner.tsx`.
- **Closet:** Uses `garments = useQuery(api.garments.list) ?? []` — when `undefined` shows nothing explicit; no skeleton grid. Empty list: no dedicated empty-state CTA documented in issue #19 (e.g. "No garments yet" + CTA to /add).
- **Archive:** Has loading text ("Loading…") and empty state ("No saved looks yet" + link to /). Good.
- **Home/Today:** Shows "Generating recommendations..." and "No recommendations available"; could use skeleton for outfit cards during load.
- **Toasts:** Sonner not in tree; no consistent toast on garment create/update/delete, outfit save, or API errors. `use-toast.ts` exists but is separate from Sonner.

### 4. Score breakdown UI — Missing

- `OutfitRecommendationService.scoreOutfit` computes: base 50, colorHarmony, moodAlignment, styleCoherence, occasionMatching, versatility, diversity, preferences. Only total score is returned on each outfit.
- API returns `RecommendationOutput`: `{ outfits, explanation, totalGenerated }`; each outfit has `score` but no `scoreBreakdown`.
- Outfit card and outfit detail do not show category-level scores or "See why" expandable section.

### 5. Manual weather fallback — Missing

- When `locationError` is set, authenticated-home shows "Location off" and "ENABLE LOCATION, THEN REFRESH". No "Enter city" option.
- No geocode (e.g. Open-Meteo or API) + weather fetch by city; no persistence of last city (optional: `userPreferences.lastWeatherCity` or localStorage).

---

## Summary

- **Already done:** Recommendation logs (shown/saved/skipped/worn) are wired in the UI; Skip button exists; archive has "I wore this" with logging.
- **Still needs to be built:**
  1. Password reset: server `sendResetPassword` + forgot-password UI + reset-password page + toasts.
  2. Loading/toasts/empty: Mount Sonner in layout; add skeleton for closet grid and outfit cards; use toasts for create/update/delete/save and errors; ensure closet empty state has CTA to /add.
  3. Score breakdown: Extend service to return per-category scores; extend API and shared types; add expandable "See why" / score breakdown on outfit card (and outfit detail if applicable).
  4. Manual weather: City input when location is off; geocode + fetch weather by city; pass to recommendations; optional store last city.
- **Do first:** (1) Password reset (auth + pages), (2) Sonner + toasts + loading/empty (foundation UX), (3) Score breakdown (API + UI), (4) Manual weather (self-contained).

---

_Last updated: Phase 1 implementation audit._
