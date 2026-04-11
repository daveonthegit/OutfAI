"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { NAV_ITEMS, isNavItemActive } from "@/lib/nav-items";
import { cn } from "@/lib/utils";
import { isBottomNavHiddenRoute } from "@/lib/routes";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md";

export function BottomNav() {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isBottomNavHiddenRoute(pathname)) return null;

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const isDark = resolvedTheme === "dark";

  return (
    <nav
      className="glass-bar fixed bottom-0 left-0 right-0 z-50 rounded-none border-x-0 border-b-0 border-t border-border lg:hidden pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <div className="flex min-h-[3.5rem] items-center justify-between px-1 sm:px-2 md:px-4">
        <div className="flex flex-1 items-center justify-around">
          {NAV_ITEMS.map((item) => {
            const isActive = isNavItemActive(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  focusRing,
                  "flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 px-2 py-2 transition-colors duration-150 md:px-4",
                  isActive
                    ? "text-[var(--signal-orange)]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "transition-transform duration-150 motion-reduce:transform-none",
                    isActive && "scale-110 motion-reduce:scale-100"
                  )}
                >
                  {item.icon}
                </span>
                <span className="text-[10px] uppercase tracking-[0.14em] md:text-[11px]">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className={cn(
            focusRing,
            "flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 border-l border-border px-2 py-2 text-muted-foreground transition-colors duration-150 hover:text-foreground md:px-4"
          )}
          aria-label={
            mounted
              ? `Switch to ${isDark ? "light" : "dark"} mode`
              : "Toggle theme"
          }
        >
          {!mounted ? (
            <div className="h-[18px] w-[18px]" aria-hidden />
          ) : isDark ? (
            <svg
              width="18"
              height="18"
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
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
          <span className="text-[10px] uppercase tracking-[0.14em] md:text-[11px]">
            {!mounted ? "" : isDark ? "Light" : "Dark"}
          </span>
        </button>
      </div>
    </nav>
  );
}
