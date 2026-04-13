# Closet search by name

**Labels:** `closet`, `ux`, `enhancement`

## Description

Closet already has category filter; add search by garment name (and optionally by tags) so users can quickly find items in a large wardrobe.

## Tasks

- [ ] Add a search input on the closet page (debounced, e.g. 300ms).
- [ ] Filter `filteredItems` by name (case-insensitive substring match) and optionally by tag match.
- [ ] Show "No results" empty state when search + category yield nothing.
- [ ] Optional: persist last search in session or URL query for shareable links.

## Acceptance criteria

- User can type in a search box and see only garments whose name (or tags) match.
- Search works together with the existing category filter.

## References

- apps/web/app/closet/page.tsx (filteredItems, activeCategory)
