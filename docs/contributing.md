# Contributing

Purpose

Explain how to make changes safely, where project rules live, and how documentation should be maintained.

Read this when

- You are preparing a PR.
- You are changing schema, routes, or shared conventions.

Current state

- The root `package.json` is the main entry point for repo scripts.
- `rules/*.mdc` contains the canonical implementation guidance for frontend, backend, auth, security, testing, and CI.

Workflow

1. Branch from `main`.
2. Keep changes scoped and reviewable.
3. Run the standard checks before handing work off:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

4. If `convex/schema.ts` changes, regenerate the schema reference:

```bash
npm run gen:db-docs
```

5. If shipped functionality changes, update [product.md](product.md) and, if needed, [roadmap.md](roadmap.md).

Project rules

| Area              | Source of truth                    |
| ----------------- | ---------------------------------- |
| Frontend patterns | `rules/frontend-patterns.mdc`      |
| Backend patterns  | `rules/backend-patterns.mdc`       |
| API usage         | `rules/api-patterns.mdc`           |
| Data fetching     | `rules/data-fetching-patterns.mdc` |
| Auth              | `rules/auth-patterns.mdc`          |
| Database          | `rules/database-patterns.mdc`      |
| Styling           | `rules/styling-patterns.mdc`       |
| Testing           | `rules/testing-patterns.mdc`       |
| Security          | `rules/security-patterns.mdc`      |
| CI/CD             | `rules/cicd-rules.mdc`             |

Documentation rules

- Root `README.md` is for orientation only.
- `docs/` contains the durable, live documentation set.
- `docs/archive/` contains historical material and should not be treated as current guidance.
- Inline comments should explain only non-obvious invariants or behavior.

Related docs

- [getting-started.md](getting-started.md)
- [security.md](security.md)
- [ci-cd.md](ci-cd.md)
