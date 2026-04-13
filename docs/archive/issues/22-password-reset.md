# Password reset (forgot password) flow

**Labels:** `account`, `security`, `enhancement`

## Description

Allow users who forgot their password to request a reset via email. BetterAuth typically supports this with a "forgot password" endpoint and email with a magic link or token.

## Tasks

- [ ] Add "Forgot password?" link on the login page.
- [ ] New page or modal: enter email → call BetterAuth forgot-password (e.g. `authClient.forgetPassword({ email, callbackURL })` or equivalent).
- [ ] Send reset email via existing Resend setup (or configure BetterAuth to use it).
- [ ] Reset confirmation page: user lands after clicking email link, sets new password, then redirect to login.
- [ ] Show success/error toasts and clear copy ("Check your email for a reset link").

## Acceptance criteria

- User can request a password reset by email and set a new password via the link.

## References

- apps/web/app/login/page.tsx
- BetterAuth password reset docs
- convex/auth.ts (Resend)
