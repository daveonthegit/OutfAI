# Account settings — change password and email

**Labels:** `account`, `security`, `enhancement`

## Description

Add change password and email management to profile or a dedicated settings page.

## Tasks

- [ ] **Change password**: Add block with form (current password, new password). Use `authClient.changePassword({ currentPassword, newPassword })`. Show success/error.
- [ ] **Email**: Show current email and verification status (e.g. `emailVerified` from `currentUser`).
- [ ] **Change email**: If BetterAuth supports it, add "Change email" using `authClient.changeEmail({ newEmail, callbackURL })` and verification instructions.
- [ ] **Resend verification**: Link or reuse existing "Resend verification email" flow for unverified users (as on login).
- [ ] Reuse form patterns from login/signup (controlled inputs, validation, error messages).

## Acceptance criteria

- User can change password with current password confirmation.
- User sees email and verification status; can change email and/or resend verification when applicable.

## References

- apps/web/app/login/page.tsx (resend flow)
