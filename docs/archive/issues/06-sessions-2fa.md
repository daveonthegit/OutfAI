# Connected sessions and 2FA (optional)

**Labels:** `account`, `security`, `optional`

## Description

If BetterAuth (or plugins) support it: list/revoke other sessions and enable two-factor authentication.

## Tasks

- [ ] **Sessions**: If BetterAuth supports listing or revoking other sessions, add "Sessions" or "Sign out of all other devices" in account settings.
- [ ] **2FA**: If BetterAuth offers a 2FA plugin, add enable/disable in account settings and enforce at login.

## Acceptance criteria

- When supported by auth stack: user can see/revoke other sessions and optionally enable 2FA.
