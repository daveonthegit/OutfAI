# Contributing to OutfAI

> Guidelines for contributing safely and consistently.

---

## Before you start

- Read [SETUP.md](./SETUP.md) and run the app locally.
- Check [implementation/FEATURE_STATUS.md](../implementation/FEATURE_STATUS.md) and [EXPANSION_ROADMAP.md](../implementation/EXPANSION_ROADMAP.md) for what’s shipped vs planned.
- Follow patterns in [PATTERNS.md](./PATTERNS.md) (and the `rules/` files they reference).

---

## Workflow

1. **Branch** from `main` (e.g. `feat/thing` or `fix/thing`).
2. **Implement** one feature or fix per branch; keep PRs reviewable.
3. **Test** — run `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`.
4. **Docs** — if you change `convex/schema.ts`, run `npm run gen:db-docs` and commit `docs/convex-schema.md`. If you ship a feature, update [FEATURE_STATUS.md](../implementation/FEATURE_STATUS.md) and [FEATURES_CANONICAL.md](../implementation/FEATURES_CANONICAL.md).
5. **PR** — describe what changed and how to test; link any issue.

---

## Conventions

- **Data:** Convex for CRUD and auth; Next.js API routes only for server-side services (recommendations, image analysis).
- **Auth:** Always scope by `userId` from `getAuthUser(ctx)` in Convex; never trust client-provided userId for authorization.
- **UI:** Use design system components and tokens; see [style.md](../style.md) and `/style` in the app.

CI must pass (format, lint, typecheck, test, build, docs-consistency) before merge.
