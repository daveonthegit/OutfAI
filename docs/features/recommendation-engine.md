# Recommendation Engine

Purpose

Describe how outfit recommendations are generated, scored, and delivered to the app.

Read this when

- You are changing outfit generation, scoring, personalization, or the home / onboarding / packing flows.

Current state

Recommendations are computed in **Convex**: `convex/recommendationRank.ts` (`getRankedRecommendations`) loads the user’s garments (optionally filtered by `garmentIds`), builds candidates, scores them with the personalized scorer (`convex/personalization/scoring.ts`), applies ε-greedy exploration, and returns ranked outfits with score breakdowns and `pickMode` (`exploit` | `explore`). User preferences and learned weights come from Convex `userPreferences`; interaction feedback flows through `recommendationLogs.logOutfitAction` and `personalization/hooks`.

Key paths

- `convex/recommendationRank.ts` — ranked outfits query
- `convex/recommendations/candidates.ts` — candidate generation
- `convex/personalization/*` — scoring, signals, decay, preference store
- `apps/web/hooks/use-outfit-recommendations.ts` — client hook wrapping `useQuery(api.recommendationRank.getRankedRecommendations)` (used by onboarding, packing trip ideas, demo panel)
- `apps/web/components/home/authenticated-home.tsx` — home feed uses the same query directly + logging
- `shared/types/index.ts` — `Outfit`, `ScoreBreakdown`, etc.

Flow

```text
Client UI
  -> useQuery(api.recommendationRank.getRankedRecommendations) or useOutfitRecommendations (same query)
  -> Convex: candidates + personalized score + exploration
  -> outfits + breakdowns returned to the UI
```

Outputs used by the UI

- Ranked outfits with `garmentIds`, `explanation`, `scoreBreakdown`, `topContributors`, `pickMode`
- Aggregate `totalActions`, `streakDays` where returned for retention UI

Related systems

- Saved outfits: Convex `outfits`
- Interaction logs: Convex `recommendationLogs` + personalization hooks
- Style insights: separate API / services

Related docs

- [product.md](../product.md)
- [roadmap.md](../roadmap.md)
- [reference/convex-schema.md](../reference/convex-schema.md)
