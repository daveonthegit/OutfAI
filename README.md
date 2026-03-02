# OutfAI

**Wardrobe-first outfit intelligence.** OutfAI helps you decide what to wear by generating context-aware outfits from your own closet—using mood and weather—with optional, explainable suggestions for new pieces that fit what you already own.

---

## Features

- **Wardrobe-first** — Your closet is the system of record; recommendations start from what you own.
- **Context-aware** — Outfits consider mood, weather, and occasion.
- **Explainable** — Recommendations are transparent and trustworthy, not black-box.
- **Optional commerce** — Suggested purchases justify how they fit your existing wardrobe.

---

## Tech Stack

| Layer        | Stack                                                                   |
| ------------ | ----------------------------------------------------------------------- |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript                           |
| **Styling**  | Tailwind CSS 4, Radix UI, custom "cybersigilism" design system          |
| **API**      | tRPC (type-safe, shared with backend)                                   |
| **Backend**  | Convex (database, server functions, auth via `@convex-dev/better-auth`) |
| **Auth**     | BetterAuth 1.4.9 (email/password + username plugin, stored in Convex)   |
| **Storage**  | Object storage for images (R2/S3 planned)                               |

---

## Prerequisites

- **Node.js** 20+ recommended
- **npm**
- A free **[Convex](https://convex.dev)** account

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/daveonthegit/OutfAI.git
cd OutfAI
npm install
```

### 2. Initialize Convex (first time only)

```bash
npx convex dev
```

This prompts you to log in / create a free Convex account, then writes
`CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` into `.env.local` automatically.

### 3. Set auth secrets in your Convex deployment

```bash
npx convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)
npx convex env set SITE_URL http://localhost:3000
```

### 4. Configure your local env

```bash
cp .env.example .env.local
```

Then fill in the two remaining values in `.env.local`:

| Variable                         | Value                                                            |
| -------------------------------- | ---------------------------------------------------------------- |
| `NEXT_PUBLIC_CONVEX_SITE_URL`    | Same as `NEXT_PUBLIC_CONVEX_URL` but the domain ends in `.site`  |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to your Google Cloud Vision service account JSON (optional) |

### 5. Run locally (two terminals)

**Terminal 1** — Convex dev server (keeps schema and functions in sync):

```bash
npm run convex:dev
```

**Terminal 2** — Next.js:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with any username / password; an account is created automatically on first sign-in.

---

## Common Scripts

| Command                 | Description                                         |
| ----------------------- | --------------------------------------------------- |
| `npm run dev`           | Next.js dev server (Turbopack)                      |
| `npm run convex:dev`    | Convex dev server (keeps functions + types in sync) |
| `npm run convex:deploy` | Deploy Convex functions to production               |
| `npm run build`         | Production Next.js build                            |
| `npm run gen:db-docs`   | Regenerate `docs/convex-schema.md` from the schema  |
| `npm run typecheck`     | Full TypeScript check                               |
| `npm run lint`          | ESLint                                              |
| `npm run test`          | Vitest unit tests                                   |

---

## Project Structure

```
OutfAI/
├── convex/            # Convex backend (schema, functions, auth)
│   ├── schema.ts       # Single source of truth for all collections
│   ├── auth.ts         # BetterAuth setup (Convex adapter)
│   ├── http.ts         # HTTP router (mounts BetterAuth endpoints)
│   ├── garments.ts     # Garment queries and mutations
│   ├── outfits.ts      # Outfit queries and mutations
│   └── recommendationLogs.ts
├── apps/web/          # Next.js app (UI, routing)
│   ├── app/            # App Router pages
│   ├── components/     # Brutalist primitives, outfit components
│   ├── hooks/          # Shared hooks
│   └── lib/            # Auth client + server helpers
├── server/            # Backend services (recommendation engine, Vision API)
├── shared/            # Types and utils shared by frontend and backend
├── docs/              # Product and technical documentation
└── scripts/           # Tooling (generate-convex-docs.ts, etc.)
```

See [docs/OutfAI_Project_Structure.md](docs/OutfAI_Project_Structure.md) for the full layout and rationale.

---

## Documentation

| Document                                                    | Description                               |
| ----------------------------------------------------------- | ----------------------------------------- |
| [OutfAI_PRD.md](docs/OutfAI_PRD.md)                         | Product requirements, goals, and strategy |
| [OutfAI_Architecture.md](docs/OutfAI_Architecture.md)       | System architecture and key decisions     |
| [OutfAI_Database_Design.md](docs/OutfAI_Database_Design.md) | Database schema and design                |
| [convex-schema.md](docs/convex-schema.md)                   | Auto-generated Convex schema reference    |
| [MIGRATION_NOTES.md](MIGRATION_NOTES.md)                    | Migration decisions and assumptions       |

---

## License

Private / capstone project. All rights reserved.
