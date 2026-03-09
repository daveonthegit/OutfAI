# Profile and Settings — Implementation

> Summary of the user profile and settings feature implementation.

## Overview

- **Profile**: Identity (display name, username, email) comes from Better Auth user table. Extended profile data (bio, avatar) lives in Convex `profiles` table.
- **Settings**: Dedicated route `/profile/settings` for account and security; profile edit and style preferences remain on `/profile`.

## Data model

- **Convex `profiles`** (see [convex-schema.md](./convex-schema.md)): `userId`, `bio`, `avatarStorageId`, `updatedAt`. Index: `by_userId`.
- **Better Auth user**: `name`, `username` (plugin), `email`, `image` (avatar URL). Updated via `authClient.updateUser()`.

## Username rules (single source of truth: `shared/validation/username.ts`)

- **Length**: 3–30 characters (Better Auth defaults).
- **Allowed characters**: Letters, numbers, underscore, period. No spaces.
- **Normalization**: Stored and compared in lowercase.
- **Reserved**: List in `RESERVED_USERNAMES` (e.g. admin, outfai, support). Use `parseUsername()` for validation and `authClient.isUsernameAvailable()` before update.

## Avatar

- **Upload**: Convex file storage. Client gets URL via `profile.generateAvatarUploadUrl`, POSTs file, then calls `profile.setAvatar({ storageId })`. Mutation returns public URL; client calls `authClient.updateUser({ image: url })`.
- **Display**: Prefer `currentUser.image` (Better Auth); fallback to Convex profile `avatarUrl` (from `profile.getWithAvatarUrl`).
- **Remove**: `profile.removeAvatar` deletes blob and clears `avatarStorageId`; client should clear `user.image` via `updateUser({ image: "" })`.
- **Validation**: Client restricts to JPEG/PNG/WebP, max 2MB.

## Backend (Convex)

| Function                          | Description                                                 |
| --------------------------------- | ----------------------------------------------------------- |
| `profile.get`                     | Current user’s profile (read-only).                         |
| `profile.getWithAvatarUrl`        | Profile with resolved avatar URL for display.               |
| `profile.getOrCreate`             | Ensure profile row exists (idempotent).                     |
| `profile.update`                  | Update bio (and future fields).                             |
| `profile.generateAvatarUploadUrl` | One-time upload URL.                                        |
| `profile.setAvatar`               | Set avatar from storage ID; returns URL; replaces previous. |
| `profile.removeAvatar`            | Delete avatar blob and clear reference.                     |

All write operations require `getAuthUser(ctx)`; no direct object reference by other users.

## Frontend

- **`/profile`**: View/edit profile (name, username, bio, avatar), wardrobe stats, style preferences, account links. Edit mode uses `authClient.updateUser`, `authClient.isUsernameAvailable`, `profile.update`, and avatar flow above.
- **`/profile/settings`**: Profile link, account (email, verification, sign out), security placeholder.
- **Navigation**: Bottom nav includes Profile; header avatar (when present) links to profile. Profile header links to Settings.

## Default profile

- Profile row is created on first visit to `/profile` via `getOrCreate`, or on first `update` / `setAvatar`. No separate onboarding step required for profile creation.

## Tests

- **`shared/validation/username.test.ts`**: Username parsing, normalization, reserved names, length and character rules.

## Known limitations / future work

- Change password and email management depend on Better Auth client API; security section in settings is a placeholder until wired.
- Public profile by username (e.g. `/u/:username`) not implemented; architecture supports adding a `profile.getByUsername` and route when needed.
- No server-side file type/size check for avatar (only client validation); consider HTTP action with validation if required.
