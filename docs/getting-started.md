# Getting Started

Purpose

Explain how to run OutfAI locally and what environment values matter.

Read this when

- You are setting up the repo for the first time.
- You need the standard local run, test, or build workflow.

Current state

- The repo is managed from the root `package.json`.
- The web app lives in `apps/web`.
- Convex handles data, auth, and storage.

Prerequisites

- Node.js 20+
- npm
- A Convex account

Setup

1. Install dependencies:

```bash
npm install
```

2. Initialize Convex the first time:

```bash
npx convex dev
```

This creates the deployment metadata and writes `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` into `.env.local`.

3. Copy the example env file:

```bash
cp .env.example .env.local
```

4. Set required auth values in Convex:

```bash
npx convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)
npx convex env set SITE_URL http://localhost:3000
```

5. Fill the remaining local values:

| Variable                         | Notes                                                                    |
| -------------------------------- | ------------------------------------------------------------------------ |
| `NEXT_PUBLIC_CONVEX_SITE_URL`    | Same deployment as `NEXT_PUBLIC_CONVEX_URL`, but with the `.site` domain |
| `GOOGLE_APPLICATION_CREDENTIALS` | Optional, only needed for garment image analysis                         |

Run locally

Use two terminals:

```bash
npm run convex:dev
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Quality checks

| Command             | Purpose                  |
| ------------------- | ------------------------ |
| `npm run lint`      | ESLint across the repo   |
| `npm run typecheck` | Full TypeScript check    |
| `npm run test`      | Vitest unit tests        |
| `npm run test:e2e`  | Playwright E2E tests     |
| `npm run build`     | Production web build     |
| `npm run ci`        | Full local CI equivalent |

Key paths

- `apps/web/app`: routes and API handlers
- `convex`: schema, queries, mutations, auth, storage helpers
- `server/services`: recommendation, insights, commerce, and image analysis logic
- `shared`: shared types and utilities

Related docs

- [architecture.md](architecture.md)
- [contributing.md](contributing.md)
- [reference/convex-schema.md](reference/convex-schema.md)
