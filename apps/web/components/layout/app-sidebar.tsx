"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isNavItemActive } from "@/lib/nav-items";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

interface AppSidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function AppSidebar({ collapsed, onCollapsedChange }: AppSidebarProps) {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <aside
      className={cn(
        "glass-rail fixed left-0 top-0 z-40 hidden h-full flex-col transition-[width] duration-200 ease-out lg:flex",
        collapsed ? "w-14" : "w-56"
      )}
      aria-label="Main navigation"
    >
      <div className="flex flex-1 flex-col gap-1 overflow-hidden p-4">
        <div className="mb-4 flex items-center justify-between gap-2">
          <Link
            href="/"
            className={cn(
              focusRing,
              "rounded-sm font-medium uppercase tracking-[0.3em] text-foreground transition-colors duration-100 hover:text-[var(--signal-orange)] shrink-0 overflow-hidden",
              collapsed ? "flex w-6 justify-center text-[10px]" : "text-[10px]"
            )}
            title={collapsed ? "OutfAI" : undefined}
          >
            {collapsed ? "O" : "OutfAI"}
          </Link>
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = isNavItemActive(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                focusRing,
                "flex items-center gap-3 rounded-sm py-2.5 text-[11px] uppercase tracking-[0.2em] transition-colors duration-100",
                collapsed ? "justify-center px-0" : "px-3",
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto flex flex-col border-t border-border p-4">
        <button
          type="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          title={
            mounted
              ? `Switch to ${isDark ? "light" : "dark"} mode`
              : "Toggle theme"
          }
          className={cn(
            focusRing,
            "flex items-center rounded-sm py-2.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-100 hover:bg-secondary hover:text-foreground",
            collapsed ? "w-full justify-center px-0" : "w-full gap-3 px-3"
          )}
          aria-label={
            mounted
              ? `Switch to ${isDark ? "light" : "dark"} mode`
              : "Toggle theme"
          }
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
          {!collapsed && mounted && <span>{isDark ? "Light" : "Dark"}</span>}
        </button>
        <button
          type="button"
          onClick={() => onCollapsedChange(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            focusRing,
            "mt-2 flex items-center rounded-sm py-2.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-100 hover:bg-secondary hover:text-foreground",
            collapsed ? "w-full justify-center px-0" : "w-full gap-3 px-3"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={cn(
              "shrink-0 transition-transform duration-200",
              !collapsed && "rotate-180"
            )}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
