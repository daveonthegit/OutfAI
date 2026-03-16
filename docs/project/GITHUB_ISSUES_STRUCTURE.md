# OutfAI — GitHub Issues Structure

> How to organize, audit, and create GitHub issues. Use this with [FEATURE_EXPANSION.md](../product/FEATURE_EXPANSION.md) and [EXPANSION_ROADMAP.md](../implementation/EXPANSION_ROADMAP.md).  
> **Note:** Actual close/update/create actions on GitHub require repo access (e.g. `gh` CLI or GitHub web). This doc is the playbook.
>
> **Done (2026-03-16):** Labels and milestones created; issues E1–E20 created (E1 = #2 closed as implemented; doc-16 = #22 closed as obsolete). Open issues: #3–#21.

---

## 1. Suggested Labels

| Label              | Purpose                                 |
| ------------------ | --------------------------------------- |
| `feature`          | New user-facing capability              |
| `enhancement`      | Improvement to existing feature         |
| `backend`          | Convex, server, API                     |
| `frontend`         | UI, components, pages                   |
| `ai`               | Recommendation engine, vision, learning |
| `infrastructure`   | CI, E2E, logging, monitoring            |
| `security`         | Auth, rate limit, validation            |
| `ux`               | Loading, empty states, a11y             |
| `documentation`    | Docs only                               |
| `chore`            | Housekeeping, refactors                 |
| `good-first-issue` | Small, well-scoped                      |

---

## 2. Suggested Milestones

| Milestone                | Map to roadmap                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| **MVP**                  | Already shipped (auth, closet, recommendations, save, style insights). Use for “MVP polish” issues.     |
| **Phase 1 — Critical**   | Wire logs, password reset, loading/empty/toasts, score breakdown, weather fallback                      |
| **Phase 2 — Product**    | Preferences, editable profile, onboarding, closet search, delete account, data export, account settings |
| **Phase 3 — Platform**   | Calendar, packing, activity stats, weather caching, E2E, a11y, storefront visibility                    |
| **Phase 4 — Innovation** | Learning pipeline, vision auto-tag, tag suggestions UI, digest, product sync, 2FA, social, mobile       |

---

## 3. Audit of Existing Issue Docs (docs/issues/)

### 3.1 Already implemented (close with comment)

| Doc                       | Action | Comment to add                                                                                                                                                                                               |
| ------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| (None clearly fully done) | —      | Profile/settings **route** exists (`/profile/settings`); content (password, email, delete, preferences) is not all implemented. Do **not** close 05 as done; keep open and treat as “Settings page content”. |

### 3.2 Outdated or superseded (close or mark obsolete)

| Doc                                | Action                                     | Comment                                                                                                                              |
| ---------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| **16-update-impl-commit-plans.md** | Close as **obsolete** or **documentation** | “Superseded by MASTER_PLAN.md and EXPANSION_ROADMAP.md. implementation-plan and commit-plan can be marked superseded in a small PR.” |

### 3.3 Keep open — update description to match current architecture

| Doc                                                  | Suggested update                                                                                                                                    |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **01-editable-profile.md**                           | State that BetterAuth handles name/username; Convex profile handles bio and avatarStorageId; link to FEATURE_EXPANSION §4.                          |
| **02-profile-image-upload.md**                       | Convex generateUploadUrl + profile update; link to FEATURE_EXPANSION §4.                                                                            |
| **03-account-password-email.md**                     | BetterAuth flows; Convex not required for password/email.                                                                                           |
| **05-settings-route-layout.md**                      | Note that `/profile/settings` exists; remaining work is content (password, email, delete, preferences).                                             |
| **15-recommendation-logs-ui.md**                     | Clarify: call Convex `recommendationLogs.log` from Today (shown/saved/skipped) and archive (worn); add Skip button. Link EXPANSION_ROADMAP Phase 1. |
| **23-storefront-integration.md**                     | Align with commerce/IMPLEMENTATION.md: style insights done; product suggestions optional, provider-based.                                           |
| **33-storefront-scraping-product-recommendation.md** | Clarify: no scraping; product suggestions from affiliate/partner APIs; link commerce/SCRAPING_NON_GOAL.md.                                          |

### 3.4 Break into smaller implementation issues (optional)

| Doc                                   | Suggestion                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| **08-onboarding-complete-profile.md** | Split: (1) onboarding route + redirect, (2) complete-profile step, (3) checklist.    |
| **32-social-features.md**             | Split: (1) share outfit as link, (2) public outfit page, (3) community feed (later). |

### 3.5 No change — keep as-is

All other issue docs (04, 06, 07, 09–14, 17–22, 24–31) remain valid; ensure they are represented in milestones and labels.

---

## 4. New Issues to Create from FEATURE_EXPANSION.md

Create these as GitHub issues and link to roadmap phases. Use the titles below; body = problem + technical approach + tasks from FEATURE_EXPANSION (and checklist from EXPANSION_ROADMAP where applicable).

| #   | Title                                                        | Labels                                | Milestone            |
| --- | ------------------------------------------------------------ | ------------------------------------- | -------------------- |
| E1  | Wire recommendation logs in UI (shown, saved, skipped, worn) | `backend`, `frontend`, `enhancement`  | Phase 1 — Critical   |
| E2  | User preferences UI (favorite moods, styles, colors)         | `frontend`, `backend`, `feature`      | Phase 2 — Product    |
| E3  | Complete onboarding flow (profile + checklist)               | `frontend`, `ux`, `feature`           | Phase 2 — Product    |
| E4  | Editable profile (name, username, avatar)                    | `frontend`, `backend`, `feature`      | Phase 2 — Product    |
| E5  | Password reset (forgot password) flow                        | `security`, `frontend`, `enhancement` | Phase 1 — Critical   |
| E6  | Data export (Download my data)                               | `backend`, `feature`, `security`      | Phase 2 — Product    |
| E7  | Closet search by name                                        | `frontend`, `backend`, `enhancement`  | Phase 2 — Product    |
| E8  | Manual weather fallback (city input)                         | `frontend`, `enhancement`             | Phase 1 — Critical   |
| E9  | Score breakdown UI (expand outfit for category scores)       | `frontend`, `ux`, `enhancement`       | Phase 1 — Critical   |
| E10 | Outfit calendar (plan outfits for upcoming days)             | `feature`, `frontend`, `backend`      | Phase 3 — Platform   |
| E11 | Packing planner (trip capsule wardrobe)                      | `feature`, `frontend`, `backend`      | Phase 3 — Platform   |
| E12 | Delete account                                               | `security`, `backend`, `frontend`     | Phase 2 — Product    |
| E13 | AI vision auto-tagging (suggest from photo)                  | `ai`, `feature`, `backend`            | Phase 4 — Innovation |
| E14 | Learning pipeline (improve scoring from feedback)            | `ai`, `backend`, `feature`            | Phase 4 — Innovation |
| E15 | Garment auto-tagging stub in UI (suggested tags)             | `frontend`, `ai`, `enhancement`       | Phase 4 — Innovation |
| E16 | Scheduled recommendation digest (email)                      | `backend`, `feature`                  | Phase 4 — Innovation |
| E17 | Sync external product feeds (scheduled refresh)              | `backend`, `infrastructure`           | Phase 4 — Innovation |
| E18 | Weather API abstraction and server-side caching              | `backend`, `infrastructure`           | Phase 3 — Platform   |
| E19 | Activity and stats on profile                                | `frontend`, `backend`, `enhancement`  | Phase 3 — Platform   |
| E20 | Loading states, toasts, and empty state polish               | `ux`, `frontend`, `enhancement`       | Phase 1 — Critical   |

**Note:** Existing issue docs (e.g. 15, 19, 21, 22, 17) already cover some of the above. Prefer **updating** those issues in GitHub to reference FEATURE_EXPANSION and EXPANSION_ROADMAP rather than duplicating. Create **new** GitHub issues only for items that do not already have an issue file (e.g. E18, E19 if not covered by 11).

---

## 5. Issue Template (for new or updated issues)

```markdown
## Problem

(1–2 sentences: what gap or user need this addresses.)

## Technical approach

- **Backend:** (Convex / API / services)
- **Frontend:** (pages, components)
- **Schema:** (changes if any)

## Implementation tasks

- [ ] Task 1
- [ ] Task 2
- [ ] …

## Related

- Roadmap: [EXPANSION_ROADMAP.md](../implementation/EXPANSION_ROADMAP.md) Phase N
- Feature detail: [FEATURE_EXPANSION.md](../product/FEATURE_EXPANSION.md) §X
- Files: (e.g. convex/recommendationLogs.ts, apps/web/…)
```

---

## 6. Linking Issues to Roadmap

- In each issue, add a **Related** section with link to **EXPANSION_ROADMAP.md** and phase (e.g. Phase 1 — Critical).
- Optionally add a **Milestone** in GitHub that matches the roadmap phase.
- For “Wire recommendation logs” (Phase 1, first item), set milestone **Phase 1 — Critical** and label **backend**, **frontend**, **enhancement**.

---

## 7. Summary

| Action                    | Count                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| Close (obsolete)          | 1 (16) → #22 closed                                                                           |
| Update description        | 7 (01, 02, 03, 05, 15, 23, 33)                                                                |
| Optional split            | 2 (08, 32)                                                                                    |
| New issues from expansion | 20 (E1–E20); E1 = #2 (closed as implemented)                                                  |
| Labels                    | 11 suggested (8 created: feature, backend, frontend, ai, infrastructure, security, ux, chore) |
| Milestones                | 5 created: MVP, Phase 1–4                                                                     |

### GitHub issue numbers (created 2026-03-16)

| E#  | Title / doc              | GitHub # | State                |
| --- | ------------------------ | -------- | -------------------- |
| E1  | Wire recommendation logs | 2        | Closed (implemented) |
| E2  | User preferences UI      | 3        | Open                 |
| E3  | Complete onboarding      | 4        | Open                 |
| E4  | Editable profile         | 5        | Open                 |
| E5  | Password reset           | 6        | Open                 |
| E6  | Data export              | 7        | Open                 |
| E7  | Closet search            | 8        | Open                 |
| E8  | Manual weather fallback  | 9        | Open                 |
| E9  | Score breakdown UI       | 10       | Open                 |
| E10 | Outfit calendar          | 11       | Open                 |
| E11 | Packing planner          | 12       | Open                 |
| E12 | Delete account           | 13       | Open                 |
| E13 | AI vision auto-tagging   | 14       | Open                 |
| E14 | Learning pipeline        | 15       | Open                 |
| E15 | Garment auto-tag stub    | 16       | Open                 |
| E16 | Recommendation digest    | 17       | Open                 |
| E17 | Sync product feeds       | 18       | Open                 |
| E18 | Weather API caching      | 19       | Open                 |
| E19 | Activity/stats profile   | 20       | Open                 |
| E20 | Loading/toasts/empty     | 21       | Open                 |
| —   | Doc 16 (obsolete)        | 22       | Closed               |

Use this structure to keep GitHub in sync with docs/product and docs/implementation.

_Last updated: as part of product expansion analysis._
