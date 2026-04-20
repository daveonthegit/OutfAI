"use client";

import Link from "next/link";

export function ProfileAccountSection({
  onSignOut,
}: {
  onSignOut: () => void;
}) {
  return (
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
        type="button"
        onClick={onSignOut}
        className="flex items-center justify-between w-full border border-border px-5 py-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:border-destructive hover:text-destructive transition-colors duration-100 cursor-pointer"
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
  );
}
