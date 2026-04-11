"use client";

import { usePathname } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { BottomNav } from "@/components/bottom-nav";
import { isBottomNavHiddenRoute, normalizePathname } from "@/lib/routes";

/**
 * Renders the bottom nav on app routes and hides it on landing (when signed out) + auth routes.
 * On "/", nav is shown when authenticated so users can navigate from Today to Closet, etc.
 */
export function ConditionalBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useConvexAuth();
  const normalized = normalizePathname(pathname);

  if (isBottomNavHiddenRoute(pathname)) {
    return null;
  }

  // On home "/", only hide when signed out (landing page)
  if (normalized === "/" && !isAuthenticated) {
    return null;
  }

  return <BottomNav />;
}
