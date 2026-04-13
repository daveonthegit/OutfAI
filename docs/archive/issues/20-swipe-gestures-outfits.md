# Swipe gestures on outfit cards

**Labels:** `ux`, `mobile`, `enhancement`

## Description

On mobile, allow swipe-right to save and swipe-left to skip (or similar) on outfit cards for faster interaction without tapping small buttons.

## Tasks

- [ ] Add touch handlers (or a library like react-swipeable) to outfit cards on the Today page.
- [ ] Swipe right → trigger save (same as "Save Look" / heart).
- [ ] Swipe left → trigger skip (log skipped, optionally remove from view or show next).
- [ ] Optional: subtle visual hint (e.g. "Save" / "Skip" labels that appear on partial swipe).
- [ ] Ensure accessibility: keyboard and non-touch users can still use buttons.

## Acceptance criteria

- On touch devices, user can swipe to save or skip an outfit; behavior is consistent with button actions.

## References

- apps/web/app/page.tsx (outfit cards)
- docs/implementation/EXPANSION_ROADMAP.md (backlog)
