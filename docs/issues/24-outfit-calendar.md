# Outfit calendar (plan outfits for upcoming days)

**Labels:** `calendar`, `post-mvp`, `enhancement`

## Description

Let users assign saved outfits (or generate and assign) to specific dates so they can plan what to wear in advance. PRD roadmap: "Outfit history and calendar".

## Tasks

- [ ] Add optional `plannedDate` (or similar) to outfits schema, or a separate `outfit_plans` table (userId, outfitId, date).
- [ ] Calendar view (week or month): show which days have an outfit assigned; tap day to assign or change.
- [ ] From archive or Today: "Plan for…" → pick a date → link outfit to that date.
- [ ] Optional: weather forecast for planned date and nudge if outfit might not match weather.

## Acceptance criteria

- User can see a calendar and assign outfits to future dates; calendar view shows planned outfits.

## References

- docs/OutfAI_PRD.md roadmap
- docs/implementation-plan.md Phase 5.3
- convex/outfits.ts
