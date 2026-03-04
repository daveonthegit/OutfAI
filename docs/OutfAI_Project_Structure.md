# OutfAI — Project Structure

## Overview

This document describes the recommended project structure for OutfAI. The goal is clarity, scalability, and low overhead while following real-world best practices.

---

## Repository Layout

```text
OutfAI/
├── apps/
│   └── web/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── closet/page.tsx
│       │   ├── onboarding/page.tsx
│       │   ├── (e.g. page.tsx, closet/, onboarding/, login/, signup/, profile/, add/, archive/, outfit/)
│       │   └── api/          # Next.js API routes (e.g. recommendations, auth proxy)
│       ├── components/
│       ├── hooks/
│       ├── lib/              # Auth client, server helpers
│       ├── styles/
│       └── middleware.ts
│
├── convex/
│   ├── schema.ts             # Single source of truth for collections
│   ├── auth.ts               # BetterAuth setup (Convex adapter)
│   ├── auth.config.ts
│   ├── http.ts               # HTTP router (BetterAuth endpoints)
│   ├── garments.ts           # Garment queries and mutations
│   ├── outfits.ts            # Outfit queries and mutations
│   ├── recommendationLogs.ts
│   ├── seed.ts               # Dev seed helpers
│   └── _generated/           # Convex-generated types (do not edit)
│
├── server/
│   ├── api/
│   │   ├── trpc.ts           # tRPC context (legacy; primary data flow is Convex)
│   │   └── routers/          # tRPC routers (e.g. recommendations, garments)
│   ├── services/             # Business logic (e.g. OutfitRecommendationService)
│   ├── db/                   # Unused (Convex is the DB); placeholder only
│   └── utils/
│
├── shared/
│   ├── types/
│   └── utils/
│
├── docs/
├── scripts/                  # e.g. generate-convex-docs.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## Rationale

- **apps/web**: UI and routing live close together for fast iteration. Next.js API routes handle recommendations and auth proxy; Convex React client is used for real-time data.
- **convex/**: Backend database, server functions, auth (BetterAuth), and file storage. Schema and functions are the single source of truth for app data.
- **server/**: Pure business logic (e.g. recommendation engine) and legacy tRPC routers. No database layer here; Convex holds all persisted data.
- **shared/**: Prevents type drift between frontend and backend.
- **docs/**: Keeps capstone and product documentation organized. `docs/convex-schema.md` is generated from `convex/schema.ts`.
- **scripts/**: One-off tooling (e.g. generate Convex schema docs).

This structure avoids premature abstraction while remaining production-ready.
