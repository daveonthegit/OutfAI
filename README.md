# OutfAI

Purpose

OutfAI is a wardrobe-first web app that helps users decide what to wear using their own closet, current context, and explainable outfit scoring.

Read this when

- You are new to the repo and need the fastest path to running it.
- You want the high-level product and architecture entry points.

Current state

- Frontend: Next.js 15 App Router in `apps/web`
- Backend/data/auth: Convex in `convex`
- Server-side recommendation and insight services: `server/services`
- Deploy target: Vercel for the web app, Convex Cloud for backend services

Quickstart

1. Install dependencies:

```bash
npm install
```

2. Initialize Convex for local development:

```bash
npx convex dev
```

3. Copy local env values:

```bash
cp .env.example .env.local
```

4. Run the app:

```bash
npm run convex:dev
npm run dev
```

Useful commands

| Command               | Purpose                            |
| --------------------- | ---------------------------------- |
| `npm run dev`         | Start the Next.js app              |
| `npm run convex:dev`  | Start Convex dev sync              |
| `npm run lint`        | Run ESLint                         |
| `npm run typecheck`   | Run TypeScript checks              |
| `npm run test`        | Run Vitest                         |
| `npm run build`       | Build production web app           |
| `npm run gen:db-docs` | Regenerate Convex schema reference |

Docs

- [docs/README.md](docs/README.md)
- [docs/getting-started.md](docs/getting-started.md)
- [docs/architecture.md](docs/architecture.md)
- [docs/product.md](docs/product.md)

Related docs

- [docs/roadmap.md](docs/roadmap.md)
- [docs/contributing.md](docs/contributing.md)
- [docs/reference/convex-schema.md](docs/reference/convex-schema.md)
