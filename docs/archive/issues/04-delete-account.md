# Delete account

**Labels:** `account`, `security`, `enhancement`

## Description

Allow user to permanently delete their account with confirmation.

## Tasks

- [ ] Add "Delete my account" in account settings with confirmation (e.g. type "DELETE" or re-enter password).
- [ ] Implement: revoke session, delete or anonymize user in BetterAuth (if API exists).
- [ ] Convex mutations to remove or anonymize `garments`, `outfits`, `recommendationLogs` for that `userId`.
- [ ] Consider soft-delete + scheduled purge for compliance; document in privacy/terms.

## Acceptance criteria

- User can delete account after confirmation; all personal data is removed or anonymized.

## References

- convex/schema.ts (garments, outfits, recommendationLogs)
