# OutfAI — Commit Plan (PR-sized chunks)

This maps implementation phases to small PRs that are easy to review and grade.
Each PR should be demoable or at least verifiable via tests/logs.

Conventions:

- Prefix branches: `feat/`, `chore/`, `fix/`
- PR title: `PR-<NN>: <short description>`
- Every PR includes:
  - a short "what changed"
  - how to test
  - screenshots if UI changes

---

## Phase 0 — Repo baseline + rules

### PR-01: Add engineering rule files and templates

**Includes**

- `rules/backend-patterns.mdc`
- `rules/frontend-patterns.mdc`
- `templates/resource/**`
  **DoD**
- Rules are present and referenced by Cursor
- Template folder is usable for scaffolding

### PR-02: Add schema doc generator wiring

**Includes**

- `docs/supabase-structure.md` (generated placeholder)
- `scripts/update-supabase-structure.ts`
- `package.json` scripts:
  - `db:doc` -> generate supabase-structure
    **DoD**
- Running `npm run db:doc` deterministically regenerates `docs/supabase-structure.md`

---

## Phase 1 — Vertical slice (demo-ready early)

### PR-03: Auth + protected routing skeleton

**Includes**

- Auth wiring (Supabase or existing approach)
- Route group `(authed)` + redirect rules
- Minimal "You are signed in" page
  **DoD**
- Unauthed users cannot access `/closet`
- Authed users can load the app without errors

### PR-04: Garments resource (backend only)

**Includes**

- Prisma model (if not already)
- tRPC router: `garments.list/getById/create/update/delete`
- Service + actions + shared schemas/types
  **DoD**
- `garments.list` returns empty array for a new user
- Create and list works via a simple script or tRPC caller

### PR-05: Closet UI minimal (upload later, start with manual add)

**Includes**

- `/closet` page + `ClosetPanel`
- Add garment form (name + category + season + colors minimal)
- List garments UI with empty/loading/error states
  **DoD**
- User can add 1 garment and see it listed (end-to-end)

### PR-06: Recommendations generate (wire engine to real garments)

**Includes**

- `recommendations.generate` uses garments from DB
- Return outfits + explanation
- Minimal `/recommend` page showing generated outfits
  **DoD**
- With 3–6 garments, user can generate at least 1 outfit in UI
- Explanation string appears on screen

---

## Phase 2 — Closet photos + tagging (capstone polish)

### PR-07: Image upload pipeline (storage + URLs)

**Includes**

- Signed upload endpoint (or Supabase storage)
- Store image URLs on garment
- Thumbnail strategy (even if mocked)
  **DoD**
- User can upload an image and see it rendered in closet grid

### PR-08: Tagging UX (manual tags + correction)

**Includes**

- UI to add/remove tags
- Persist garment_tags with `source=user`
  **DoD**
- Tags saved and reloaded correctly

---

## Phase 3 — Outfit lifecycle + logging

### PR-09: Outfits persistence + outfit detail page

**Includes**

- Save generated outfit (outfits + outfit_items)
- `/outfits/[id]` page to view a saved outfit
  **DoD**
- User can save an outfit and open it later

### PR-10: Recommendation logs (shown/saved/skipped/worn)

**Includes**

- `recommendations.logInteraction` mutation
- UI triggers logging events
  **DoD**
- Logs show up in DB; basic admin/debug page optional

---

## Phase 4 — Demo hardening

### PR-11: Error handling + empty state polish

**Includes**

- Standardized error components
- Better empty states and CTAs
  **DoD**
- No "dead ends" in UI; all empties guide next action

### PR-12: Seed/dev tooling + smoke checks

**Includes**

- Seed script for garments
- Minimal smoke checklist in README
  **DoD**
- Fresh clone can be demo-ready in <10 minutes

---

## Optional Phase 5 — Commerce stub (only if time)

### PR-13: External products tables + placeholder UI

**Includes**

- Optional commerce schema + placeholder feed importer
  **DoD**
- Clearly labeled as optional; does not block wardrobe-first flow
