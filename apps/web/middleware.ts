import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    /*
     * Protect all routes except:
     * - /login and /signup (auth pages)
     * - /api/auth (NextAuth endpoints)
     * - /_next (Next.js internals)
     * - /favicon.ico, /icon*, /apple-icon* (static assets)
     */
    "/((?!login|signup|api/auth|_next/static|_next/image|favicon\\.ico|icon|apple-icon).*)",
  ],
};
