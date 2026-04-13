# Profile image upload

**Labels:** `profile`, `enhancement`

## Description

Beyond URL-only avatar: allow uploading a profile image to app storage (R2/S3 or Convex file storage), store URL, pass to `updateUser({ image })`.

## Tasks

- [ ] Add upload flow (signed upload or API route); reuse or mirror garment upload flow where possible.
- [ ] Store returned URL and call `authClient.updateUser({ image: url })`.
- [ ] Show upload progress and errors; optional crop/resize before upload.

## Acceptance criteria

- User can upload an image as profile picture; it is stored and displayed as avatar.

## Depends on

- Issue 1 (editable profile with image URL).
