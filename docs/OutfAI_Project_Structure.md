# OutfAI — Project Structure

## Overview

This document describes the recommended project structure for OutfAI. The goal is clarity, scalability, and low overhead while following real-world best practices.

---

## Repository Layout

```text
outfai/
├── apps/
│   └── web/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── closet/page.tsx
│       │   ├── onboarding/page.tsx
│       │   └── api/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       ├── styles/
│       └── types/
│
├── server/
│   ├── api/
│   │   ├── trpc.ts
│   │   └── routers/
│   ├── services/
│   ├── db/
│   └── utils/
│
├── shared/
│   ├── types/
│   └── utils/
│
├── docs/
├── scripts/
├── package.json
├── tsconfig.json
└── README.md
```

---

## Rationale

- **apps/web**: UI and routing live close together for fast iteration.
- **server/**: All backend logic is isolated and testable.
- **shared/**: Prevents type drift between frontend and backend.
- **docs/**: Keeps capstone and product documentation organized.
- **scripts/**: One-off tooling (migrations, cleanup jobs).

This structure avoids premature abstraction while remaining production-ready.
