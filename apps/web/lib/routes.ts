/**
 * Single source of truth for routes that are public (no auth) and where the
 * bottom nav is hidden (landing + auth pages). Used by:
 * - ConditionalBottomNav: hide nav on these paths
 * - middleware: matcher excludes these paths from auth protection (see comment below)
 *
 * When adding a new public or no-nav route, add it here and to the middleware
 * matcher in apps/web/middleware.ts so they stay in sync.
 */
export const NO_NAV_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/check-email",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/onboarding",
] as const;

/**
 * Routes where bottom nav is always hidden. "/" is handled separately (show nav when signed in).
 */
export const BOTTOM_NAV_HIDDEN_ROUTES = [
  "/login",
  "/signup",
  "/check-email",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/onboarding",
] as const;

export type NoNavRoute = (typeof NO_NAV_ROUTES)[number];

/**
 * Normalize pathname for comparison: strip trailing slash so "/login/" matches "/login".
 */
export function normalizePathname(pathname: string | null): string {
  if (pathname == null || pathname === "") return "/";
  const trimmed = pathname.replace(/\/+$/, "") || "/";
  return trimmed;
}

export function isBottomNavHiddenRoute(pathname: string | null): boolean {
  const normalized = normalizePathname(pathname);
  return (BOTTOM_NAV_HIDDEN_ROUTES as readonly string[]).includes(normalized);
}

/**
 * Returns true if the path is one of the routes where bottom nav is hidden.
 */
export function isNoNavRoute(pathname: string | null): boolean {
  const normalized = normalizePathname(pathname);
  return (NO_NAV_ROUTES as readonly string[]).includes(normalized);
}
