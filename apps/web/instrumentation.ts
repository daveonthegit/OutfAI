/**
 * Next.js instrumentation hook — runs once at server startup.
 *
 * BetterAuth schema management is handled automatically by the
 * @convex-dev/better-auth Convex component — no manual CREATE TABLE needed.
 *
 * To seed a test account in development, sign up via the /signup page
 * or call authClient.signUp.username() from the browser console.
 */
export async function register() {
  // Nothing to initialize: Convex manages its own schema.
}
