# E2E tests for critical flows

**Labels:** `testing`, `quality`, `enhancement`

## Description

Add end-to-end tests (e.g. Playwright or Cypress) for the most important user journeys so regressions are caught before release.

## Tasks

- [ ] Set up E2E framework (Playwright recommended for Next.js) and add to CI.
- [ ] Test: sign up (or login with fixture) → redirect to app.
- [ ] Test: add a garment (minimal form + optional image) → appears in closet list.
- [ ] Test: from Today, generate outfits (with mocked or test garments) → at least one outfit card appears.
- [ ] Test: save an outfit → appears in archive (or saved list).
- [ ] Use test account and seed data or API helpers so tests are fast and stable.
- [ ] Run E2E in CI on PR (or nightly); document how to run locally.

## Acceptance criteria

- Critical path (auth → add garment → generate → save) is covered by at least one E2E test; CI runs them.

## References

- apps/web (login, signup, add, page.tsx, archive)
- .github/workflows/ci.yml
