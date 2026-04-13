# Learning pipeline (improve scoring from feedback)

**Labels:** `recommendations`, `post-mvp`, `optional`

## Description

Use recommendation logs (shown/saved/skipped/worn) to adjust scoring weights or preferences per user over time, so the engine gets better at suggesting what they like. PRD: "Learning from feedback".

## Tasks

- [ ] Ensure recommendation logs are rich enough (garmentIds, mood, weather, action, timestamp).
- [ ] Define a simple learning signal: e.g. saved/worn = positive, skipped = negative; optionally weight "worn" higher than "saved".
- [ ] Per-user model or weights: e.g. store in `userPreferences` or a small "userScoringWeights" table (colorHarmonyWeight, moodWeight, etc.) updated periodically from logs.
- [ ] Recommendation engine reads user weights (if present) and adjusts category scores accordingly.
- [ ] Optional: "Why this outfit?" that references "based on outfits you've liked".

## Acceptance criteria

- Over time, recommendations shift toward styles/combos the user saves or wears; logic is explainable (no black box).

## References

- docs/implementation/EXPANSION_ROADMAP.md Phase 4
- convex/recommendationLogs.ts
- server/services/outfitRecommendationService.ts
