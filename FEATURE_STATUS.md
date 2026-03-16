# OutfAI — Feature Status

> Single source of truth for **what is shipped** vs **planned**.  
> Aligned with [docs/product/CURRENT_PRODUCT_STATE.md](docs/product/CURRENT_PRODUCT_STATE.md) and [docs/implementation/EXPANSION_ROADMAP.md](docs/implementation/EXPANSION_ROADMAP.md).

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

## Not shipped (backlog)

- **User preferences UI** — Set favorite moods, styles, colors. Phase 2.
- **Editable profile** — Name, username, avatar. Phase 2.
- **Onboarding** — Complete profile + checklist. Phase 2.
- **Closet search** — Search by name. Phase 2.
- **Delete account** — Full data + auth delete. Phase 2.
- **Data export** — Download my data. Phase 2.
- **Account settings** — Change password, change email. Phase 2.
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
- When roadmap changes: keep this in sync with [docs/implementation/EXPANSION_ROADMAP.md](docs/implementation/EXPANSION_ROADMAP.md).
- For full product context, see [docs/product/CURRENT_PRODUCT_STATE.md](docs/product/CURRENT_PRODUCT_STATE.md).
