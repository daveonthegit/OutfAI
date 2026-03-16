"use client";

import { cn } from "@/lib/utils";

/**
 * Fixed top bar used across app pages. Same height and horizontal padding everywhere
 * so the top bar does not change size when navigating.
 */
export function AppHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background border-b border-border",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-10 xl:px-12">
        {children}
      </div>
    </header>
  );
}
