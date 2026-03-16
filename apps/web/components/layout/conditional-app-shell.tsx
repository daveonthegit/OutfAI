"use client";

import { usePathname } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { useCallback, useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { normalizePathname } from "@/lib/routes";

const SIDEBAR_COLLAPSED_KEY = "outfai-sidebar-collapsed";

/** Auth-only routes where we never show the app sidebar (login, signup, etc.). */
const AUTH_ONLY_NO_SIDEBAR = [
  "/login",
  "/signup",
  "/check-email",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
] as const;

/**
 * Wraps app content: on lg+ when authenticated and not on an auth-only route,
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
    !(AUTH_ONLY_NO_SIDEBAR as readonly string[]).includes(normalized);

  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    setCollapsed(raw === "1" || raw === "true");
  }, []);
  const setCollapsedPersisted = useCallback((value: boolean) => {
    setCollapsed(value);
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, value ? "1" : "0");
    } catch {
      // ignore
    }
  }, []);

  return (
    <>
      {showSidebar && (
        <AppSidebar
          collapsed={collapsed}
          onCollapsedChange={setCollapsedPersisted}
        />
      )}
      <div
        className={
          showSidebar
            ? collapsed
              ? "min-h-screen lg:pl-14"
              : "min-h-screen lg:pl-56"
            : ""
        }
        data-sidebar-visible={showSidebar ? "" : undefined}
        data-sidebar-collapsed={showSidebar && collapsed ? "" : undefined}
      >
        {children}
      </div>
    </>
  );
}
