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

// Keep in sync with NO_NAV_ROUTES in lib/routes.ts. Next.js requires a literal here.
export const config = {
  matcher: [
    "/((?!$|login|signup|check-email|verify-email|forgot-password|reset-password|api/auth|_next/static|_next/image|favicon\\.ico|icon|apple-icon|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico)$).*)",
  ],
};
