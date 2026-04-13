# Phase 1 Execution Plan — OutfAI

> Execution plan for remaining Phase 1 work after [PHASE_1_AUDIT.md](./PHASE_1_AUDIT.md).  
> Recommendation logs are already complete; this plan covers the other four items.

---

## Backend

### Password reset (BetterAuth + Resend)

| Task                  | What to change                                                                                           | Where            | Dependencies                  | Acceptance criteria                                          |
| --------------------- | -------------------------------------------------------------------------------------------------------- | ---------------- | ----------------------------- | ------------------------------------------------------------ |
| Add sendResetPassword | Configure `emailAndPassword.sendResetPassword` in auth; use Resend (same as verification).               | `convex/auth.ts` | Resend component already used | Reset email sent when user requests from client              |
| (No new API route)    | Auth routes proxied via Convex HTTP; BetterAuth exposes `/request-password-reset` and `/reset-password`. | —                | —                             | Client calls authClient.requestPasswordReset / resetPassword |

### Score breakdown (API + types)

| Task                                | What to change                                                                                                                                                                                                     | Where                                            | Dependencies             | Acceptance criteria                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ | ------------------------ | ------------------------------------------- |
| Return score breakdown from service | Add interface for category scores; in generateOutfits, for each candidate compute and attach breakdown (base, colorHarmony, moodAlignment, styleCoherence, occasionMatching, versatility, diversity, preferences). | `server/services/outfitRecommendationService.ts` | Existing score\* methods | Each outfit in result has scoreBreakdown    |
| Extend shared type                  | Add optional `scoreBreakdown` to outfit DTO.                                                                                                                                                                       | `shared/types/index.ts`                          | —                        | Type used by API and frontend               |
| API route                           | Pass through result; no change if service returns breakdown.                                                                                                                                                       | `apps/web/app/api/recommendations/route.ts`      | —                        | Response includes scoreBreakdown per outfit |

### Manual weather (optional backend)

| Task                             | What to change                                                                                                   | Where                                     | Dependencies | Acceptance criteria                                  |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------ | ---------------------------------------------------- |
| Optional: GET /api/weather?city= | Geocode city server-side (Open-Meteo geocoding API), then fetch weather; return same shape as client Open-Meteo. | `apps/web/app/api/weather/route.ts` (new) | —            | Client can get weather by city without exposing keys |
| Alternative                      | Client-side Open-Meteo geocoding + weather (no secrets); no new route.                                           | Frontend only                             | —            | Simpler; acceptable for Phase 1                      |

---

## Frontend

### Password reset

| Task                 | What to change                                                                                                                        | Where                                         | Dependencies                                      | Acceptance criteria                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------- |
| Forgot password link | Add "Forgot password?" on login page.                                                                                                 | `apps/web/app/login/page.tsx`                 | —                                                 | Link to /forgot-password                                 |
| Forgot password page | Page: email input, submit → authClient.requestPasswordReset({ email, redirectTo: baseUrl + "/reset-password" }). Toast success/error. | `apps/web/app/forgot-password/page.tsx` (new) | Sonner mounted                                    | User can request reset; sees "Check your email" or error |
| Reset password page  | Read token from query; form: new password, submit → authClient.resetPassword({ newPassword, token }). Toast + redirect to /login.     | `apps/web/app/reset-password/page.tsx` (new)  | Middleware: allow /reset-password unauthenticated | User can set new password and sign in                    |
| Middleware           | Allow `/forgot-password` and `/reset-password` without auth.                                                                          | `apps/web/middleware.ts`                      | —                                                 | No redirect to login for these routes                    |

### Loading states, toasts, empty states

| Task                   | What to change                                                                                             | Where                                             | Dependencies              | Acceptance criteria              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------- | -------------------------------- |
| Mount Sonner           | Add `<Toaster />` from `@/components/ui/sonner` in root layout (inside ThemeProvider).                     | `apps/web/app/layout.tsx`                         | —                         | Toasts visible app-wide          |
| Closet loading         | When garments === undefined, show skeleton grid (e.g. 6–8 Skeleton cells).                                 | `apps/web/app/closet/page.tsx`                    | Skeleton component exists | No blank grid while loading      |
| Closet empty           | When garments.length === 0, show "No garments yet" + CTA button to /add.                                   | `apps/web/app/closet/page.tsx`                    | —                         | Clear empty state with next step |
| Home outfit loading    | When loading from useOutfitRecommendations, show skeleton cards (e.g. 6 placeholders).                     | `apps/web/components/home/authenticated-home.tsx` | —                         | Skeleton while generating        |
| Home no outfits        | Already has "No recommendations available"; optionally add "Add more items" / "Try a different mood" link. | Same                                              | —                         | No dead end                      |
| Toasts: garment CRUD   | On create/update/delete success or error, call toast.success / toast.error (Sonner).                       | Add garment form, closet delete flow              | —                         | User sees feedback               |
| Toasts: outfit save    | On save success/error in authenticated-home, toast.                                                        | `authenticated-home.tsx`                          | —                         | User sees "Saved" or error       |
| Toasts: API errors     | In useOutfitRecommendations, on error set state and optionally toast.                                      | `hooks/use-outfit-recommendations.ts` or consumer | —                         | User sees error toast            |
| Toasts: password reset | Forgot-password and reset-password pages use toast for success/error.                                      | New pages                                         | —                         | Clear feedback                   |

### Score breakdown UI

| Task               | What to change                                                                                                  | Where                                                 | Dependencies           | Acceptance criteria                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------- | --------------------------------------- |
| Hook + types       | useOutfitRecommendations already receives API response; ensure outfits include scoreBreakdown.                  | `hooks/use-outfit-recommendations.ts`, `shared/types` | API returns breakdown  | Outfit type has scoreBreakdown          |
| DisplayOutfit      | Pass scoreBreakdown from API outfit to DisplayOutfit.                                                           | `authenticated-home.tsx`                              | —                      | Card can show breakdown                 |
| Outfit card        | Add expandable section or "See why" that shows breakdown (bars or list: Color Harmony 15/20, Mood 12/20, etc.). | `apps/web/components/outfit-recommendation-card.tsx`  | BrutalistCard / tokens | User can expand and see category scores |
| Outfit detail page | If outfit passed with scoreBreakdown, show same breakdown.                                                      | `apps/web/app/outfit/page.tsx` (if exists)            | —                      | Consistent explainability               |

### Manual weather fallback

| Task                         | What to change                                                                                                                       | Where                                                                       | Dependencies | Acceptance criteria                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | ------------ | -------------------------------------------- |
| City input when location off | When locationError is set, show "Enter city" input (and/or "Use my location" retry).                                                 | `authenticated-home.tsx`                                                    | —            | User can type city                           |
| Geocode + fetch weather      | On city submit: call Open-Meteo geocoding (e.g. https://geocoding-api.open-meteo.com/v1/search?name=...) then forecast with lat/lon. | Same (client-side) or new GET /api/weather?city=                            | —            | temperatureCelsius and weather set from city |
| Pass to recommendations      | Already using temperatureCelsius and weather for generate; no change if state is set.                                                | —                                                                           | —            | Recommendations use manual weather           |
| Optional: persist last city  | localStorage or userPreferences.lastWeatherCity; pre-fill on next visit.                                                             | userPreferences schema has no lastWeatherCity; use localStorage for Phase 1 | —            | Better UX on return                          |

---

## Database / schema

| Item               | Change                        | Notes                                                       |
| ------------------ | ----------------------------- | ----------------------------------------------------------- |
| recommendationLogs | None                          | Already in use.                                             |
| userPreferences    | Optional: add lastWeatherCity | Deferred; use localStorage for Phase 1.                     |
| outfits            | None                          | scoreBreakdown not stored; computed at recommendation time. |

---

## Auth / security

| Task          | What to change                                                                                 | Where                     |
| ------------- | ---------------------------------------------------------------------------------------------- | ------------------------- |
| Public routes | Allow /forgot-password and /reset-password in middleware (no redirect to login).               | `apps/web/middleware.ts`  |
| Reset token   | BetterAuth handles token validation and expiry; redirect with ?error=INVALID_TOKEN if invalid. | Reset page handles query. |

---

## UX / polish

- Use existing design tokens and BrutalistCard-style components for score breakdown.
- Empty states: one primary CTA per screen (e.g. "Add your first piece" → /add).
- Toasts: short, consistent (e.g. "Outfit saved", "Could not save. Try again.").

---

## Testing / validation

| Area           | Action                                                                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit tests     | Add or extend tests for outfitRecommendationService score breakdown return value.                                                                  |
| Lint/typecheck | Run after each area; fix any new errors.                                                                                                           |
| Build          | Ensure apps/web and server build.                                                                                                                  |
| Manual         | Sign up → login → forgot password flow; reset password; closet empty/loading; home loading/toast save; score breakdown expand; weather city input. |

---

_Last updated: Phase 1 execution planning._
