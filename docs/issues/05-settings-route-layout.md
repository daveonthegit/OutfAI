# Settings route and layout

**Labels:** `profile`, `routing`, `enhancement`

## Description

With full scope (profile, account, preferences, stats), split content: `/profile` for identity, stats, quick actions; dedicated route for heavy settings.

## Tasks

- [ ] Add `/profile/settings` (or `/settings`) route.
- [ ] `/profile`: identity (view/edit), wardrobe stats, activity (when implemented), quick actions, link to "Settings".
- [ ] `/profile/settings`: change password, email, verification, delete account, sessions, 2FA, preferences.
- [ ] Shared header/nav and bottom nav; consistent styling with existing profile and login pages.

## Acceptance criteria

- Profile page is focused on identity and overview; settings page holds password, email, delete account, and preferences.
