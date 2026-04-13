# Commerce

Purpose

Explain the optional commerce path, provider model, and the rules that keep OutfAI wardrobe-first instead of shopping-first.

Read this when

- You are working on product suggestions or provider integrations.
- You need to know what commerce behavior is intentionally out of scope.

Current state

- Style insights are live and do not require retailer integrations.
- External product recommendations exist as an optional path and are not the default home-page experience.

Live behavior

- `server/services/styleInsightsService.ts` powers wardrobe-gap and style-tip guidance
- `POST /api/style-insights` returns text-based insights from the user’s garments

Optional commerce path

- `server/services/productRecommendationService.ts`
- `server/commerce/providers/*`
- `POST /api/product-recommendations`
- Convex `externalProducts` and `commerceInteractionLogs`

Provider model

- Providers are server-side only
- Retailer data should come from official APIs or feeds
- A configurable JSON feed is the fallback provider type
- No client-side secrets

Non-goals

- Scraping retailer sites as a production data source
- Making commerce the primary user journey
- Showing fake product cards when no provider is configured

Operational rule

If no provider is configured, the app should fail closed and show no product suggestions rather than inventing product data.

Related docs

- [product.md](../product.md)
- [roadmap.md](../roadmap.md)
