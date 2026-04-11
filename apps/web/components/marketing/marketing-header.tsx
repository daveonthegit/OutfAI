"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Variant = "landing" | "auth";

function LandingThemeToggle({ dense }: { dense: boolean }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pad = dense ? "h-9 w-9" : "h-10 w-10";
  if (!mounted) {
    return <span className={`inline-block shrink-0 ${pad}`} aria-hidden />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`inline-flex shrink-0 items-center justify-center border border-[#0a0a0a]/12 text-muted-foreground transition-colors duration-150 hover:border-[#0a0a0a]/25 hover:bg-[#0a0a0a]/[0.04] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-focus-bmw)] focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-[#f4f3ef]/18 dark:text-[#b0b0b0] dark:hover:border-[#f4f3ef]/35 dark:hover:bg-[#f4f3ef]/[0.06] dark:hover:text-[#f4f3ef] dark:focus-visible:ring-offset-[var(--marketing-void)] ${pad}`}
    >
      {isDark ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

export function MarketingHeader({
  variant = "landing",
  dense = false,
  showThemeToggle = false,
  className,
}: {
  variant?: Variant;
  /** Tighter vertical rhythm for single-viewport (no scroll) layouts. */
  dense?: boolean;
  /** Sun/moon control for `next-themes` (landing + auth). */
  showThemeToggle?: boolean;
  /** e.g. frosted strip (Apple-style glass nav). */
  className?: string;
}) {
  const pad = dense ? "px-3 py-2 sm:px-4" : "px-4 py-2.5 sm:px-5";
  const mb = dense ? "mb-2 pb-2 sm:mb-3 sm:pb-3" : "mb-6 pb-5 sm:mb-8 sm:pb-6";

  if (variant === "auth") {
    return (
      <header
        className={`flex shrink-0 flex-wrap items-end justify-between gap-x-3 gap-y-2 border-b border-[#0a0a0a]/[0.08] dark:border-[#f4f3ef]/[0.1] ${mb}`}
      >
        <Link
          href="/"
          className="group rounded-sm font-sans text-sm font-medium uppercase tracking-[0.34em] text-[#0a0a0a] transition-colors duration-150 hover:text-[#ff4d00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-focus-bmw)] focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:text-[#f4f3ef] dark:hover:text-[#c6a564] dark:focus-visible:ring-offset-[var(--marketing-void)]"
        >
          <span className="relative inline-block">
            OutfAI
            <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#ff4d00] transition-[width] duration-150 ease-out group-hover:w-full dark:bg-[#c6a564]" />
          </span>
        </Link>
        <div className="flex max-w-full flex-wrap items-center justify-end gap-2 sm:gap-3">
          {showThemeToggle ? <LandingThemeToggle dense={dense} /> : null}
          <span className="max-w-[12rem] text-right font-sans text-[10px] uppercase leading-snug tracking-[0.28em] text-muted-foreground sm:text-[11px] md:max-w-[14rem]">
            Secure session
          </span>
        </div>
      </header>
    );
  }

  const useGlassChrome =
    typeof className === "string" && className.includes("glass-bar");

  return (
    <header
      className={cn(
        "flex shrink-0 flex-wrap items-end justify-between gap-x-3 gap-y-2",
        !useGlassChrome &&
          "border-b border-[#0a0a0a]/[0.08] dark:border-[#f4f3ef]/[0.1]",
        mb,
        className
      )}
    >
      <Link
        href="/"
        className="group rounded-sm font-sans text-sm font-medium uppercase tracking-[0.34em] text-[#0a0a0a] transition-colors duration-150 hover:text-[#ff4d00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-focus-bmw)] focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:text-[#f4f3ef] dark:hover:text-[#c6a564] dark:focus-visible:ring-offset-[var(--marketing-void)]"
      >
        <span className="relative inline-block">
          OutfAI
          <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#ff4d00] transition-[width] duration-150 ease-out group-hover:w-full dark:bg-[#c6a564]" />
        </span>
      </Link>

      <nav
        className="flex flex-wrap items-center justify-end gap-2 sm:gap-3"
        aria-label="Account actions"
      >
        {showThemeToggle ? <LandingThemeToggle dense={dense} /> : null}
        <Link
          href="/login"
          className={`rounded-[var(--marketing-radius-apple)] border border-[#0a0a0a]/[0.12] bg-transparent text-xs font-medium uppercase tracking-[0.22em] text-[#0a0a0a] transition-colors duration-150 hover:border-[#0a0a0a]/30 hover:bg-[#0a0a0a]/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-focus-bmw)] focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-[#f4f3ef]/20 dark:text-[#f4f3ef] dark:hover:border-[#f4f3ef]/40 dark:hover:bg-[#f4f3ef]/[0.06] dark:focus-visible:ring-offset-[var(--marketing-void)] ${pad}`}
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className={`rounded-[var(--marketing-radius-apple)] bg-[#0a0a0a] text-xs font-medium uppercase tracking-[0.22em] text-[#f4f3ef] transition-colors duration-150 hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-focus-bmw)] focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-[#f4f3ef] dark:text-[#0a0a0a] dark:hover:bg-[#e8e6e0] dark:focus-visible:ring-offset-[var(--marketing-void)] ${pad}`}
        >
          Create account
        </Link>
      </nav>
    </header>
  );
}
