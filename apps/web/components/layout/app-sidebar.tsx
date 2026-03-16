"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Today" },
  { href: "/closet", label: "Closet" },
  { href: "/add", label: "Add" },
  { href: "/archive", label: "Archive" },
  { href: "/profile", label: "Profile" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <aside
      className="fixed left-0 top-0 z-40 hidden h-full w-56 flex-col border-r border-border bg-background lg:flex"
      aria-label="Main navigation"
    >
      <div className="flex flex-col gap-1 p-4">
        <Link
          href="/"
          className="mb-4 text-[10px] font-medium uppercase tracking-[0.3em] text-foreground hover:text-signal-orange transition-colors duration-100"
        >
          OutfAI
        </Link>
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-sm px-3 py-2.5 text-[11px] uppercase tracking-[0.2em] transition-colors duration-100 ${
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto border-t border-border p-4">
        <button
          type="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors duration-100"
          aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle theme"}
        >
          {!mounted ? (
            <span className="h-4 w-4" />
          ) : isDark ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
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
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
          {mounted ? (isDark ? "Light" : "Dark") : "Theme"}
        </button>
      </div>
    </aside>
  );
}
