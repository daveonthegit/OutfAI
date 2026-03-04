# Storefront integration (optional product suggestions)

**Labels:** `commerce`, `optional`, `post-mvp`

## Description

PRD §7: Suggest new items only when they complement the existing wardrobe. Each suggestion includes a justification. Clearly labeled as external products; affiliate or partner feeds only.

## Tasks

- [ ] Define schema or external API for "suggested products" (e.g. affiliate feed or partner API): product id, name, image, link, price, category, tags.
- [ ] After showing wardrobe-based outfits, optionally show "This would go well with…" cards with 1–2 suggested items and short justification (e.g. "Adds a neutral layer to your existing tops").
- [ ] Clear labeling: "Suggested purchase", "External link", open in new tab.
- [ ] Do not block or replace the wardrobe-first flow; suggestions are secondary.
- [ ] Track click-through for metrics (optional).

## Acceptance criteria

- Suggested products appear in a dedicated area with justification; user can click through to retailer. Wardrobe-first flow remains primary.

## References

- docs/OutfAI_PRD.md §7
- docs/implementation-plan.md Phase 5.1
- **Detailed design**: [33-storefront-scraping-product-recommendation.md](33-storefront-scraping-product-recommendation.md) (product recommendation logic, data sourcing, and scraping caveats)
