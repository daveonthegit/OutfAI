# Accessibility audit and fixes

**Labels:** `a11y`, `ux`, `enhancement`

## Description

Ensure the app is usable with keyboard navigation, screen readers, and sufficient color/contrast. Address critical a11y issues across auth, closet, and recommendation flows.

## Tasks

- [ ] Run axe or Lighthouse accessibility audit on key pages (login, signup, closet, Today, profile).
- [ ] Fix: focus order, focus visible styles, skip links if needed.
- [ ] Forms: all inputs have associated labels (or aria-label); errors announced (aria-live or role="alert").
- [ ] Buttons and links: descriptive labels (avoid "Click here"); icon-only buttons have aria-label.
- [ ] Color: ensure text/background contrast meets WCAG AA where applicable; do not rely on color alone for meaning.
- [ ] Images: alt text for garment images and avatars (or alt="" for decorative).
- [ ] Document any known limitations and future improvements.

## Acceptance criteria

- No critical or serious a11y violations on main flows; keyboard-only and screen-reader users can sign in, add a garment, and generate an outfit.

## References

- apps/web (forms, buttons, closet, page.tsx)
