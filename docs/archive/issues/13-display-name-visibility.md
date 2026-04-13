# Display name vs username and profile visibility (optional)

**Labels:** `profile`, `optional`

## Description

Optional enhancements for identity and future social features.

## Tasks

- [ ] **Display name vs username**: If BetterAuth/plugin supports it, allow separate display name (e.g. "Alex") and username for login (@alex).
- [ ] **Profile visibility**: If adding social/sharing later: "Profile visible to others" or "Show outfit history" toggle; store in `userPreferences` or auth metadata.

## Acceptance criteria

- When implemented: display name and visibility toggles work and persist.

## Depends on

- Issue 1 (editable profile); Issue 7 (userPreferences) for visibility.
