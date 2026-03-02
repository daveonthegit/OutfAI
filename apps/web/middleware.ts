import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

export const config = {
  matcher: [
    /*
     * Protect all routes except:
     * - /login and /signup (auth pages)
     * - /api/auth (BetterAuth endpoints)
     * - /_next (Next.js internals)
     * - /favicon.ico, /icon*, /apple-icon* (static assets)
     */
    "/((?!login|signup|api/auth|_next/static|_next/image|favicon\\.ico|icon|apple-icon).*)",
  ],
};
