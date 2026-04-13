# OutfAI — Master Plan

> **What is done** vs **what remains**: use [implementation/FEATURE_STATUS.md](implementation/FEATURE_STATUS.md) as the source of truth for shipped features. This doc indexes issue files in [issues/](issues/) and links to them. The app uses **Convex** and **BetterAuth** (no Supabase/Prisma/tRPC).

---

## Current stack (actual)

| Layer                 | Technology                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------- |
| Frontend              | Next.js 15 (App Router), React 19, TypeScript                                                 |
| Styling               | Tailwind CSS, Radix UI, brutalist design system                                               |
| Backend               | Convex (database, server functions, file storage)                                             |
| Auth                  | BetterAuth 1.4.9 via `@convex-dev/better-auth` (email/password, username, email verification) |
| Recommendation engine | `OutfitRecommendationService` (server); called via `POST /api/recommendations`                |
| Weather               | Open-Meteo (client-side from home page)                                                       |

---

## What’s done

### Foundation

- **Convex schema**: [convex/schema.ts](../convex/schema.ts) — `garments`, `outfits`, `recommendationLogs` with indexes.
- **Auth**: BetterAuth + Convex component; login, signup, check-email, verify-email; middleware protects all routes except auth and static assets.
- **Current user**: `getCurrentUser` query; `useRequireAuth` hook for protected pages.

### Closet

- **Garments**: Convex `garments.list`, `create`, `update`, `remove`, `removeMany`, `generateUploadUrl`; add page with full form and image upload (Convex storage); closet page lists by user.
- **Image**: Convex file storage; optional [analyze-garment-image](../apps/web/app/api/analyze-garment-image/route.ts) API for analysis.

### Outfits and recommendations

- **Outfit generation**: `OutfitRecommendationService`; home page uses mood, weather (Open-Meteo + geolocation), temperature; displays outfits and explanation.
- **Outfit persistence**: Convex `outfits.list`, `save`, `remove`; home page saves outfit; archive page lists saved outfits with garments.
- **Recommendation logs**: Convex `recommendationLogs.log` called from UI — Today (shown/saved/skipped), Archive (worn).

### Profile and navigation

- **Profile page**: Editable name, username, bio, avatar; wardrobe stats; user preferences (favorite moods, style goal, preferred/avoided colors); Settings for password, email, data export, delete account.
- **Onboarding**: Multi-step wizard at `/onboarding` (welcome → garments → preferences → try outfit → done); redirect guard until complete.
- **Bottom nav**: Today, Mood, Closet, Add, Archive; theme toggle. Closet search (debounced by name). Password reset (forgot/reset pages). Loading/toasts/empty states; score breakdown UI; manual weather fallback (city input).

### DevOps and docs

- **CI**: [.github/workflows/ci.yml](../.github/workflows/ci.yml), preview, release.
- **Seed**: `seedDevCloset` (auto-run when closet empty); `seedClosetForUserId`, `createTestAccount` for testing.
- **Docs**: PRD, architecture, DB design, recommendation engine, project structure, style, Convex schema doc.

---

## Issue index (backlog reference)

**Shipped vs not:** See [implementation/FEATURE_STATUS.md](implementation/FEATURE_STATUS.md). Below, issues 1–5, 7–10, 15, 17–19, 21–22 are **done**; the rest are backlog.

### Profile and account settings

| #   | Issue                                                      | Doc                                                                                  | Status  |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------- |
| 1   | Editable profile (name, username, avatar)                  | [issues/01-editable-profile.md](issues/01-editable-profile.md)                       | Done    |
| 2   | Profile image upload                                       | [issues/02-profile-image-upload.md](issues/02-profile-image-upload.md)               | Done    |
| 3   | Account settings — change password and email               | [issues/03-account-password-email.md](issues/03-account-password-email.md)           | Done    |
| 4   | Delete account                                             | [issues/04-delete-account.md](issues/04-delete-account.md)                           | Done    |
| 5   | Settings route and layout                                  | [issues/05-settings-route-layout.md](issues/05-settings-route-layout.md)             | Done    |
| 6   | Connected sessions and 2FA (optional)                      | [issues/06-sessions-2fa.md](issues/06-sessions-2fa.md)                               | Backlog |
| 7   | User preferences (Convex)                                  | [issues/07-user-preferences.md](issues/07-user-preferences.md)                       | Done    |
| 8   | Onboarding — complete profile flow                         | [issues/08-onboarding-complete-profile.md](issues/08-onboarding-complete-profile.md) | Done    |
| 9   | Onboarding checklist                                       | [issues/09-onboarding-checklist.md](issues/09-onboarding-checklist.md)               | Done    |
| 10  | Data export (Download my data)                             | [issues/10-data-export.md](issues/10-data-export.md)                                 | Done    |
| 11  | Activity and stats on profile                              | [issues/11-activity-stats.md](issues/11-activity-stats.md)                           | Backlog |
| 12  | Quick actions and help on profile                          | [issues/12-quick-actions-help.md](issues/12-quick-actions-help.md)                   | Backlog |
| 13  | Display name vs username and profile visibility (optional) | [issues/13-display-name-visibility.md](issues/13-display-name-visibility.md)         | Backlog |
| 14  | Invite / referral (optional)                               | [issues/14-invite-referral.md](issues/14-invite-referral.md)                         | Backlog |

### Recommendation and logging

| #   | Issue                          | Doc                                                                        | Status |
| --- | ------------------------------ | -------------------------------------------------------------------------- | ------ |
| 15  | Wire recommendation logs in UI | [issues/15-recommendation-logs-ui.md](issues/15-recommendation-logs-ui.md) | Done   |

### Documentation and hygiene

| #   | Issue                                                 | Doc                                                                            | Status                        |
| --- | ----------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------- |
| 16  | Update implementation-plan and commit-plan for Convex | [issues/16-update-impl-commit-plans.md](issues/16-update-impl-commit-plans.md) | Obsolete (those docs removed) |

---

## Further backlog (UX, product, and post-MVP)

| #   | Issue                                                       | Doc                                                                                                                | Status  |
| --- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------- |
| 17  | Manual weather fallback (city input)                        | [issues/17-weather-manual-fallback.md](issues/17-weather-manual-fallback.md)                                       | Done    |
| 18  | Closet search by name                                       | [issues/18-closet-search.md](issues/18-closet-search.md)                                                           | Done    |
| 19  | Loading states, toasts, and empty state polish              | [issues/19-loading-empty-states.md](issues/19-loading-empty-states.md)                                             | Done    |
| 20  | Swipe gestures on outfit cards                              | [issues/20-swipe-gestures-outfits.md](issues/20-swipe-gestures-outfits.md)                                         | Backlog |
| 21  | Score breakdown UI (expand outfit for category scores)      | [issues/21-score-breakdown-ui.md](issues/21-score-breakdown-ui.md)                                                 | Done    |
| 22  | Password reset (forgot password) flow                       | [issues/22-password-reset.md](issues/22-password-reset.md)                                                         | Done    |
| 23  | Storefront integration (optional product suggestions)       | [issues/23-storefront-integration.md](issues/23-storefront-integration.md)                                         | Backlog |
| 24  | Outfit calendar (plan outfits for upcoming days)            | [issues/24-outfit-calendar.md](issues/24-outfit-calendar.md)                                                       | Backlog |
| 25  | Packing planner (trip capsule wardrobe)                     | [issues/25-packing-planner.md](issues/25-packing-planner.md)                                                       | Backlog |
| 26  | AI vision auto-tagging (extract from photo)                 | [issues/26-ai-vision-autotagging.md](issues/26-ai-vision-autotagging.md)                                           | Backlog |
| 27  | Learning pipeline (improve scoring from feedback)           | [issues/27-learning-pipeline.md](issues/27-learning-pipeline.md)                                                   | Backlog |
| 28  | Accessibility audit and fixes                               | [issues/28-accessibility-audit.md](issues/28-accessibility-audit.md)                                               | Backlog |
| 29  | E2E tests for critical flows                                | [issues/29-e2e-tests.md](issues/29-e2e-tests.md)                                                                   | Backlog |
| 30  | Garment auto-tagging stub (rules-based defaults)            | [issues/30-garment-autotagging-stub.md](issues/30-garment-autotagging-stub.md)                                     | Backlog |
| 31  | Mobile app (React Native / Expo)                            | [issues/31-mobile-app.md](issues/31-mobile-app.md)                                                                 | Backlog |
| 32  | Social features (share outfits, community feed)             | [issues/32-social-features.md](issues/32-social-features.md)                                                       | Backlog |
| 33  | Style insights + optional storefront/product recommendation | [issues/33-storefront-scraping-product-recommendation.md](issues/33-storefront-scraping-product-recommendation.md) | Backlog |

---

## How to use this

- **Priorities**: Issues 1–5, 7, 8 are core profile/settings; 9–12 are enhancements; 6, 13, 14 are optional. Issue 15 completes the recommendation loop; 16 is doc hygiene. Issues 17–22 and 28–30 are UX/polish and high-value next steps; 23–27, 31–32 are post-MVP/optional.
- **Linking**: From the repo root, link to issue docs as `docs/issues/NN-title.md`.

### Create GitHub issues from issue files

To create all 33 issues in the GitHub repo in one go (requires a personal access token with `repo` scope):

```bash
# PowerShell
$env:GITHUB_TOKEN = "ghp_YourTokenHere"
node scripts/create-github-issues.js
```

Or paste each issue manually: open [docs/issues/](issues/), use the first heading as the issue title and the rest as the body. Issue files are named `NN-short-title.md` (01–33).
