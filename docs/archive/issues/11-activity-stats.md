# Activity and stats on profile

**Labels:** `profile`, `ux`, `enhancement`

## Description

Beyond items and categories: show outfits saved this week/month, most worn categories, or a simple streak.

## Tasks

- [ ] Convex queries/aggregations using `outfits` and `recommendationLogs` (e.g. by `savedAt`, by category from garments).
- [ ] Profile section: e.g. "Outfits saved this week", "Most worn category", optional "Streak" (days used).
- [ ] Keep existing wardrobe stats (items, categories); add new stats without cluttering.

## Acceptance criteria

- Profile shows additional activity metrics derived from user data.

## References

- convex/outfits.ts, convex/recommendationLogs.ts
