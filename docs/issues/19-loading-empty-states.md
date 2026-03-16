# Loading states, toasts, and empty state polish

**Labels:** `ux`, `polish`, `enhancement`

## Description

Phase 4.2: Ensure every async operation has a loading state, use toasts for success/error, and provide clear empty states with CTAs so there are no dead ends.

## Tasks

- [ ] **Skeleton loaders**: Add skeleton placeholders for closet grid and outfit cards while data is loading (Convex `useQuery` loading state).
- [ ] **Toasts**: Use sonner (or existing toast) consistently for: garment created/updated/deleted, outfit saved, errors from API/Convex. Replace or supplement any raw `alert()` or inline error-only feedback.
- [ ] **Empty states**: Closet empty → "No garments yet — add your first item" with CTA to /add. No outfits generated → clear message and "Add more items" or "Try a different mood". Archive empty → "No saved outfits" with CTA to Today.
- [ ] **Errors**: Surface Convex/BetterAuth errors in a user-friendly way (toast or inline) instead of uncaught exceptions or blank failures.

## Acceptance criteria

- No raw error messages; every async action has loading and success/error feedback.
- Empty lists show a helpful message and next step.

## References

- docs/implementation/EXPANSION_ROADMAP.md Phase 1
- apps/web (closet, page.tsx, archive)
