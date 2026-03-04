# AI vision auto-tagging (extract from photo)

**Labels:** `closet`, `ai`, `post-mvp`, `optional`

## Description

Use a vision model to suggest category, color, material (and optionally tags) when the user uploads a garment photo, reducing manual data entry. PRD technical scope: "image recognition (optional)".

## Tasks

- [ ] Integrate a vision API (e.g. Google Vision, OpenAI Vision, or open-source model) to analyze the garment image.
- [ ] Return suggested: category, primary color, material, season. Optionally short tags (e.g. "striped", "long-sleeve").
- [ ] Pre-fill the add-garment form with suggestions; user can edit before saving.
- [ ] Handle failures gracefully (e.g. "Could not analyze image — fill in manually").
- [ ] Consider cost and rate limits; optional feature or daily cap.

## Acceptance criteria

- Uploading a garment photo can auto-fill category, color, and optionally other fields; user confirms or edits.

## References

- docs/OutfAI_PRD.md technical scope
- docs/implementation-plan.md Phase 5.5
- apps/web/app/api/analyze-garment-image (existing stub or similar)
