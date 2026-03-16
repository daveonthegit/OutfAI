# OutfAI — Feature Status

> Single source of truth for **what is shipped** vs **planned**.  
> Aligned with [../product/CURRENT_PRODUCT_STATE.md](../product/CURRENT_PRODUCT_STATE.md) and [EXPANSION_ROADMAP.md](./EXPANSION_ROADMAP.md).

---

## Shipped (production or main)

| Feature                          | Notes                                                                                                                               |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Auth**                         | BetterAuth: signup, login, email verification (Resend), username. Session cookie; middleware protects routes.                       |
| **Closet**                       | Garments CRUD, image upload (Convex storage), list by user, filters. Add page, closet grid.                                         |
| **Outfit generation**            | Mood + weather (Open-Meteo + geolocation), POST /api/recommendations, OutfitRecommendationService, scored outfits with explanation. |
| **Save outfit**                  | Save to Convex outfits; archive page; "I wore this" logs "worn".                                                                    |
| **Style insights**               | Wardrobe gaps, complete-the-look, style/occasion tips. POST /api/style-insights, StyleInsightsSection on home.                      |
| **Profile**                      | Read-only name, username, email, wardrobe stats. Profile and /profile/settings route.                                               |
| **Navigation**                   | Bottom nav (Today, Mood, Closet, Add, Archive); theme toggle; no-nav routes in lib/routes.ts.                                       |
| **Landing**                      | Public landing when unauthenticated; authenticated home when logged in.                                                             |
| **Optional product suggestions** | External products (Amazon, Walmart, Macy's, Best Buy, JSON feed) when configured; not on home by default.                           |
| **Garment image analysis**       | Optional POST /api/analyze-garment-image (Google Vision).                                                                           |
| **CI**                           | Format, lint, typecheck, test, build, docs-consistency, security audit.                                                             |
| **Recommendation logs in UI**    | Today: log "shown" when batch displayed, "saved" after save, "skipped" on Skip; Archive: "I wore this" logs "worn".                 |

---

## Shipped (Phase 1 complete)

| Feature                             | Notes                                                                                                                                                 |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Password reset**                  | Forgot-password link on login; /forgot-password and /reset-password pages; BetterAuth sendResetPassword (Resend).                                     |
| **Loading / toasts / empty states** | Sonner in layout; skeleton for closet grid and outfit cards; toasts for garment CRUD, outfit save, API errors; closet/archive empty states with CTAs. |
| **Score breakdown UI**              | Recommendation API returns scoreBreakdown per outfit; outfit card "See why" expandable with category bars.                                            |
| **Manual weather fallback**         | When location is off: "Enter city" input; Open-Meteo geocoding + forecast; last city in localStorage.                                                 |

---

## Shipped (Phase 2 complete)

| Feature                 | Notes                                                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User preferences UI** | Profile page: favorite moods, preferred styles/colors, avoided colors, style goal. Saved via `userPreferences.save`.                                          |
| **Editable profile**    | Profile page: name, username, bio, avatar (upload/remove). BetterAuth `updateUser`; Convex `profile.update` / `setAvatar` / `removeAvatar`.                   |
| **Onboarding**          | Multi-step wizard at `/onboarding`: welcome → add garments → preferences → try outfit → done. Redirect guard when `onboardingComplete` is false; skip option. |
| **Closet search**       | Debounced search by garment name on closet page; "No results" empty state with clear.                                                                         |
| **Delete account**      | Settings danger zone: type "DELETE" to confirm; Convex `account.deleteAllUserData`; then sign out.                                                            |
| **Data export**         | Settings: "Download my data" triggers JSON export (garments, outfits, logs, profile, preferences).                                                            |
| **Account settings**    | Settings: change password (BetterAuth `changePassword`), change email (BetterAuth `changeEmail` + verification).                                              |

---

## Not shipped (backlog)

- **Outfit calendar** — Plan outfits by date. Phase 3.
- **Packing planner** — Trip capsule wardrobe. Phase 3.
- **Activity/stats on profile** — Phase 3.
- **Weather API caching** — Server-side cache for weather. Phase 3.
- **E2E tests** — Playwright/Cypress critical path. Phase 3.
- **Accessibility audit** — Phase 3.
- **Learning pipeline** — Improve scoring from logs. Phase 4.
- **AI vision auto-tagging** — Suggest from photo. Phase 4.
- **Tag suggestions in UI** — Surface default tags in add/edit. Phase 4.
- **Recommendation digest** — Optional email. Phase 4.
- **Product feed sync** — Scheduled refresh. Phase 4.
- **Sessions / 2FA** — Optional. Phase 4.
- **Social / mobile** — Backlog; not in current roadmap scope.

---

## How to update

- When a feature ships: move it from "Not shipped" to "Shipped" and add a short note.
- Keep in sync with [EXPANSION_ROADMAP.md](./EXPANSION_ROADMAP.md).
- For full product context, see [../product/CURRENT_PRODUCT_STATE.md](../product/CURRENT_PRODUCT_STATE.md).
