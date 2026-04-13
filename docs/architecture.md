# Architecture

Purpose

Describe how the current application is structured, where the main runtime boundaries are, and which directories own which responsibilities.

Read this when

- You are tracing a feature across frontend, API, and Convex.
- You need to know where new code should live.

Current state

OutfAI is a single-repo TypeScript application with one Next.js web app, one Convex backend, and a small set of server-side services used by Next.js API routes.

Runtime model

```text
Browser
  -> Next.js App Router UI in apps/web/app
  -> Convex React client for CRUD and auth-backed data
  -> Next.js API routes for recommendations, style insights, weather, product suggestions, image analysis
  -> server/services business logic
  -> Convex for persisted data, auth, and storage
```

Folder responsibilities

| Path                  | Responsibility                                                                        |
| --------------------- | ------------------------------------------------------------------------------------- |
| `apps/web/app`        | Pages, layouts, route handlers, and route-local UI                                    |
| `apps/web/components` | Reusable frontend components                                                          |
| `apps/web/hooks`      | Client-side hooks for Convex and API workflows                                        |
| `apps/web/lib`        | Route helpers, auth client helpers, and shared frontend utilities                     |
| `convex`              | Schema, queries, mutations, auth integration, storage helpers, and backend data model |
| `server/services`     | Pure service logic used by API routes                                                 |
| `server/commerce`     | Optional commerce provider adapters and normalization                                 |
| `shared`              | Shared types and utility functions                                                    |
| `rules`               | Project coding guidance used during implementation and review                         |

Key routes

Primary user-facing routes in `apps/web/app` include:

- `/`: landing page or authenticated home
- `/login`, `/signup`, `/check-email`, `/verify-email`, `/forgot-password`, `/reset-password`
- `/onboarding`
- `/closet`, `/add`, `/archive`, `/profile`, `/profile/settings`
- `/mood`, `/outfit`, `/plan`, `/calendar`, `/packing`, `/style`

Key API routes

- `POST /api/recommendations`
- `POST /api/style-insights`
- `POST /api/product-recommendations`
- `POST /api/analyze-garment-image`
- `GET /api/weather`
- `/api/auth/[...all]`

Data model

- Convex is the source of truth for garments, outfits, plans, packing lists, recommendation logs, preferences, profiles, and optional commerce data.
- Better Auth is stored in Convex through `@convex-dev/better-auth`.
- The generated schema reference lives in [reference/convex-schema.md](reference/convex-schema.md).

Design choices

- Use Convex for persisted application data and auth-aware CRUD.
- Use Next.js API routes only when a request needs service-layer orchestration or external APIs.
- Keep server services stateless and reusable.
- Keep shared types in `shared` to avoid drift between the app, Convex handlers, and services.

What belongs where

- Root `README.md`: orientation, quickstart, and links
- `docs/`: durable technical and product documentation
- Inline comments: only for non-obvious invariants, ownership rules, auth boundaries, and recommendation logic

Related docs

- [getting-started.md](getting-started.md)
- [product.md](product.md)
- [features/recommendation-engine.md](features/recommendation-engine.md)
