import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { NO_NAV_ROUTES } from "./lib/routes";

// Lightweight presence check — BetterAuth (via @convex-dev/better-auth) sets
// this cookie on sign-in. Full cryptographic validation happens inside Convex
// functions via authComponent.getAuthUser(ctx).
function hasSession(request: NextRequest): boolean {
  return (
    request.cookies.has("better-auth.session_token") ||
    request.cookies.has("__Secure-better-auth.session_token")
  );
}

export function middleware(request: NextRequest) {
  if (!hasSession(request)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Path segments excluded from auth (derived from NO_NAV_ROUTES). Root "/" → "$" for regex.
const PUBLIC_PATH_SEGMENTS = NO_NAV_ROUTES.map((p) =>
  p === "/" ? "$" : p.slice(1)
);
const OTHER_EXCLUDED =
  "api/auth|_next/static|_next/image|favicon\\.ico|icon|apple-icon|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico)$";
const MATCHER_REGEX = `/((?!${PUBLIC_PATH_SEGMENTS.join("|")}|${OTHER_EXCLUDED}).*)`;

export const config = {
  matcher: [
    /*
     * Protect all routes except: NO_NAV_ROUTES (/, /login, /signup, /check-email, /verify-email),
     * /api/auth, _next, and common static file extensions. See lib/routes.ts.
     */
    MATCHER_REGEX,
  ],
};
