"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { authClient } from "@/lib/auth-client";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const currentUser = useRequireAuth("/profile/settings");

  const handleSignOut = async () => {
    await authClient.signOut();
    router.replace("/login");
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-signal-orange selection:text-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-10 xl:px-12">
          <Link
            href="/"
            className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium hover:text-signal-orange transition-colors duration-100"
          >
            OutfAI
          </Link>
          <Link
            href="/profile"
            className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors duration-100"
          >
            Profile
          </Link>
        </div>
      </header>

      <div className="pt-24 md:pt-32 px-4 md:px-8 lg:px-12 pb-28 max-w-xl">
        <h1 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-6">
          Settings
        </h1>

        {/* Profile */}
        <section className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Profile
          </p>
          <Link
            href="/profile"
            className="flex items-center justify-between w-full border border-border px-5 py-4 text-[11px] uppercase tracking-[0.2em] text-foreground hover:border-foreground transition-colors duration-100"
          >
            <span>Edit profile & preferences</span>
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
        </section>

        {/* Account */}
        <section className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Account
          </p>
          <div className="border border-border divide-y divide-border">
            <div className="px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Email
              </p>
              <p className="text-sm text-foreground mt-1 truncate">
                {currentUser?.email ?? "—"}
              </p>
              {currentUser?.emailVerified !== undefined && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  {currentUser.emailVerified ? "Verified" : "Not verified"}
                </p>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center justify-between w-full px-5 py-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive hover:border-destructive transition-colors duration-100"
            >
              <span>Sign out</span>
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
          </div>
        </section>

        {/* Security */}
        <section className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Security
          </p>
          <p className="text-sm text-muted-foreground border border-border px-5 py-4">
            Change password and other security options will be available here
            when supported by the auth provider.
          </p>
        </section>
      </div>
    </main>
  );
}
