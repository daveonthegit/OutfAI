# OutfAI

**Wardrobe-first outfit intelligence.** OutfAI helps you decide what to wear by generating context-aware outfits from your own closet—using mood and weather—with optional, explainable suggestions for new pieces that fit what you already own.

---

## Features

- **Wardrobe-first** — Your closet is the system of record; recommendations start from what you own.
- **Context-aware** — Outfits consider mood, weather, and occasion.
- **Explainable** — Recommendations are transparent and trustworthy, not black-box.
- **Optional commerce** — Suggested purchases justify how they fit your existing wardrobe.

_Currently in MVP: UI and project scaffold are in place; recommendation engine and backend integrations are planned._

---

## Tech Stack

| Layer        | Stack                                                          |
| ------------ | -------------------------------------------------------------- |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript                  |
| **Styling**  | Tailwind CSS 4, Radix UI, custom “cybersigilism” design system |
| **API**      | tRPC (type-safe, shared with backend)                          |
| **Backend**  | Node/TypeScript, service layer, Prisma + PostgreSQL (planned)  |
| **Storage**  | Object storage for images (R2/S3 planned)                      |

---

## Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm** (or pnpm / yarn)

---

## Getting Started

### Clone and install

```bash
git clone https://github.com/daveonthegit/OutfAI.git
cd OutfAI
npm install
```

### Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app runs with Turbopack.

### Other scripts

| Command         | Description                 |
| --------------- | --------------------------- |
| `npm run build` | Production build (apps/web) |
| `npm run start` | Start production server     |
| `npm run lint`  | Lint apps/web               |

---

## Project Structure

```
OutfAI/
├── apps/web/          # Next.js app (UI, routing)
│   ├── app/            # App Router: /, /closet, /mood, /add, /archive, /explain, /kit, /style, /onboarding
│   ├── components/     # Brutalist primitives, outfit components, shadcn-style UI
│   ├── hooks/          # Shared hooks
│   ├── lib/            # Client utilities
│   └── public/         # Static assets
├── server/            # Backend (tRPC, services, db)
│   ├── api/            # tRPC routers and setup
│   ├── services/       # Business logic
│   └── db/             # Data access (Prisma planned)
├── shared/             # Types and utils shared by frontend and backend
├── docs/               # Product and technical documentation
└── scripts/            # One-off tooling (migrations, etc.)
```

See [docs/OutfAI_Project_Structure.md](docs/OutfAI_Project_Structure.md) for the full layout and rationale.

---

## Documentation

| Document                                                        | Description                               |
| --------------------------------------------------------------- | ----------------------------------------- |
| [OutfAI_PRD.md](docs/OutfAI_PRD.md)                             | Product requirements, goals, and strategy |
| [OutfAI_Architecture.md](docs/OutfAI_Architecture.md)           | System architecture and key decisions     |
| [OutfAI_Database_Design.md](docs/OutfAI_Database_Design.md)     | Database schema and design                |
| [OutfAI_Project_Structure.md](docs/OutfAI_Project_Structure.md) | Repository layout and conventions         |

---

## License

Private / capstone project. All rights reserved.
