# Editable profile (name, username, avatar)

**Labels:** `profile`, `enhancement`

## Description

Profile page currently shows read-only name, username, and email with initials-only avatar. Add editable profile using BetterAuth client APIs.

## Tasks

- [ ] Use `BrutalistAvatar` with `src={currentUser?.image}` and `initials={abbr}` so profile image shows when set.
- [ ] Add "Edit profile" mode (or inline edit): form fields for **name** and **username** (and **image** URL for MVP).
- [ ] On submit call `authClient.updateUser({ name, username, image })`. Confirm exact API from BetterAuth User & Accounts and username plugin.
- [ ] Show loading and error states; on success refetch user (Convex `getCurrentUser` reflects auth updates).
- [ ] Surface username format/uniqueness errors from the username plugin in the UI.

## Acceptance criteria

- User can edit display name and username from profile.
- User can set profile image via URL; avatar displays when set.
- Validation and API errors are shown clearly.

## References

- apps/web/app/profile/page.tsx
- apps/web/components/brutalist-avatar.tsx
- BetterAuth: https://better-auth.com/docs/concepts/users-accounts
