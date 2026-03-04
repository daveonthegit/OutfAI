# User preferences (Convex)

**Labels:** `preferences`, `backend`, `enhancement`

## Description

Add Convex table and UI for app preferences (temperature unit, default mood, notifications, recommendation style, locale).

## Tasks

- [ ] Add `userPreferences` table in convex/schema.ts: `userId`, `temperatureUnit`, `defaultMood`, notification flags, `recommendationStyle`, `locale`, `timezone` (all optional). Index by `userId`.
- [ ] Convex queries: get preferences for current user. Mutations: update preferences (ensure `userId` from auth).
- [ ] "Preferences" section on `/profile/settings`: temperature unit (°C / °F), default mood, notification toggles (wire emails later), recommendation style, locale/timezone if needed.
- [ ] Use preferences in app: weather/recommendations use `temperatureUnit`; mood UI can prefill `defaultMood`; engine can use `recommendationStyle`.

## Acceptance criteria

- User can set and persist preferences; app respects them where applicable.

## References

- convex/schema.ts
