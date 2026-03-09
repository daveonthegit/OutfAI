# PR: Garment auto-tagging (rules-based defaults)

## GitHub issue

Closes #39 — Garment auto-tagging stub (rules-based defaults)

## Summary

Implements F8 (P1): when creating a garment, auto-suggest or auto-apply tags based on **category**, **color**, and optional **season** using a small rules table. No ML; no schema changes. Reduces empty tags and improves recommendation relevance. User can add or remove tags before submit.

## What was implemented

1. **Shared utility** (`shared/garment-default-tags.ts`)
   - `getDefaultTagsForGarment(category, primaryColor, season?)` returns default tags:
     - **Category** → e.g. top/bottom → `["casual", "everyday"]`; shoes → `["everyday"]`; outerwear → `["layering", "everyday"]`; accessory → `["everyday"]`.
     - **Color** → lowercase primary color name added as a tag.
     - **Season** (optional) → `spring` | `summer` | `fall` | `winter` | `all-season` when provided.

2. **Add garment page** (`apps/web/app/add/page.tsx`)
   - When the user selects both **category** and **color**, the tags field is pre-filled with the result of `getDefaultTagsForGarment(selectedCategory, selectedColor)`.
   - Pre-fill runs on category/color change so suggestions stay in sync; user can add or remove tags before submit.

3. **Convex create mutation** (`convex/garments.ts`)
   - `tags` is now optional in `garments.create` args.
   - When `tags` is missing or empty, the server computes defaults via `getDefaultTagsForGarment(category, primaryColor, season)` so that programmatic or API-only creates also get sensible tags.

## Design decisions

- **Single source of truth**: Tag rules live in `shared/garment-default-tags.ts` so both the Next.js add page and Convex use the same logic.
- **Pre-fill on change**: Tags are updated whenever category or color changes so the suggestion always matches the current selection; the user can still edit.
- **No schema change**: Existing `garments.tags` array is used; no new tables or fields.
- **Season**: Supported in the utility and in the create mutation; the add page does not yet expose a season field, so season is only used when passed (e.g. future form or API).

## Files changed

| Path                                         | Change                                                   |
| -------------------------------------------- | -------------------------------------------------------- |
| `shared/garment-default-tags.ts`             | **New** — rules-based default tag mapping                |
| `apps/web/app/add/page.tsx`                  | Pre-fill tags from category/color via `useEffect`        |
| `convex/garments.ts`                         | Optional `tags`; default when empty using shared utility |
| `docs/issues/30-garment-autotagging-stub.md` | Tasks marked done where implemented                      |

## Testing notes

- **Manual**: Go to `/add`, select a category (e.g. top) and a color (e.g. Navy). Tags should pre-fill with e.g. `casual`, `everyday`, `navy`. Change color to Black → tags update to include `black`. Add or remove tags, then save → garment saves with the chosen tags.
- **Server default**: If the client sends no tags or empty tags to `garments.create`, the created garment still has default tags (category + color + optional season).
- **Lint/typecheck**: `npm run lint` and `npm run typecheck` pass. Build may require `CONVEX_SITE_URL` in env for full success.

## Screenshots

N/A — form behavior only; tags field shows pre-filled values when category and color are selected.
