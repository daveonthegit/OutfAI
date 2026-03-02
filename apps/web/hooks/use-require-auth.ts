"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

/**
 * Redirects to /login only once Convex confirms the JWT is absent.
 *
 * Why useConvexAuth instead of useQuery(getCurrentUser)?
 *   After sign-in, BetterAuth sets the session cookie, but ConvexBetterAuthProvider
 *   still needs a round-trip to /api/auth/convex/token to obtain the Convex JWT.
 *   During that window getCurrentUser returns null (no JWT yet), causing a spurious
 *   redirect loop. useConvexAuth() is the reactive source of truth tied directly to
 *   the JWT state — isLoading is true during the JWT fetch, so we never redirect
 *   prematurely.
 *
 * Returns the current user document:
 *   undefined  = Convex query still in flight
 *   null       = confirmed unauthenticated (redirect already fired)
 *   object     = authenticated user from BetterAuth component table
 */
export function useRequireAuth(callbackUrl: string = "/") {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const currentUser = useQuery(api.auth.getCurrentUser);

  useEffect(() => {
    // Only redirect once the JWT check has fully settled and the result is "no auth".
    // While isLoading is true the JWT is still being fetched — do not redirect yet.
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
  }, [isLoading, isAuthenticated, router, callbackUrl]);

  return currentUser;
}
