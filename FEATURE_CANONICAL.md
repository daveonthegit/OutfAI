# OutfAI — Canonical Feature List

> Authoritative list of features (shipped and planned) and where they are documented or implemented.  
> Use with [FEATURE_STATUS.md](FEATURE_STATUS.md) and [docs/implementation/EXPANSION_ROADMAP.md](docs/implementation/EXPANSION_ROADMAP.md).

---

## Core product

| Feature                                                   | Status  | Doc / implementation                                                                                              |
| --------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| Authentication (signup, login, verify email, session)     | Shipped | Convex auth.ts, BetterAuth, apps/web/app/login, signup, verify-email, api/auth                                    |
| Closet (garments CRUD, image upload, list, filters)       | Shipped | convex/garments.ts, apps/web/app/add, closet                                                                      |
| Outfit generation (mood, weather, scored recommendations) | Shipped | server/services/outfitRecommendationService.ts, POST /api/recommendations, hooks/use-outfit-recommendations, home |
| Save outfit / archive                                     | Shipped | convex/outfits.ts, apps/web/app/archive, home (save button)                                                       |
| Style insights (gaps, complete-the-look, tips)            | Shipped | server/services/styleInsightsService.ts, POST /api/style-insights, StyleInsightsSection                           |
| Profile (read-only identity, stats)                       | Shipped | convex/profile.ts, apps/web/app/profile, profile/settings                                                         |
| Recommendation logs in UI                                 | Shipped | Today + Archive wire recommendationLogs.log (shown/saved/skipped/worn); FEATURE_EXPANSION §1                      |
| User preferences UI                                       | Backlog | docs/issues/07, FEATURE_EXPANSION §2, Phase 2                                                                     |
| Editable profile (name, username, avatar)                 | Backlog | docs/issues/01, 02, FEATURE_EXPANSION §4, Phase 2                                                                 |
| Onboarding (complete profile + checklist)                 | Backlog | docs/issues/08, 09, FEATURE_EXPANSION §3, Phase 2                                                                 |
| Password reset                                            | Shipped | apps/web/app/forgot-password, reset-password, login link; convex/auth.ts sendResetPassword                        |
| Delete account                                            | Backlog | docs/issues/04, FEATURE_EXPANSION §12, Phase 2                                                                    |
| Data export                                               | Backlog | docs/issues/10, FEATURE_EXPANSION §6, Phase 2                                                                     |
| Account settings (password, email)                        | Backlog | docs/issues/03, Phase 2                                                                                           |
| Closet search                                             | Backlog | docs/issues/18, FEATURE_EXPANSION §7, Phase 2                                                                     |

---

## Recommendations and intelligence

| Feature                                                  | Status  | Doc / implementation                                                                           |
| -------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------- |
| Rule-based scoring (color, mood, diversity, preferences) | Shipped | server/services/outfitRecommendationService.ts, shared/types                                   |
| Explainable explanation per outfit                       | Shipped | Same service, returned in API and UI                                                           |
| Score breakdown UI (expand for category scores)          | Shipped | outfitRecommendationService scoreBreakdown; outfit card "See why"; shared/types ScoreBreakdown |
| Learning pipeline (improve from feedback)                | Backlog | docs/issues/27, FEATURE_EXPANSION §14, Phase 4                                                 |
| Garment default tags (rules)                             | Shipped | shared/garment-default-tags, convex/garments create                                            |
| Garment auto-tagging stub in UI                          | Backlog | docs/issues/30, FEATURE_EXPANSION §15, Phase 4                                                 |
| AI vision auto-tagging                                   | Backlog | docs/issues/26, FEATURE_EXPANSION §13, Phase 4; API stub exists                                |

---

## Commerce and products

| Feature                                            | Status                          | Doc / implementation                                            |
| -------------------------------------------------- | ------------------------------- | --------------------------------------------------------------- |
| Style insights (text-only)                         | Shipped                         | styleInsightsService, /api/style-insights                       |
| External product providers (Amazon, Walmart, etc.) | Shipped                         | server/commerce, convex external_products                       |
| Product recommendations (wardrobe-fit scoring)     | Shipped                         | productRecommendationService, POST /api/product-recommendations |
| Product suggestions on home                        | Optional / off by default       | docs/commerce/IMPLEMENTATION.md                                 |
| Commerce interaction logs                          | Shipped (Convex); consent-aware | convex/commerceInteractionLogs                                  |
| Product feed sync (scheduled)                      | Backlog                         | FEATURE_EXPANSION §17, Phase 4                                  |

---

## UX and infrastructure

| Feature                              | Status  | Doc / implementation                                                                                   |
| ------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------ |
| Loading states, toasts, empty states | Shipped | Sonner in layout; closet skeleton/empty/toasts; home skeleton/toasts; docs/issues/19                   |
| Manual weather fallback (city)       | Shipped | authenticated-home city input; Open-Meteo geocoding + forecast; localStorage last city; docs/issues/17 |
| Activity/stats on profile            | Backlog | docs/issues/11, FEATURE_EXPANSION §20, Phase 3                                                         |
| Outfit calendar                      | Backlog | docs/issues/24, FEATURE_EXPANSION §10, Phase 3                                                         |
| Packing planner                      | Backlog | docs/issues/25, FEATURE_EXPANSION §11, Phase 3                                                         |
| E2E tests                            | Backlog | docs/issues/29, Phase 3                                                                                |
| Accessibility audit                  | Backlog | docs/issues/28, Phase 3                                                                                |
| Weather API caching                  | Backlog | FEATURE_EXPANSION §18, Phase 3                                                                         |
| Recommendation digest (email)        | Backlog | FEATURE_EXPANSION §16, Phase 4                                                                         |

---

## Reference

- **Current state:** [docs/product/CURRENT_PRODUCT_STATE.md](docs/product/CURRENT_PRODUCT_STATE.md)
- **Gaps:** [docs/product/PRODUCT_GAPS.md](docs/product/PRODUCT_GAPS.md)
- **Expansion proposals:** [docs/product/FEATURE_EXPANSION.md](docs/product/FEATURE_EXPANSION.md)
- **Roadmap:** [docs/implementation/EXPANSION_ROADMAP.md](docs/implementation/EXPANSION_ROADMAP.md)
- **Master plan (issues list):** [docs/MASTER_PLAN.md](docs/MASTER_PLAN.md)
