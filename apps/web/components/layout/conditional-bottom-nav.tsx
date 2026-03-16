"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { isNoNavRoute } from "@/lib/routes";

/**
 * Renders the bottom nav on app routes and hides it on landing + auth routes.
 * Uses shared NO_NAV_ROUTES (via isNoNavRoute) and normalizes pathname (e.g. trailing slash).
 */
export function ConditionalBottomNav() {
  const pathname = usePathname();

  if (isNoNavRoute(pathname)) {
    return null;
  }

  return <BottomNav />;
}
