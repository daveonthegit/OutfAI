# OutfAI — CI/CD Guide

## Overview

OutfAI uses **GitHub Actions** for CI and **Vercel** for deployments.
Every pull request gets fast, parallel quality checks and a preview URL.
Production deploys happen only from semver tags (`v*`) after CI passes and
a manual approval gate in the GitHub `production` environment.

### Why this stack?

| Concern     | Choice              | Reason                                                                                                    |
| ----------- | ------------------- | --------------------------------------------------------------------------------------------------------- |
| CI runner   | GitHub Actions      | Free for public repos, generous minutes for private, already integrated                                   |
| Web hosting | Vercel              | Zero-config Next.js deploys, automatic previews, free hobby tier                                          |
| Server/API  | Vercel Serverless   | tRPC routes can be served as Next.js API routes on the same Vercel project — no separate server to manage |
| DB          | Supabase (Postgres) | Managed, free tier, built-in auth                                                                         |

---

## CI Pipeline

### What runs and when

| Job                   | PR  | Push to `main` | Tag `v*` |            Blocks merge?            |
| --------------------- | :-: | :------------: | :------: | :---------------------------------: |
| **setup**             |  ✓  |       ✓        |    ✓     |                  —                  |
| **format-check**      |  ✓  |       ✓        |    ✓     |                 Yes                 |
| **lint**              |  ✓  |       ✓        |    ✓     |                 Yes                 |
| **typecheck**         |  ✓  |       ✓        |    ✓     |                 Yes                 |
| **test**              |  ✓  |       ✓        |    ✓     |                 Yes                 |
| **build**             |  ✓  |       ✓        |    ✓     |                 Yes                 |
| **prisma**            |  ✓  |       ✓        |    ✓     | Yes (skips gracefully if no schema) |
| **docs-consistency**  |  ✓  |       ✓        |    ✓     |                 Yes                 |
| **security-baseline** |  ✓  |       ✓        |    ✓     |            No (advisory)            |

### Job graph

```
setup ──┬── format-check ──┐
        ├── lint ───────────┤
        ├── typecheck ──────┼── build
        ├── test ───────────┘
        ├── prisma
        ├── docs-consistency
        └── security-baseline (non-blocking)
```

`build` runs only after `format-check`, `lint`, `typecheck`, and `test` all pass.
All other jobs run in parallel after `setup`.

### Concurrency

- PR runs: `ci-<ref>` — pushing to the same PR cancels the previous run.
- Main runs: same group but `cancel-in-progress: false` — main builds are never cancelled.

---

## CD Pipeline

### Preview deployments (PRs)

Workflow: `.github/workflows/preview.yml`

1. Triggered on every `pull_request` to `main`.
2. Uses the Vercel CLI to build and deploy a preview.
3. Posts/updates a comment on the PR with the preview URL.
4. Concurrency: one active preview per PR number.

**Limitation:** The preview deploys the Next.js web app only. The server
layer runs inside the same Next.js Vercel project (as API routes / server
components). If you split the server into a separate deployment, document
the preview strategy for it here.

### Production deployments (tags)

Workflow: `.github/workflows/release.yml`

1. Triggered on semver tags: `git tag v1.0.0 && git push --tags`.
2. Re-runs full CI as a gate (`ci-gate` job reuses `ci.yml`).
3. Deploys to Vercel production inside the `production` GitHub Environment.
4. Creates a GitHub Release with auto-generated notes.

**Manual approval:** Configure the `production` environment in
GitHub → Settings → Environments → Add required reviewers.

### Rollback

Vercel keeps every deployment immutable. To roll back:

```bash
# List recent deployments
vercel ls --token=$VERCEL_TOKEN

# Promote a previous deployment to production
vercel promote <deployment-url> --token=$VERCEL_TOKEN
```

Or use the Vercel dashboard → Deployments → click the three dots → "Promote to Production".

---

## Branching Strategy

| Branch         | Purpose                            |
| -------------- | ---------------------------------- |
| `main`         | Always deployable. Protected.      |
| `feat/<name>`  | Feature work. PR into `main`.      |
| `fix/<name>`   | Bug fixes. PR into `main`.         |
| `chore/<name>` | Tooling, deps, CI. PR into `main`. |

### PR rules (configure in GitHub Settings → Branches)

- [x] Require status checks to pass: `format-check`, `lint`, `typecheck`, `test`, `build`
- [x] Require branches to be up to date before merging
- [x] Require linear history (squash merge recommended)
- [ ] Optional: require 1 approval (recommended for team projects)

---

## Conventions for CI/CD Compliance

### Folder structure

```
OutfAI/
├── apps/web/          # Next.js — auto-linted, type-checked, built
├── server/            # tRPC — auto-linted, type-checked
├── shared/            # Types & utils — auto-linted, type-checked
├── tests/             # Cross-cutting tests (vitest auto-discovers)
├── scripts/           # Tooling scripts
├── templates/         # Code generation templates
├── docs/              # Generated + manual documentation
└── prisma/            # Schema (when created)
```

### Test placement

Tests are discovered by Vitest from these globs:

```
tests/**/*.test.ts
server/**/*.test.ts
shared/**/*.test.ts
apps/web/**/*.test.ts
apps/web/**/*.test.tsx
```

**Convention:**

| Code location              | Test location                                                 | Example                               |
| -------------------------- | ------------------------------------------------------------- | ------------------------------------- |
| `server/services/foo.ts`   | `tests/services/foo.test.ts` OR `server/services/foo.test.ts` | `outfitRecommendationService.test.ts` |
| `shared/utils/bar.ts`      | `tests/utils/bar.test.ts` OR `shared/utils/bar.test.ts`       | `scoring.test.ts`                     |
| `apps/web/hooks/useFoo.ts` | `apps/web/hooks/useFoo.test.ts`                               | `useRecommendations.test.ts`          |

Co-located tests (next to source) or centralized in `tests/` — both work.

### Adding a new package/workspace

Currently the repo is a flat monorepo (single `package.json`). To add a
new workspace:

1. Add the dependency to root `package.json`.
2. Ensure any new source directory is included in `tsconfig.json` → `include`.
3. Ensure Vitest's `include` globs cover the new directory.
4. Run `npm install` and commit `package-lock.json`.

---

## Scripts Reference

| Script            | What it does                                                     | Used in CI? |
| ----------------- | ---------------------------------------------------------------- | :---------: |
| `format`          | Prettier — format all files in-place                             |      —      |
| `format:check`    | Prettier — check without writing                                 |      ✓      |
| `lint`            | ESLint — check all TS/JS files                                   |      ✓      |
| `lint:fix`        | ESLint — auto-fix                                                |      —      |
| `typecheck`       | `tsc --noEmit` — full type-check                                 |      ✓      |
| `test`            | Vitest — run all tests once                                      |      ✓      |
| `test:watch`      | Vitest — watch mode for development                              |      —      |
| `build`           | Next.js production build                                         |      ✓      |
| `prisma:validate` | Validate Prisma schema                                           |      ✓      |
| `prisma:format`   | Format Prisma schema                                             |      ✓      |
| `db:doc`          | Generate `docs/supabase-structure.md` from Prisma schema         |      ✓      |
| `ci`              | Meta-script: runs format:check → lint → typecheck → test → build | ✓ (release) |
| `prepare`         | Husky — installs git hooks on `npm install`                      |      —      |

---

## Secrets & Environment Variables

### Required GitHub Secrets

| Secret              | Where to get it                        | Used by                      |
| ------------------- | -------------------------------------- | ---------------------------- |
| `VERCEL_TOKEN`      | Vercel dashboard → Settings → Tokens   | `preview.yml`, `release.yml` |
| `VERCEL_ORG_ID`     | `vercel pull` → `.vercel/project.json` | `preview.yml`, `release.yml` |
| `VERCEL_PROJECT_ID` | `vercel pull` → `.vercel/project.json` | `preview.yml`, `release.yml` |

### Setting up Vercel secrets

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Link the project (run from repo root)
vercel link

# 3. The IDs are now in .vercel/project.json
cat .vercel/project.json
# → { "orgId": "...", "projectId": "..." }

# 4. Create a token at https://vercel.com/account/tokens

# 5. Add all three as GitHub repository secrets:
#    Settings → Secrets and variables → Actions → New repository secret
```

### Environment variable strategy

| Context        | How env vars are set                                                       |
| -------------- | -------------------------------------------------------------------------- |
| **Local dev**  | `.env.local` (git-ignored)                                                 |
| **Preview**    | Vercel dashboard → Project → Settings → Environment Variables (Preview)    |
| **Production** | Vercel dashboard → Project → Settings → Environment Variables (Production) |
| **CI**         | No runtime env vars needed — CI only builds and checks                     |

### Variables the app needs

| Variable                        |        Required         | Context             |
| ------------------------------- | :---------------------: | ------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      |           Yes           | Preview, Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` |           Yes           | Preview, Production |
| `SUPABASE_SERVICE_ROLE_KEY`     |       Server only       | Production          |
| `DATABASE_URL`                  | If using Prisma runtime | Production          |

---

## Caching Strategy

| What                | How                                         | Key                                      |
| ------------------- | ------------------------------------------- | ---------------------------------------- |
| npm download cache  | `actions/setup-node` with `cache: npm`      | Automatic (based on `package-lock.json`) |
| `node_modules`      | `actions/cache` shared across jobs in a run | `nm-{os}-{hash(package-lock.json)}`      |
| Next.js build cache | Vercel handles internally                   | Automatic                                |

The `setup` job installs once; all downstream jobs restore `node_modules`
from the cache. If `package-lock.json` hasn't changed, `npm ci` is skipped
entirely.

---

## Troubleshooting — When CI Fails

### Decision tree

```
CI failed
├── format-check failed
│   └── Run `npm run format` locally, commit
├── lint failed
│   └── Run `npm run lint:fix` locally, review remaining warnings, commit
├── typecheck failed
│   └── Run `npm run typecheck` locally, fix type errors
├── test failed
│   └── Run `npm run test` locally, fix failing tests
├── build failed
│   └── Run `npm run build` locally, fix build errors
│   └── Check if new env vars are needed (build-time)
├── prisma failed
│   └── Run `npm run prisma:format` then `npm run prisma:validate`
├── docs-consistency failed
│   └── Run `npm run db:doc` and commit the generated files
└── security-baseline failed (non-blocking)
    └── Run `npm audit` — update vulnerable packages if feasible
```

### Common issues

| Symptom                          | Fix                                                                 |
| -------------------------------- | ------------------------------------------------------------------- |
| "No package-lock.json"           | Run `npm install` locally and commit `package-lock.json`            |
| Cache miss in every run          | Check that `package-lock.json` is committed                         |
| Preview deploy fails             | Verify `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` secrets |
| `tsc` errors on CI but not local | Ensure `tsconfig.json` `include` covers all source files            |
| Tests pass locally, fail in CI   | Check for timezone/locale-dependent logic; CI runs UTC              |

---

## Add a New Feature Safely — Checklist

Use this checklist every time you add a new resource or feature.
Following it guarantees CI stays green.

### Backend resource (using `templates/resource/`)

- [ ] Create Zod schema in `shared/` (validates at runtime + gives TS types)
- [ ] Create service in `server/services/` with pure business logic
- [ ] Create tRPC router in `server/api/routers/` using the service
- [ ] Wire router into `server/api/routers/_app.ts`
- [ ] Add at least 1 test file for the service's pure logic
- [ ] Run `npm run ci` locally — all green

### Frontend feature

- [ ] Create page/panel in `apps/web/app/`
- [ ] Handle loading / empty / error / success states
- [ ] Create hook in `apps/web/hooks/` for data fetching
- [ ] Add at least 1 test for the hook or pure logic
- [ ] Run `npm run ci` locally — all green

### Database change

- [ ] Update `prisma/schema.prisma`
- [ ] Run `npm run prisma:format`
- [ ] Run `npm run prisma:validate`
- [ ] Run `npm run db:doc` and commit `docs/supabase-structure.md`
- [ ] Run migrations: `npx prisma migrate dev --name <description>`

### New script or tooling

- [ ] Add the script to root `package.json`
- [ ] If it's a quality gate, wire it into CI (`ci.yml`)
- [ ] Document in this file's Scripts Reference table

### Pre-push sanity

```bash
npm run ci
```

This single command runs format-check → lint → typecheck → test → build.
If it passes locally, CI will pass.

---

## Definition of Done for CI/CD

A CI/CD setup is "done" when:

1. **Every PR gets automated feedback** within 5 minutes.
2. **No manual steps** are required to validate code quality.
3. **Preview URLs** are posted to PRs automatically.
4. **Production deploys** require an explicit tag + approval gate.
5. **Rollback** takes < 2 minutes via Vercel dashboard.
6. **Adding a new feature** doesn't require CI/CD changes —
   following conventions is sufficient.
7. **`npm run ci`** locally reproduces what CI does remotely.
8. **Generated docs** are enforced — stale docs fail the build.
9. **Security** is monitored (even if advisory-only for now).
10. **This document is up to date** with the actual pipeline.
