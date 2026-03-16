"use client";

import { usePathname } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { BottomNav } from "@/components/bottom-nav";
import { normalizePathname } from "@/lib/routes";

const AUTH_ONLY_NO_NAV = [
  "/login",
  "/signup",
  "/check-email",
  "/verify-email",
  "/onboarding",
] as const;

/**
 * Renders the bottom nav on app routes and hides it on landing (when signed out) + auth routes.
 * On "/", nav is shown when authenticated so users can navigate from Today to Closet, etc.
 */
export function ConditionalBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useConvexAuth();
  const normalized = normalizePathname(pathname);

  // Always hide on auth pages
  if (
    AUTH_ONLY_NO_NAV.includes(normalized as (typeof AUTH_ONLY_NO_NAV)[number])
  ) {
    return null;
  }

  // On home "/", only hide when signed out (landing page)
  if (normalized === "/" && !isAuthenticated) {
    return null;
  }

  return <BottomNav />;
}
