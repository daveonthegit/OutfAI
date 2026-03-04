# Onboarding — complete profile flow

**Labels:** `onboarding`, `enhancement`

## Description

Replace onboarding stub with a short "complete your profile" flow (name, username, optional avatar).

## Tasks

- [ ] Replace apps/web/app/onboarding/page.tsx stub with minimal form: name, username, optional avatar URL.
- [ ] "Save and continue" calls `authClient.updateUser` then redirects to `/profile` or `/`.
- [ ] Alternatively: redirect to `/profile?onboarding=1` with one-time banner + inline edit; clear banner when profile is saved.
- [ ] Trigger onboarding for new users (e.g. after signup or first login when name/username missing).

## Acceptance criteria

- New or incomplete users can complete profile via onboarding; redirect to profile or home afterward.
