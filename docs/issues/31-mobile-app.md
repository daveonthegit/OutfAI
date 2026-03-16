# Mobile app (React Native / Expo)

**Labels:** `mobile`, `post-mvp`, `optional`

## Description

PRD: "Secondary (future): Mobile (React Native / Expo)". Build a native or Expo shell that reuses shared types and API so users can manage closet and get recommendations on the go.

## Tasks

- [ ] Init Expo (or React Native) project; share types from `shared/types` and API contract (REST or tRPC adapter for Convex/BetterAuth).
- [ ] Core screens: login, closet list, add garment (camera + form), Today (mood, weather, generate), outfit detail, profile.
- [ ] Auth: BetterAuth session or token; secure storage for session on device.
- [ ] Optional: push notifications for "What to wear today?" or outfit reminders.
- [ ] Publish to TestFlight / Play Internal or app stores when ready.

## Acceptance criteria

- Users can perform core flows (view closet, add item, get outfit) from the mobile app with shared backend.

## References

- docs/OutfAI_PRD.md
- docs/implementation/EXPANSION_ROADMAP.md Phase 4 (backlog)
