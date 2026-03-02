"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@convex/_generated/api";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserAvatar() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const currentUser = useQuery(api.auth.getCurrentUser);

  if (isLoading || !isAuthenticated) return null;

  const display = currentUser?.name ?? currentUser?.email ?? "?";
  const abbr = initials(display);

  return (
    <Link
      href="/profile"
      className="flex items-center gap-2 group"
      aria-label="View profile"
    >
      <span className="flex items-center justify-center w-7 h-7 rounded-full border border-border bg-muted text-[10px] font-medium tracking-wide uppercase text-foreground group-hover:border-signal-orange group-hover:text-signal-orange transition-colors duration-100">
        {abbr}
      </span>
      <span className="hidden sm:block text-[10px] uppercase tracking-[0.15em] text-muted-foreground group-hover:text-foreground transition-colors duration-100 max-w-[96px] truncate">
        {currentUser?.name ?? currentUser?.email}
      </span>
    </Link>
  );
}
