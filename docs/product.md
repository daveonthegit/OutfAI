# Product

Purpose

Capture what the product does today, which user flows matter, and which important limitations still exist.

Read this when

- You need a grounded view of shipped functionality.
- You want product context before changing routes or business logic.

Current state

OutfAI is a wardrobe-first outfit planning app. Recommendations start from the user’s own closet, use context such as mood and weather, and explain why an outfit was suggested.

Core user flows

| Flow                    | Current behavior                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| Sign up and login       | Email/password auth with verification, login, password reset, and protected routes        |
| Add garments            | Users add items with metadata and optional image upload                                   |
| Browse closet           | Users filter, search, edit, and remove garments                                           |
| Generate outfits        | Users generate outfit recommendations from their closet with mood and weather context     |
| Save and review outfits | Users save outfits, view archive/history, and log worn outfits                            |
| Profile and preferences | Users edit profile info, avatar, preferences, password, email, export, and delete account |
| Planning                | Users can plan outfits on a calendar and create packing lists                             |

Shipped capabilities

- Authentication with Better Auth and Convex-backed sessions
- Garment CRUD with Convex storage-backed images
- Outfit generation with explainable scoring
- Recommendation logging in the UI
- Style insights on the home page
- Optional external product recommendation path in code
- Editable profile, avatar, preferences, export, and account deletion
- Onboarding flow
- Outfit calendar and packing planner
- Password reset, manual weather fallback, loading states, empty states, and score breakdown UI

Current limitations

- The learning pipeline is not built yet; recommendations are still rule-based.
- AI image auto-tagging exists only as an optional analysis path, not a complete user flow.
- Sessions/2FA, social features, and mobile app work remain backlog.
- Accessibility follow-up still exists even though core UI quality has improved.
- Commerce is optional and should not be treated as the main experience.

Non-goals

- Shopping-first behavior
- Retailer scraping as a product default
- Heavy ML pipelines in the current product stage
- Multi-service backend complexity

Key paths

- `apps/web/app/page.tsx`: authenticated home and primary recommendation surface
- `apps/web/app/closet`, `add`, `archive`, `profile`, `onboarding`, `plan`, `calendar`, `packing`
- `server/services/outfitRecommendationService.ts`
- `server/services/styleInsightsService.ts`

Related docs

- [architecture.md](architecture.md)
- [roadmap.md](roadmap.md)
- [features/commerce.md](features/commerce.md)
