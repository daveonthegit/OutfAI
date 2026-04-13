# Profile and Account Settings — Issues

> Backlog of issues for developing profile and account settings. Derived from the Profile and Account Settings plan. Each section can be used as a GitHub issue (copy title + body).

---

## Issue 1: Editable profile (name, username, avatar)

**Labels:** `profile`, `enhancement`

**Description**

Profile page currently shows read-only name, username, and email with initials-only avatar. Add editable profile using BetterAuth client APIs.

**Tasks**

- [ ] Use `BrutalistAvatar` with `src={currentUser?.image}` and `initials={abbr}` so profile image shows when set.
- [ ] Add "Edit profile" mode (or inline edit): form fields for **name** and **username** (and **image** URL for MVP).
- [ ] On submit call `authClient.updateUser({ name, username, image })`. Confirm exact API from BetterAuth User & Accounts and username plugin.
- [ ] Show loading and error states; on success refetch user (Convex `getCurrentUser` reflects auth updates).
- [ ] Surface username format/uniqueness errors from the username plugin in the UI.

**Acceptance criteria**

- User can edit display name and username from profile.
- User can set profile image via URL; avatar displays when set.
- Validation and API errors are shown clearly.

**References**

- [apps/web/app/profile/page.tsx](apps/web/app/profile/page.tsx)
- [apps/web/components/brutalist-avatar.tsx](apps/web/components/brutalist-avatar.tsx)
- BetterAuth: https://better-auth.com/docs/concepts/users-accounts

---

## Issue 2: Profile image upload

**Labels:** `profile`, `enhancement`

**Description**

Beyond URL-only avatar: allow uploading a profile image to app storage (R2/S3 or Convex file storage), store URL, pass to `updateUser({ image })`.

**Tasks**

- [ ] Add upload flow (signed upload or API route); reuse or mirror garment upload flow where possible.
- [ ] Store returned URL and call `authClient.updateUser({ image: url })`.
- [ ] Show upload progress and errors; optional crop/resize before upload.

**Acceptance criteria**

- User can upload an image as profile picture; it is stored and displayed as avatar.

**Depends on**

- Issue 1 (editable profile with image URL).

---

## Issue 3: Account settings — change password and email

**Labels:** `account`, `security`, `enhancement`

**Description**

Add change password and email management to profile or a dedicated settings page.

**Tasks**

- [ ] **Change password**: Add block with form (current password, new password). Use `authClient.changePassword({ currentPassword, newPassword })`. Show success/error.
- [ ] **Email**: Show current email and verification status (e.g. `emailVerified` from `currentUser`).
- [ ] **Change email**: If BetterAuth supports it, add "Change email" using `authClient.changeEmail({ newEmail, callbackURL })` and verification instructions.
- [ ] **Resend verification**: Link or reuse existing "Resend verification email" flow for unverified users (as on login).
- [ ] Reuse form patterns from login/signup (controlled inputs, validation, error messages).

**Acceptance criteria**

- User can change password with current password confirmation.
- User sees email and verification status; can change email and/or resend verification when applicable.

**References**

- [apps/web/app/login/page.tsx](apps/web/app/login/page.tsx) (resend flow)

---

## Issue 4: Delete account

**Labels:** `account`, `security`, `enhancement`

**Description**

Allow user to permanently delete their account with confirmation.

**Tasks**

- [ ] Add "Delete my account" in account settings with confirmation (e.g. type "DELETE" or re-enter password).
- [ ] Implement: revoke session, delete or anonymize user in BetterAuth (if API exists).
- [ ] Convex mutations to remove or anonymize `garments`, `outfits`, `recommendationLogs` for that `userId`.
- [ ] Consider soft-delete + scheduled purge for compliance; document in privacy/terms.

**Acceptance criteria**

- User can delete account after confirmation; all personal data is removed or anonymized.

**References**

- [convex/schema.ts](convex/schema.ts) (garments, outfits, recommendationLogs)

---

## Issue 5: Settings route and layout

**Labels:** `profile`, `routing`, `enhancement`

**Description**

With full scope (profile, account, preferences, stats), split content: `/profile` for identity, stats, quick actions; dedicated route for heavy settings.

**Tasks**

- [ ] Add `/profile/settings` (or `/settings`) route.
- [ ] `/profile`: identity (view/edit), wardrobe stats, activity (when implemented), quick actions, link to "Settings".
- [ ] `/profile/settings`: change password, email, verification, delete account, sessions, 2FA, preferences.
- [ ] Shared header/nav and bottom nav; consistent styling with existing profile and login pages.

**Acceptance criteria**

- Profile page is focused on identity and overview; settings page holds password, email, delete account, and preferences.

---

## Issue 6: Connected sessions and 2FA (optional)

**Labels:** `account`, `security`, `optional`

**Description**

If BetterAuth (or plugins) support it: list/revoke other sessions and enable two-factor authentication.

**Tasks**

- [ ] **Sessions**: If BetterAuth supports listing or revoking other sessions, add "Sessions" or "Sign out of all other devices" in account settings.
- [ ] **2FA**: If BetterAuth offers a 2FA plugin, add enable/disable in account settings and enforce at login.

**Acceptance criteria**

- When supported by auth stack: user can see/revoke other sessions and optionally enable 2FA.

---

## Issue 7: User preferences (Convex)

**Labels:** `preferences`, `backend`, `enhancement`

**Description**

Add Convex table and UI for app preferences (temperature unit, default mood, notifications, recommendation style, locale).

**Tasks**

- [ ] Add `userPreferences` table in [convex/schema.ts](convex/schema.ts): `userId`, `temperatureUnit`, `defaultMood`, notification flags, `recommendationStyle`, `locale`, `timezone` (all optional). Index by `userId`.
- [ ] Convex queries: get preferences for current user. Mutations: update preferences (ensure `userId` from auth).
- [ ] "Preferences" section on `/profile/settings`: temperature unit (°C / °F), default mood, notification toggles (wire emails later), recommendation style, locale/timezone if needed.
- [ ] Use preferences in app: weather/recommendations use `temperatureUnit`; mood UI can prefill `defaultMood`; engine can use `recommendationStyle`.

**Acceptance criteria**

- User can set and persist preferences; app respects them where applicable.

**References**

- [convex/schema.ts](convex/schema.ts)

---

## Issue 8: Onboarding — complete profile flow

**Labels:** `onboarding`, `enhancement`

**Description**

Replace onboarding stub with a short "complete your profile" flow (name, username, optional avatar).

**Tasks**

- [ ] Replace [apps/web/app/onboarding/page.tsx](apps/web/app/onboarding/page.tsx) stub with minimal form: name, username, optional avatar URL.
- [ ] "Save and continue" calls `authClient.updateUser` then redirects to `/profile` or `/`.
- [ ] Alternatively: redirect to `/profile?onboarding=1` with one-time banner + inline edit; clear banner when profile is saved.
- [ ] Trigger onboarding for new users (e.g. after signup or first login when name/username missing).

**Acceptance criteria**

- New or incomplete users can complete profile via onboarding; redirect to profile or home afterward.

---

## Issue 9: Onboarding checklist

**Labels:** `onboarding`, `ux`, `enhancement`

**Description**

Show onboarding progress on profile or dashboard: Add first item, Set mood, Get first outfit.

**Tasks**

- [ ] Derive progress from existing data: garments count, mood set, outfits saved.
- [ ] UI: checkmarks and optional CTA links (e.g. "Add first item" → /add, "Set mood" → /mood, "Get first outfit" → /).
- [ ] Place on profile or a dedicated dashboard section.

**Acceptance criteria**

- User sees checklist with completed and pending steps; links help them complete setup.

**References**

- [convex/garments.ts](convex/garments.ts), outfits, recommendationLogs for counts.

---

## Issue 10: Data export (Download my data)

**Labels:** `privacy`, `compliance`, `enhancement`

**Description**

GDPR-style "Download my data": export garments, outfits, recommendationLogs for current user.

**Tasks**

- [ ] Add "Download my data" in profile/settings.
- [ ] Convex queries (or server action) to gather garments, outfits, recommendationLogs for current user.
- [ ] Generate JSON or CSV and trigger download (e.g. blob download in browser).
- [ ] Document in privacy policy or terms.

**Acceptance criteria**

- User can download a copy of their data in a machine-readable format.

**References**

- [convex/schema.ts](convex/schema.ts)

---

## Issue 11: Activity and stats on profile

**Labels:** `profile`, `ux`, `enhancement`

**Description**

Beyond items and categories: show outfits saved this week/month, most worn categories, or a simple streak.

**Tasks**

- [ ] Convex queries/aggregations using `outfits` and `recommendationLogs` (e.g. by `savedAt`, by category from garments).
- [ ] Profile section: e.g. "Outfits saved this week", "Most worn category", optional "Streak" (days used).
- [ ] Keep existing wardrobe stats (items, categories); add new stats without cluttering.

**Acceptance criteria**

- Profile shows additional activity metrics derived from user data.

**References**

- [convex/outfits.ts](convex/outfits.ts), [convex/recommendationLogs.ts](convex/recommendationLogs.ts)

---

## Issue 12: Quick actions and help on profile

**Labels:** `profile`, `ux`, `enhancement`

**Description**

Add quick action shortcuts and help/feedback entry points on profile.

**Tasks**

- [ ] **Quick actions**: Shortcuts to "Add item", "Today's outfit", "Archive" (contextual links; can mirror bottom nav).
- [ ] **Help**: Links to docs or FAQ if available.
- [ ] **Feedback**: "Send feedback" (mailto or simple form to backend/email). Optional "Report a problem" with page/context.

**Acceptance criteria**

- User can jump to key flows and access help/feedback from profile.

---

## Issue 13: Display name vs username and profile visibility (optional)

**Labels:** `profile`, `optional`

**Description**

Optional enhancements for identity and future social features.

**Tasks**

- [ ] **Display name vs username**: If BetterAuth/plugin supports it, allow separate display name (e.g. "Alex") and username for login (@alex).
- [ ] **Profile visibility**: If adding social/sharing later: "Profile visible to others" or "Show outfit history" toggle; store in `userPreferences` or auth metadata.

**Acceptance criteria**

- When implemented: display name and visibility toggles work and persist.

**Depends on**

- Issue 1 (editable profile); Issue 7 (userPreferences) for visibility.

---

## Issue 14: Invite / referral (optional)

**Labels:** `growth`, `optional`

**Description**

Optional "Invite a friend" or referral link in profile.

**Tasks**

- [ ] Add referral tracking table if needed (e.g. `userId`, `referralCode`, `referredAt`).
- [ ] Profile entry: "Invite a friend" with copyable link or share.
- [ ] Optional: rewards or analytics later.

**Acceptance criteria**

- User can share a referral link; optional tracking for future use.

---

## Summary

| #   | Issue                                     | Priority    |
| --- | ----------------------------------------- | ----------- |
| 1   | Editable profile (name, username, avatar) | Core        |
| 2   | Profile image upload                      | Core        |
| 3   | Account settings — password & email       | Core        |
| 4   | Delete account                            | Core        |
| 5   | Settings route and layout                 | Core        |
| 6   | Connected sessions and 2FA                | Optional    |
| 7   | User preferences (Convex)                 | Core        |
| 8   | Onboarding — complete profile flow        | Core        |
| 9   | Onboarding checklist                      | Enhancement |
| 10  | Data export                               | Enhancement |
| 11  | Activity and stats on profile             | Enhancement |
| 12  | Quick actions and help                    | Enhancement |
| 13  | Display name and profile visibility       | Optional    |
| 14  | Invite / referral                         | Optional    |

Identity and account updates use BetterAuth client APIs; preferences and app-specific data use Convex.
