# Commerce / Storefront Implementation (Wardrobe-First)

## Current feature: Style insights (no product APIs)

The **home page suggestion area** uses **Style insights** — text-only, rule-based suggestions that do not require any product catalog or retailer APIs:

- **Wardrobe gaps** — e.g. “You have no blazer”, “Consider adding a belt”
- **Complete the look** — tips for the current outfit (e.g. “Add a watch”, “Try a darker shoe”)
- **Style / occasion tips** — pairing advice from the user’s wardrobe (e.g. “For work, pair your white shirt with your navy trousers”)

- **Service:** `server/services/styleInsightsService.ts`
- **API:** `POST /api/style-insights` — accepts `garments`, optional `outfitGarmentIds`, `mood`, `occasion`, `temperature`. Returns `{ gaps, completeTheLook, styleTips }`.
- **UI:** “Style insights” section on the home page, after the outfit grid. Uses `StyleInsightsSection` and `useStyleInsights`. No external product data or provider configuration required.

---

## Optional: External product suggestions (affiliate/partner)

External product cards (“Suggested for your wardrobe”) and live retailer APIs are **optional** and not shown on the home page by default. They remain in code for a future “Shop” or product-link feature.

### Data sourcing (live retailers only)

- **Production path:** Real retailer/affiliate APIs and feeds only. No mock or fake product data. See PRD §7 and [SCRAPING_NON_GOAL.md](./SCRAPING_NON_GOAL.md).
- **Provider abstraction:** `server/commerce/providers/types.ts` defines `IProductProvider`; each provider returns `ProviderResult<T>` and fails explicitly when unavailable.
- **Major retailers (in order):** Amazon (PA-API 5.0), Walmart (Affiliate API), Macy's (Catalog API), Best Buy, then configurable JSON feed. See [PROVIDERS.md](./PROVIDERS.md) for env vars and setup.
- **Normalization:** Raw provider payloads are normalized in `server/commerce/normalize.ts` into the shared `ExternalProduct` shape (categories, colors, safe strings).

### Schema

- **external_products** — Normalized products (source, sourceProductId, name, brand, category, color, price, imageUrl, productUrl, affiliateUrl, etc.). See `convex/schema.ts` and [OutfAI_Database_Design.md](../OutfAI_Database_Design.md). Used only when product suggestions are enabled.
- **commerceInteractionLogs** — Optional click/dismiss tracking; consent-aware (do not track without consent).

### Product recommendation logic (optional path)

- **Service:** `server/services/productRecommendationService.ts`.
- **Inputs:** User garments, optional current outfit, optional mood/weather/temperature.
- **Scoring (explainable):** Wardrobe gap (missing category), color compatibility, style/occasion alignment, layering, penalty for products too similar to owned items. Results are diversified by category.
- **Justification:** One-line reason per suggestion, derived from scoring factors (e.g. “Pairs with your navy tops and adds a neutral layer.”).

### API and UI (optional path)

- **POST /api/product-recommendations** — Accepts `userId`, `garments`, `products` (from Convex list), optional `outfitGarmentIds`, `mood`, `weather`, `temperature`, `limitCount`. Returns `{ recommendations }`.
- **UI:** `SuggestedProductsSection` and `ExternalProductCard`; labels “Suggested purchase” and “External product”; links open in a new tab. Not rendered on the home page by default.

### Tracking

- **commerceInteractionLogs.log** — Mutation for `clicked` / `dismissed`. Used only when the app has consent; not called by default.

### Limitations

- At least one provider must be configured (env vars in [PROVIDERS.md](./PROVIDERS.md)) for product suggestions to return data. If none are configured or all fail, the API returns `recommendations: []` and `providerStatus: { available: false }`; the UI must not show fake product cards.
- Amazon PA-API is deprecated April 2026; plan migration to Creators API.
- Macy's API access is for approved partners only. Walmart affiliate search endpoint may vary by network (Impact, etc.).
