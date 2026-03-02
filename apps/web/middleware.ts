import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Keep the cookie name in sync with lib/auth.ts
const SESSION_COOKIE = "outfai-session";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE);

  if (!token) {
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
     * - /api/auth (login/logout endpoints)
     * - /_next (Next.js internals)
     * - /favicon.ico, /icon*, /apple-icon* (static assets)
     */
    "/((?!login|signup|api/auth|_next/static|_next/image|favicon\\.ico|icon|apple-icon).*)",
  ],
};
