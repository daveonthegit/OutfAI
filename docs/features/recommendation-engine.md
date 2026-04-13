# Recommendation Engine

Purpose

Describe the current outfit recommendation flow, the main service/API boundaries, and the scoring model that powers the core product experience.

Read this when

- You are changing outfit generation, scoring, or the recommendation API.
- You need to understand how the main home experience is assembled.

Current state

The recommendation system is explainable and rule-based. It uses the user’s garments plus optional mood, weather, temperature, and occasion context to return scored outfits with human-readable explanations.

Key paths

- `server/services/outfitRecommendationService.ts`
- `apps/web/app/api/recommendations/route.ts`
- `apps/web/hooks/use-outfit-recommendations.ts`
- `apps/web/components/outfit-recommendation-panel.tsx`
- `shared/types/index.ts`

Flow

```text
Client UI
  -> useOutfitRecommendations
  -> POST /api/recommendations
  -> OutfitRecommendationService
  -> scored outfit results returned to the UI
```

Pipeline

1. Filter garments by context
2. Generate candidate outfit combinations
3. Score and rank candidates
4. Return explanations and breakdowns for the UI

Current scoring concepts

- Base score
- Color harmony
- Mood alignment
- Diversity/completeness
- Context-sensitive adjustments

Outputs used by the UI

- Ranked outfits
- Total score
- Score breakdown
- Human-readable explanation

Related systems

- Saved outfits are persisted through Convex `outfits`
- Recommendation interactions are logged through Convex `recommendationLogs`
- Style insights are handled separately in `server/services/styleInsightsService.ts`

Known limits

- The system is not yet a learning pipeline
- Auto-tagging and deeper personalization remain future work
- The quality of results still depends heavily on the completeness of garment metadata

Related docs

- [product.md](../product.md)
- [roadmap.md](../roadmap.md)
- [reference/convex-schema.md](../reference/convex-schema.md)
