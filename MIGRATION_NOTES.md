# OutfAI — Migration Notes

This file documents assumptions, decisions, and trade-offs made during the
migration from the originally planned Supabase + Prisma stack to Convex.

---

## Actual State Before Migration

Neither Supabase nor Prisma were ever installed or in use. They appeared only
in planning docs and blank env vars. The auth system was already BetterAuth
connecting to a local PostgreSQL via `pg.Pool` (Docker Compose). All garment,
outfit, and archive data was hardcoded mock arrays.

The "migration" is therefore a **greenfield Convex implementation**, not a
data migration.

---

## Architecture Decisions

### 1. Convex as the single backend

Convex replaces both the planned Supabase (database + auth) and Prisma (ORM).
All data — users, sessions, garments, outfits, recommendation logs — lives in
Convex. PostgreSQL and Docker are fully removed.

### 2. BetterAuth stored in Convex via `@convex-dev/better-auth`

The `@convex-dev/better-auth` component (pinned to `better-auth@1.4.9`) stores
BetterAuth's session and user tables directly inside Convex instead of a
separate PostgreSQL database. This means:

- No separate database process is needed for local development.
- Auth requests flow: Browser → Next.js `/api/auth/[...all]` (thin proxy) →
  Convex HTTP actions (BetterAuth routes) → Convex DB.
- The `username` plugin is included alongside the required `convex()` plugin.

**Future path for auth:** If you need JWT tokens for external services or
social providers, consult the
[Convex + BetterAuth docs](https://labs.convex.dev/better-auth/framework-guides/next).

### 3. `garment_tags` table flattened into `tags: v.array(v.string())`

The original DB design had a separate `garment_tags` table with a `source`
field (`auto` | `user`). For MVP this is overkill. Tags are embedded directly
on the `garments` collection as a string array. Tag provenance can be added
later via a `tagSources` map field if needed.

### 4. `outfit_items` join table replaced by embedded `garmentIds` array

The original DB design had an `outfit_items` table linking garments to outfits
with a `position` field. For MVP, garment IDs are embedded directly in the
`outfits` document as `garmentIds: v.array(v.id("garments"))`. This avoids
multi-document reads for a feature that fits well within Convex's document
model. Ordering/position can be added later if needed.

### 5. `userId` is a string, not a Convex ID

All collections store `userId: v.string()` rather than `v.id("users")`. This
is because `authComponent.getAuthUser(ctx)` returns `userId` as a string
(the Convex doc ID serialized as string), and it avoids coupling the auth
component's internal user ID representation to our schema. If user records are
deleted and recreated, documents will become orphaned — acceptable at MVP scale.
A future cleanup job can address this.

### 6. Middleware remains a lightweight cookie check

`apps/web/middleware.ts` checks for the presence of the
`better-auth.session_token` cookie (same name used by BetterAuth under the
Convex adapter). It does **not** cryptographically validate the token — that
happens inside Convex functions via `authComponent.getAuthUser(ctx)`. This is
the same pattern as the pre-migration auth setup.

### 7. Recommendation engine uses real garments with mock fallback

`apps/web/app/page.tsx` fetches real Convex garments via `useQuery`. If a user
has no garments yet, it falls back to the hardcoded `CLOSET_ITEMS` array so
the home page remains functional out of the box. Remove the fallback once
onboarding populates at least a few garments.

### 8. Docker and Docker Compose removed

`docker-compose.yml`, `docker-compose.prod.yml`, `Dockerfile`, and
`Dockerfile.dev` were deleted. Docker was only needed to run the PostgreSQL
database for BetterAuth. Since auth now runs in Convex, no local database
process is required. For production, Vercel deploys the Next.js app and Convex
Cloud runs the backend.

---

## Removed Artifacts

| Artifact                                         | Reason                                        |
| ------------------------------------------------ | --------------------------------------------- |
| `apps/web/lib/auth.ts`                           | Replaced by `convex/auth.ts` (Convex adapter) |
| `scripts/update-supabase-structure.ts`           | Replaced by `scripts/generate-convex-docs.ts` |
| `docs/supabase-structure.md`                     | Replaced by `docs/convex-schema.md`           |
| `docker-compose.yml` / `docker-compose.prod.yml` | PostgreSQL no longer needed                   |
| `Dockerfile` / `Dockerfile.dev`                  | No container needed for dev                   |
| `.github/workflows/ci.yml` `prisma` job          | `prisma/schema.prisma` was never created      |
| `pg` / `@types/pg` npm packages                  | Replaced by Convex's built-in data layer      |
| Supabase env vars in `.env.example`              | Were blank placeholders; removed              |
| `DATABASE_URL`, `POSTGRES_*` env vars            | No PostgreSQL; removed                        |
| `docker:*` npm scripts                           | No Docker; removed                            |

---

## Verification

Run this after any future dependency changes to confirm no Supabase/Prisma
references have crept back into source code:

```bash
# Must return 0 files (excluding markdown docs)
rg "supabase|prisma|@prisma|from 'pg'" . --glob "!*.md" --glob "!MIGRATION_NOTES.md" -l
```

---

## What's Still Needed Before Production

1. **Run `npx convex dev`** to create the Convex project and generate
   `convex/_generated/` types (required for TypeScript to compile).
2. **Set Convex env vars**: `BETTER_AUTH_SECRET` and `SITE_URL`.
3. **Image uploads**: garments currently store an optional `imageUrl`. A full
   image upload pipeline (R2/S3 → Convex storage) is planned but not
   implemented.
4. **Signup page**: the `/signup` route shows a stub. Implement
   `authClient.signUp.email()` or `authClient.signUp.username()`.
5. **Onboarding**: seed a few garments for new users to make the recommendation
   engine useful on first login.
