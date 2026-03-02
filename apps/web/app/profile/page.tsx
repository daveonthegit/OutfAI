"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { authClient } from "@/lib/auth-client";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ProfilePage() {
  const router = useRouter();
  const currentUser = useRequireAuth("/profile");
  const garments = useQuery(api.garments.list) ?? [];

  const handleSignOut = async () => {
    await authClient.signOut();
    router.replace("/login");
  };

  const display = currentUser?.name ?? currentUser?.email ?? "";
  const abbr = initials(display);

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-signal-orange selection:text-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-12">
          <Link
            href="/"
            className="text-base md:text-lg tracking-tight font-medium hover:text-signal-orange transition-colors duration-100"
          >
            OutfAI
          </Link>
          <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Profile
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="pt-24 md:pt-32 px-4 md:px-8 lg:px-12 pb-28 max-w-xl">
        {/* Avatar + identity */}
        <section className="mb-12">
          <div className="flex items-center gap-5 mb-8">
            <div className="flex items-center justify-center w-16 h-16 border border-border bg-muted text-xl font-medium tracking-wide uppercase text-foreground">
              {currentUser ? (
                abbr
              ) : (
                <span className="w-8 h-3 bg-muted-foreground/20 animate-pulse rounded" />
              )}
            </div>
            <div className="min-w-0">
              {currentUser ? (
                <>
                  <p className="text-lg font-medium truncate">
                    {currentUser.name}
                  </p>
                  {/* @ts-expect-error username field added by username plugin */}
                  {currentUser.username && (
                    // @ts-expect-error username field added by username plugin
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">
                      {/* @ts-expect-error username field added by username plugin */}
                      @{currentUser.username}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1 truncate">
                    {currentUser.email}
                  </p>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted-foreground/10 animate-pulse rounded" />
                  <div className="h-3 w-48 bg-muted-foreground/10 animate-pulse rounded" />
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />
        </section>

        {/* Stats */}
        <section className="mb-12">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
            Wardrobe
          </p>
          <div className="grid grid-cols-2 gap-px border border-border bg-border">
            <div className="bg-background px-5 py-4">
              <p className="text-3xl font-light tabular-nums">
                {garments.length}
              </p>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                Items
              </p>
            </div>
            <div className="bg-background px-5 py-4">
              <p className="text-3xl font-light tabular-nums">
                {new Set(garments.map((g) => g.category)).size}
              </p>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                Categories
              </p>
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
            Account
          </p>

          <Link
            href="/closet"
            className="flex items-center justify-between w-full border border-border px-5 py-4 text-[11px] uppercase tracking-[0.2em] text-foreground hover:border-foreground transition-colors duration-100"
          >
            <span>My Closet</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>

          <button
            onClick={handleSignOut}
            className="flex items-center justify-between w-full border border-border px-5 py-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:border-destructive hover:text-destructive transition-colors duration-100"
          >
            <span>Sign Out</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </section>
      </div>
    </main>
  );
}
