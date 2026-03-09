"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@convex/_generated/api";
import { BrutalistAvatar } from "@/components/brutalist-avatar";

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
  const profileData = useQuery(api.profile.getWithAvatarUrl);

  if (isLoading || !isAuthenticated) return null;

  const display = currentUser?.name ?? currentUser?.email ?? "?";
  const abbr = initials(display);
  const avatarUrl = currentUser?.image ?? profileData?.avatarUrl ?? undefined;

  return (
    <Link
      href="/profile"
      className="flex items-center gap-2 group"
      aria-label="View profile"
    >
      <span className="shrink-0 block w-8 h-8 border border-border group-hover:border-signal-orange transition-colors duration-100 overflow-hidden">
        <BrutalistAvatar src={avatarUrl} alt="" initials={abbr} size="sm" />
      </span>
      <span className="hidden sm:block text-[10px] uppercase tracking-[0.15em] text-muted-foreground group-hover:text-foreground transition-colors duration-100 max-w-[96px] truncate">
        {currentUser?.name ?? currentUser?.email}
      </span>
    </Link>
  );
}
