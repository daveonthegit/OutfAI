# Wire recommendation logs in UI

**Labels:** `recommendations`, `enhancement`

## Description

Convex `recommendationLogs.log` mutation exists but is never called from the frontend. Wire UI so that "shown", "saved", "skipped", and "worn" actions are logged for analytics and future recommendation improvements.

## Tasks

- [ ] When outfits are generated and shown on the Today page, log `action: "shown"` with garmentIds, mood, weather (call `api.recommendationLogs.log` after generate or when cards are displayed).
- [ ] When user saves an outfit (Save Look), log `action: "saved"` with outfitId and garmentIds.
- [ ] Add explicit "Skip" or "Next" on outfit cards; on action log `action: "skipped"`.
- [ ] From archive or outfit detail, add "I wore this" (or similar); log `action: "worn"` with outfitId and garmentIds.
- [ ] Ensure all log calls pass mood and weather when available so logs are useful for analysis.

## Acceptance criteria

- Every outfit shown is logged as "shown"; save/skip/worn actions are logged; logs are queryable in Convex dashboard.

## References

- convex/recommendationLogs.ts (log mutation)
- apps/web/app/page.tsx (Today, save outfit)
- apps/web/app/archive/page.tsx (saved outfits)
