# Phase 1 — GitHub Issue Sync

> Tracking doc for closing/updating/creating GitHub issues after Phase 1 implementation.  
> Use with [GITHUB_ISSUES_STRUCTURE.md](./GITHUB_ISSUES_STRUCTURE.md).  
> **Note:** Actual close/update/create on GitHub require repo access (e.g. `gh` CLI or GitHub web).

---

## Closed (completed by Phase 1)

| GitHub # | Title / doc                  | Action                                                                                             |
| -------- | ---------------------------- | -------------------------------------------------------------------------------------------------- |
| 6        | Password reset (E5)          | **Close** — Forgot-password + reset-password pages and auth sendResetPassword implemented.         |
| 9        | Manual weather fallback (E8) | **Close** — City input + Open-Meteo geocoding + forecast on Today.                                 |
| 10       | Score breakdown UI (E9)      | **Close** — API returns scoreBreakdown; outfit card "See why" expandable.                          |
| 21       | Loading/toasts/empty (E20)   | **Close** — Sonner in layout; closet/home skeletons and empty states; toasts for CRUD/save/errors. |

Recommendation logs (E1 / #2) was already closed as implemented.

---

## Updated (partial or context change)

| GitHub # | Title                             | Suggested update                                                                                                                                                        |
| -------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 15       | Wire recommendation logs (doc 15) | Already done; ensure issue is closed. If still open, close with comment: "Completed: shown/saved/skipped in authenticated-home, worn in archive; Skip button on cards." |
| 17       | Weather manual fallback (doc)     | Close as done; link to Phase 1 implementation.                                                                                                                          |
| 19       | Loading/empty states (doc)        | Close as done; link to Phase 1.                                                                                                                                         |
| 21       | Score breakdown (doc)             | Close as done; link to Phase 1.                                                                                                                                         |
| 22       | Password reset (doc)              | Close as done; link to Phase 1.                                                                                                                                         |

---

## New issues (optional)

- None required for Phase 1. Any follow-up (e.g. rate limiting, E2E for new flows) can be created under Phase 2/3 milestones.

---

## Deferred to Phase 2

Per roadmap, the following remain Phase 2 and are unchanged:

- User preferences UI (#3)
- Complete onboarding (#4)
- Editable profile (#5)
- Data export (#7)
- Closet search (#8)
- Delete account (#13)
- Account settings (password/email) — doc 03

---

## Labels and milestones

- For closed issues: add comment referencing `docs/implementation/PHASE_1_SUMMARY.md` and branch `feature/phase-1-implementation`.
- Ensure **Phase 1 — Critical** milestone exists; closed issues should be in that milestone.
- Labels used: `feature`, `enhancement`, `backend`, `frontend`, `ux`, `security` as in GITHUB_ISSUES_STRUCTURE.md.

---

_Last updated: Phase 1 implementation._
