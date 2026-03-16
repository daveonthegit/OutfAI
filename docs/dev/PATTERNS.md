# OutfAI — Coding Patterns

> Canonical patterns are in the **`rules/`** directory (`.mdc` files). This doc points you to them.

---

## Where to look

| Area          | Rule file                            | Summary                                             |
| ------------- | ------------------------------------ | --------------------------------------------------- |
| Backend       | `rules/backend-patterns.mdc`         | Convex + server services; no Prisma/server/db       |
| Frontend      | `rules/frontend-patterns.mdc`        | Convex hooks, loading/empty/error, no tRPC for data |
| API           | `rules/api-patterns.mdc`             | When to use Convex vs API routes vs tRPC            |
| Data fetching | `rules/data-fetching-patterns.mdc`   | Convex hooks and API fetch usage                    |
| Auth          | `rules/auth-patterns.mdc`            | Better Auth, middleware, getAuthUser                |
| Database      | `rules/database-patterns.mdc`        | Convex schema only                                  |
| Styling       | `rules/styling-patterns.mdc`         | Tailwind, design system                             |
| Testing       | `rules/testing-patterns.mdc`         | Vitest, where to put tests                          |
| Security      | `rules/security-patterns.mdc`        | Auth, env, validation, API safety                   |
| CI/CD         | `rules/cicd-rules.mdc`               | CI and deploy conventions                           |
| Commits & PRs | `rules/commit-and-pr-guidelines.mdc` | Branch names, PR checklist                          |

---

## Quick reference

- **Data:** Convex for all CRUD and auth state; API routes for recommendation/style-insights/analyze-garment.
- **Loading/empty:** `undefined` = loading, `[]` or empty array = empty; always handle both.
- **Validation:** Convex `v.*` in args; API routes validate body; use `shared/types` for shared shapes.

See [rule-audit-summary.md](../rule-audit-summary.md) for the audit that produced the current rules.
