"use client";

import { usePathname } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { normalizePathname } from "@/lib/routes";

const NO_NAV_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/check-email",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
] as const;

/**
 * Wraps app content: on lg+ when authenticated and not on a no-nav route,
 * renders the sidebar and offsets main content. Otherwise renders children only.
 */
export function ConditionalAppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAuthenticated } = useConvexAuth();
  const normalized = normalizePathname(pathname);
  const showSidebar =
    isAuthenticated &&
    !(NO_NAV_ROUTES as readonly string[]).includes(normalized);

  return (
    <>
      {showSidebar && <AppSidebar />}
      <div
        className={showSidebar ? "min-h-screen lg:pl-56" : ""}
      >
        {children}
      </div>
    </>
  );
}
