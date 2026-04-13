# CI/CD

Purpose

Document the current CI checks, deployment model, and the small set of details contributors need to keep the pipeline healthy.

Read this when

- You are changing repo-level scripts, quality gates, or deployment behavior.
- You need to understand what must pass before merge.

Current state

- CI runs in GitHub Actions.
- Preview and production deployments run through Vercel.
- Convex handles backend deployment separately from the web app.

Quality gates

The standard quality path is:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

Schema docs are also checked for drift through `npm run gen:db-docs`.

Deploy model

- PRs: preview deployment through Vercel
- Production: controlled release/deploy flow tied to the configured GitHub/Vercel setup
- Backend/data changes: applied through Convex deployment workflow

Required secrets

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Maintenance rules

- If you add a new required quality gate, wire it into CI and document it here.
- If you change the Convex schema, regenerate the schema reference and commit it.
- Keep this file concise; detailed incident notes or migration history belong in `docs/archive/`.

Related docs

- [contributing.md](contributing.md)
- [reference/convex-schema.md](reference/convex-schema.md)
