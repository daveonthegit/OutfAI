# Landing Page and Public Routes

This document describes the public landing page, auth routing, and the single source of truth for “no-nav” / public routes introduced after PR #46 (landing page and responsive home).

---

## Overview

- **Root route (`/`):** Renders a **public landing page** when the user is not authenticated, and the **authenticated home** (Today / recommendations) when they are. Auth state is resolved with `useConvexAuth()` in `apps/web/app/page.tsx`.
- **Loading state:** While Convex auth is loading, the root shows a minimal **loading UI** (logo + spinner) instead of a blank screen. See `LandingLoadingState` in `page.tsx`.
- **Bottom nav:** Hidden on the landing and auth pages; shown everywhere else. The list of routes where the nav is hidden is kept in one place and reused by both the nav component and the middleware matcher.

---

## Single Source of Truth: Public / No-Nav Routes

**File:** `apps/web/lib/routes.ts`

- **`NO_NAV_ROUTES`** — Paths where the bottom nav is hidden and that are treated as public for auth:
  - `/`
  - `/login`
  - `/signup`
  - `/check-email`
  - `/verify-email`

**Used by:**

1. **`ConditionalBottomNav`** (`apps/web/components/layout/conditional-bottom-nav.tsx`)  
   Uses `isNoNavRoute(pathname)` to decide whether to render the bottom nav. Pathname is normalized (e.g. trailing slash removed) so `/login/` is treated like `/login`.

2. **Middleware** (`apps/web/middleware.ts`)  
   The matcher is built from `NO_NAV_ROUTES` plus static/API exclusions so that:
   - Unauthenticated users can access `/`, `/login`, `/signup`, `/check-email`, `/verify-email`.
   - All other app routes require a session (redirect to login).

**When adding a new public or no-nav route:**

1. Add the path to `NO_NAV_ROUTES` in `apps/web/lib/routes.ts`.
2. The middleware matcher is derived from `NO_NAV_ROUTES`; no separate change is needed there.

---

## Helpers in `lib/routes.ts`

- **`normalizePathname(pathname)`** — Trims trailing slashes so comparisons are consistent (e.g. `/login/` → `/login`).
- **`isNoNavRoute(pathname)`** — Returns `true` if the (normalized) path is in `NO_NAV_ROUTES`.

---

## Landing Page Details

- **Gallery:** Images and alt text are defined in `GALLERY_IMAGES` in `page.tsx`. Each image has a distinct `alt` string for accessibility.
- **Loading:** `LandingLoadingState` provides a minimal branded loading view (OutfAI label + spinner + “Loading”) so the root never shows a fully blank screen during the auth check.

---

## Authenticated Home Types

The authenticated home component (`apps/web/components/home/authenticated-home.tsx`) uses shared and local types instead of `any`:

- **Mood / weather:** `Mood` and `WeatherCondition` from `@shared/types`.
- **Display outfits:** `DisplayOutfit` and `DisplayGarment` (local interfaces) for the recommendation grid and save flow.
- **Errors:** `catch (e: unknown)` with `e instanceof Error` for weather error handling.

This keeps the home screen type-safe and aligned with the recommendation engine and Convex types.
