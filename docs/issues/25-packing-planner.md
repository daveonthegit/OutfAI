# Packing planner (trip capsule wardrobe)

**Labels:** `planning`, `post-mvp`, `enhancement`

## Description

User selects trip dates and destination (or manual weather); app suggests a minimal "capsule" set of garments to pack that can form multiple outfits. PRD: "Packing and occasion planning".

## Tasks

- [ ] New "Packing" or "Trip" flow: enter dates (and optionally destination for weather), or manual "expected weather".
- [ ] Algorithm: from user's wardrobe, select a small set of pieces that (a) suit the expected weather and (b) can combine into N outfits (e.g. 5 pieces → 3–5 outfits). Reuse or extend recommendation engine logic.
- [ ] UI: list of "Pack these" garments + optional "Sample outfits" from the capsule.
- [ ] Optional: export as checklist or share list.

## Acceptance criteria

- User can get a suggested packing list that fits trip duration/weather and maximizes outfit combinations.

## References

- docs/OutfAI_PRD.md roadmap
- docs/implementation-plan.md Phase 5.4
