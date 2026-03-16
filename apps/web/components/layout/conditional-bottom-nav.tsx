"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";

const HIDDEN_NAV_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/check-email",
  "/verify-email",
];

export function ConditionalBottomNav() {
  const pathname = usePathname();

  if (pathname && HIDDEN_NAV_ROUTES.includes(pathname)) {
    return null;
  }

  return <BottomNav />;
}
