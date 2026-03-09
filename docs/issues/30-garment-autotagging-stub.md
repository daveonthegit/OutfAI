# Garment auto-tagging stub (rules-based defaults)

**Labels:** `closet`, `enhancement`, `p1`

## Description

F8 (P1): When creating a garment, auto-suggest or auto-apply tags based on category, color, and season (no ML). Reduces empty tags and improves recommendation relevance. User can add/remove tags manually.

## Tasks

- [x] On garment create (or on form blur), derive default tags: e.g. category → "casual", "everyday"; color → color name; season → "spring", "summer", etc. Map from a small rules table or inline logic. _(Implemented in `shared/garment-default-tags.ts`; see PR for GitHub #39.)_
- [x] Pre-fill the tags field with these suggestions; user can edit before submit.
- [ ] Optional: on image analysis (if/when added), merge vision suggestions with rules-based tags.
- [x] Tags are stored in existing `garments.tags` array; no schema change.

## Acceptance criteria

- New garments get sensible default tags based on category/color/season; user can correct or add more.

## References

- docs/mvp-features.md F8
- apps/web/app/add/page.tsx
- convex/garments.ts
