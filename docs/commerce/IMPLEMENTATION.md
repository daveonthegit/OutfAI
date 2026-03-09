# Commerce / Storefront Implementation (Wardrobe-First)

External product suggestions are **secondary and complementary** to outfit recommendations. They appear only after wardrobe-based outfit results and are clearly labeled as external/suggested purchases.

## Data sourcing (live retailers only)

- **Production path:** Real retailer/affiliate APIs and feeds only. No mock or fake product data. See PRD §7 and [SCRAPING_NON_GOAL.md](./SCRAPING_NON_GOAL.md).
- **Provider abstraction:** `server/commerce/providers/types.ts` defines `IProductProvider`; each provider returns `ProviderResult<T>` and fails explicitly when unavailable.
- **Major retailers (in order):** Amazon (PA-API 5.0), Walmart (Affiliate API), Macy's (Catalog API), Best Buy, then configurable JSON feed. See [PROVIDERS.md](./PROVIDERS.md) for env vars and setup.
- **Normalization:** Raw provider payloads are normalized in `server/commerce/normalize.ts` into the shared `ExternalProduct` shape (categories, colors, safe strings).

## Schema

- **external_products** — Normalized products (source, sourceProductId, name, brand, category, color, price, imageUrl, productUrl, affiliateUrl, etc.). See `convex/schema.ts` and [OutfAI_Database_Design.md](../OutfAI_Database_Design.md).
- **commerceInteractionLogs** — Optional click/dismiss tracking; consent-aware (do not track without consent).

## Recommendation logic

- **Service:** `server/services/productRecommendationService.ts`.
- **Inputs:** User garments, optional current outfit, optional mood/weather/temperature.
- **Scoring (explainable):** Wardrobe gap (missing category), color compatibility, style/occasion alignment, layering, penalty for products too similar to owned items. Results are diversified by category.
- **Justification:** One-line reason per suggestion, derived from scoring factors (e.g. “Pairs with your navy tops and adds a neutral layer.”).

## API and UI

- **POST /api/product-recommendations** — Accepts `userId`, `garments`, `products` (from Convex list), optional `outfitGarmentIds`, `mood`, `weather`, `temperature`, `limitCount`. Returns `{ recommendations }`.
- **UI:** “Suggested for your wardrobe” section on the home page, after the outfit grid. Uses `SuggestedProductsSection` and `ExternalProductCard`; labels “Suggested purchase” and “External product”; links open in a new tab.

## Tracking

- **commerceInteractionLogs.log** — Mutation for `clicked` / `dismissed`. Used only when the app has consent; not called by default.

## Limitations

- At least one provider must be configured (env vars in [PROVIDERS.md](./PROVIDERS.md)) for product suggestions to return data. If none are configured or all fail, the API returns `recommendations: []` and `providerStatus: { available: false }`; the UI must not show fake product cards.
- Amazon PA-API is deprecated April 2026; plan migration to Creators API.
- Macy's API access is for approved partners only. Walmart affiliate search endpoint may vary by network (Impact, etc.).
