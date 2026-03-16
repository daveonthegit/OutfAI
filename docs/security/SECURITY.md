# OutfAI — Security

> Summary of security practices. Detailed guidance: **`rules/security-patterns.mdc`**.

---

## Auth and session

- Session: Better Auth cookie; middleware protects routes; Convex uses `getAuthUser(ctx)` for authorization.
- **Always** scope data by `userId` from `getAuthUser(ctx)`; never trust client-provided userId.
- API routes `/api/recommendations` and `/api/analyze-garment-image` rely on middleware; consider adding server-side session checks for stricter guarantees.

---

## Secrets and env

- Convex: `npx convex env set ...` for `BETTER_AUTH_SECRET`, `SITE_URL`; never commit.
- Next.js: Use `.env.local` for API keys (e.g. Google Vision); never commit. Only `NEXT_PUBLIC_*` and Convex URLs are exposed to the client.

---

## Validation and safety

- Convex: Validate all inputs with `v.*` validators.
- API routes: Validate body; return 400 when invalid. No raw SQL or string interpolation from user input.
- File uploads: Use Convex upload URLs; do not accept large raw bodies in API routes.

---

## Optional improvements

- Rate limiting on `/api/recommendations` and `/api/analyze-garment-image` in production.
- Server-side size limit for base64 image in analyze-garment-image.

For full patterns, see **`rules/security-patterns.mdc`**.
