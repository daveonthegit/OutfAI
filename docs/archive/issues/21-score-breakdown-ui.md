# Score breakdown UI (expand outfit for category scores)

**Labels:** `recommendations`, `ux`, `enhancement`

## Description

F7: The recommendation engine scores by Color Harmony, Mood Alignment, Style Coherence, etc. Expose this breakdown in the UI when the user expands or taps an outfit so recommendations feel explainable and trustworthy.

## Tasks

- [ ] Ensure the recommendations API returns per-category scores (or extend `OutfitRecommendationService` / response type to include breakdown: colorHarmony, moodAlignment, styleCoherence, etc.).
- [ ] On the Today page (and outfit detail if applicable), add an expandable section or modal: total score + bar or list of category scores (e.g. "Color Harmony 15/20", "Mood 12/20").
- [ ] Keep the existing short explanation text; breakdown complements it.
- [ ] Optional: small visual (segmented bar or mini chart) for at-a-glance breakdown.

## Acceptance criteria

- User can see how the total score is composed (per category) for each outfit.
- Explanation and breakdown align with engine logic.

## References

- server/services/outfitRecommendationService.ts (scoring)
- docs/mvp-features.md F7
- apps/web/app/page.tsx, outfit-recommendation-card
