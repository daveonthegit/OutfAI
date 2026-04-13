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

---

## CI dependency baseline

GitHub Actions runs **`npm audit --omit=dev --audit-level=high`** (see `.github/workflows/ci.yml`). The job is **advisory** (`continue-on-error: true`) so merges are not blocked by npm alone; still run **`npm audit fix`** after dependency work and commit a clean **`package-lock.json`** when fixes apply.

### Known issues without a clean upstream fix

These appear in **`npm audit --omit=dev`** until dependencies change:

| Area                                                               | Notes                                                                                                                                                                   |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **paapi5-nodejs-sdk** → **crypto-js**                              | Amazon PA-API SDK pins an older **crypto-js**. Used only in **server-side** commerce code. Monitor SDK releases or replace signing if Amazon publishes a patched major. |
| **request** (deprecated) → **form-data**, **qs**, **tough-cookie** | Direct **`request`** usage should be migrated to **`fetch`** / **`undici`** over time; nested advisories clear when **`request`** is removed.                           |
