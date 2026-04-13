# Security

Purpose

Summarize the current security model, expected implementation rules, and the main operational cautions in the codebase.

Read this when

- You are changing auth, uploads, API routes, or environment handling.
- You need the current security baseline before shipping backend changes.

Current state

- Authentication is provided by Better Auth with Convex-backed storage.
- Convex handlers are expected to derive authorization from the authenticated user, not from client-supplied identifiers.
- Some server-side hardening work remains backlog and should be treated as real operational debt.

Core rules

- Use `getAuthUser(ctx)` for Convex-side authorization and ownership checks.
- Do not trust client-provided `userId` for authorization decisions.
- Keep secrets in Convex env or local `.env.local`; expose only public values intentionally.
- Validate Convex inputs with `v.*` and validate API route bodies explicitly.
- Treat uploads and image-analysis paths as abuse-sensitive.

Operational cautions

- Recommendation, image-analysis, and similar API routes should be reviewed for server-side auth and rate limiting requirements.
- Upload validation should not rely only on client-side checks.
- Sensitive account flows should be tested end-to-end, not just at the component level.

Where to look

- `rules/security-patterns.mdc`
- `convex/auth.ts`
- `apps/web/middleware.ts`
- `apps/web/app/api/*`

Related docs

- [contributing.md](contributing.md)
- [ci-cd.md](ci-cd.md)
