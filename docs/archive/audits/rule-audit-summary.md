# Rule audit summary (MDC refresh)

This document summarizes the audit that led to the current `.mdc` rules in `rules/`. It is for reference only; the canonical guidance is in the rule files themselves.

## Tech stack (actual)

| Layer            | Technology                                                                         |
| ---------------- | ---------------------------------------------------------------------------------- |
| Frontend         | Next.js 15 App Router, React 19, TypeScript                                        |
| Styling          | Tailwind CSS 4, Radix UI (shadcn), design system "cybersigilism"                   |
| Data (primary)   | Convex — queries/mutations, DB, auth (Better Auth), file storage                   |
| Data (secondary) | Next.js API routes: `/api/recommendations`, `/api/analyze-garment-image`           |
| Auth             | Better Auth 1.4.9 (email/password, email verification), Convex-backed              |
| Server logic     | `server/services/` (e.g. OutfitRecommendationService, garmentImageAnalysisService) |
| tRPC             | Present at `/api/trpc` but not used by the app for main flows                      |
| Testing          | Vitest; tests in `server/**/*.test.ts`, `tests/**/*.test.ts`                       |
| Lint/format      | ESLint, Prettier                                                                   |

**No Prisma, no server/actions, no server/db.**

## Best-practice gaps found

1. **Backend rules were wrong:** Old `backend-patterns.mdc` described a 4-layer Prisma + tRPC + server/actions + server/db architecture that does not exist. Replaced with Convex + server services + API routes.
2. **Frontend rules overstated tRPC:** Frontend doc said "all server calls go through tRPC client hooks". In reality, Convex hooks are primary; recommendations use `fetch("/api/recommendations")`.
3. **shared/schemas:** Backend doc referenced `shared/schemas/` and Zod there; repo has only `shared/types`. Convex uses `v.*`; Zod is used in server routers and API route validation.
4. **tRPC context:** tRPC has empty context and no auth; main app does not use tRPC client for data.
5. **Mock data:** `server/api/routers/recommendations.ts` still has `MOCK_GARMENTS` and `getMockGarments`; documented as legacy in backend rules.
6. **Loading/empty:** Some pages already follow `undefined` = loading, `[]` = empty; frontend rules now codify this and warn against treating `[]` as loading.

## MDC files created/updated/removed

| File                                 | Action                                                              |
| ------------------------------------ | ------------------------------------------------------------------- |
| `rules/frontend-patterns.mdc`        | **Rewritten** — Convex-first, loading/empty/error, no tRPC for data |
| `rules/backend-patterns.mdc`         | **Rewritten** — Convex + server services, no Prisma/actions         |
| `rules/api-patterns.mdc`             | **Created** — When to use Convex vs API routes vs tRPC              |
| `rules/data-fetching-patterns.mdc`   | **Created** — Convex hooks and API fetch usage                      |
| `rules/auth-patterns.mdc`            | **Created** — Better Auth, middleware, getAuthUser                  |
| `rules/database-patterns.mdc`        | **Created** — Convex schema only                                    |
| `rules/testing-patterns.mdc`         | **Created** — Vitest, server tests                                  |
| `rules/security-patterns.mdc`        | **Created** — Auth, env, validation, API safety                     |
| `rules/styling-patterns.mdc`         | **Created** — Tailwind, design system                               |
| `rules/commit-and-pr-guidelines.mdc` | **Created** — Pre-push, PR checklist                                |
| `rules/cicd-rules.mdc`               | **Updated** — Removed Prisma; Convex + db:doc only                  |

None removed; obsolete content was replaced inside existing files.

## Preferred standards going forward

- **Data:** Convex for all CRUD and auth state; Next.js API routes for server-service entry points (recommendations, image analysis).
- **Frontend:** Convex `useQuery`/`useMutation`; loading = `undefined`, empty = `[]` or equivalent; always handle loading/empty/error/success.
- **Backend:** Convex handlers with `getAuthUser(ctx)` and userId scoping; server services pure (no DB/HTTP); API routes validate and call services.
- **Auth:** Session cookie + middleware; Convex `getAuthUser`; use `user._id` as userId everywhere.
- **Validation:** Convex `v.*` in args; API routes validate body; shared types in `shared/types`.
- **Tests:** Vitest; unit tests for server services; add tests for new non-trivial logic.
- **CI:** Keep `npm run ci` and docs-consistency (db:doc) green; no Prisma references.

## Legacy inconsistencies still present

- **tRPC:** Routers and `/api/trpc` exist but are unused by the app for recommendations/analyze; frontend uses Next.js API routes. Prefer not adding new tRPC usage unless there is a clear benefit.
- **MOCK_GARMENTS / getMockGarments** in `server/api/routers/recommendations.ts` — treat as legacy; remove or guard when moving to production-only behavior.
- **API route auth:** `/api/recommendations` and `/api/analyze-garment-image` do not verify session in the route; security rules document this and suggest adding server-side session resolution for stricter guarantees.

## Recommended future cleanup (not done in this audit)

- Remove or clearly guard `getMockGarments` and inline `MOCK_GARMENTS` in the recommendations router.
- Consider adding session verification in API routes that receive userId (e.g. resolve user from Better Auth in the route and reject unauthenticated requests).
- Optionally add rate limiting for `/api/recommendations` and `/api/analyze-garment-image` in production.
- If tRPC remains unused for data flows, consider removing the tRPC router/handler or documenting it as legacy in the codebase.
