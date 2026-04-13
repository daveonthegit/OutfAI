# Storefront scraping and product recommendation

**Labels:** `commerce`, `post-mvp`, `optional`

## Description

Two parts: (1) **product recommendation** — suggest external products that complement the user’s wardrobe, with a clear justification; (2) **product data sourcing** — how to obtain storefront/product data. The PRD (§7) specifies **affiliate or partner feeds only** and lists **scraping retailer websites** as a non-goal; this issue covers both the recommendation system and, for reference, options including scraping (with legal/ethical caveats).

---

## Current implementation: Style insights (primary)

The **home page suggestion slot** now uses **Style insights** (text-only, no product catalog or APIs):

- **Wardrobe gaps** — e.g. “You have no blazer”, “Consider adding a belt”
- **Complete the look** — tips for the current outfit (e.g. “Add a watch”, “Try a darker shoe”)
- **Style / occasion tips** — pairing advice from the user’s wardrobe (e.g. “For work, pair your white shirt with your navy trousers”)

Implemented in: `server/services/styleInsightsService.ts`, `POST /api/style-insights`, `useStyleInsights`, `StyleInsightsSection`. No external product APIs or `external_products` are required. See [commerce/IMPLEMENTATION.md](../commerce/IMPLEMENTATION.md).

**Optional/future:** External product cards (“Suggested for your wardrobe”) and affiliate/partner feeds remain available in code (`SuggestedProductsSection`, `productRecommendationService`, providers) for a future “Shop” or product-link feature; they are not shown on the home page by default.

---

## Part 1: Product recommendation (wardrobe-first) — optional product cards

Suggestions must appear **after** wardrobe-based outfits and only when they **complement** existing pieces. Each suggestion needs a short, explainable reason.

### Tasks

- [x] **Schema**: Add tables (or Convex schema) for external products and product–wardrobe matches. Implemented: `external_products` and `commerceInteractionLogs` in Convex; product–wardrobe matches computed on demand by recommendation service.
- [x] **Recommendation logic**: Given the user’s garments (and optionally current outfit or mood/weather), score external products by: category fit, color compatibility, style/occasion alignment. Implemented in `server/services/productRecommendationService.ts`.
- [x] **Justification**: For each suggested product, generate a one-line reason. Implemented in same service; reasons derived from scoring factors.
- [x] **UI**: “Suggested for your wardrobe” section after outfit results; “Suggested purchase” label; link opens in new tab. Implemented: `SuggestedProductsSection`, `ExternalProductCard`. **Note:** Home page now shows Style insights instead; this UI remains in code for optional/future use.
- [x] **Tracking**: Optional click-through via `commerceInteractionLogs.log`; consent-aware (not called by default).

### Acceptance criteria

- Products are suggested only in context of the user’s wardrobe; each has a clear, short justification. Wardrobe-first flow remains primary.

---

## Part 2: Product data sourcing

### Preferred: Affiliate and partner APIs

- [ ] Integrate one or more **affiliate or partner feeds** (e.g. affiliate network product APIs, retailer partner APIs) to get product id, name, category, color, price, image URL, product URL.
- [ ] Normalize into `external_products` (or Convex equivalent); support multiple sources.
- [ ] Respect rate limits and terms of use; cache where allowed.
- [ ] PRD-aligned and lowest legal/ToS risk.

### Alternative: Storefront scraping (non-goal per PRD; high risk)

The PRD explicitly states **no scraping retailer websites** as a non-goal. If the team nevertheless explores scraping:

- [ ] **Legal and ToS**: Review target sites’ Terms of Service and robots.txt; get legal input. Many retailers prohibit scraping; unauthorized scraping can create liability.
- [ ] **Ethical and technical**: Prefer structured data (e.g. JSON-LD, official APIs) over scraping HTML. If scraping: respect robots.txt, rate-limit heavily, use a clear user-agent, and avoid overloading servers.
- [ ] **Data quality**: Parsed fields (name, category, color, price, image) are fragile when markup changes; plan for breakage and maintenance.
- [ ] **Attribution**: Ensure product links and any affiliate parameters comply with partner and platform rules.

Recommendation: treat **affiliate/partner APIs** as the default path; treat scraping as an optional, high-risk alternative that may conflict with PRD and legal policy.

---

## References

- docs/OutfAI_PRD.md §7 (Storefront Integration), Non-Goals (no scraping)
- docs/OutfAI_Database_Design.md (external_products, product_matches)
- docs/issues/23-storefront-integration.md (high-level storefront issue)
