"use client";

import { cn } from "@/lib/utils";

interface ContentGridProps {
  children: React.ReactNode;
  className?: string;
  /** 2 cols from sm, 3 from lg, 4 from xl. Use "cards" for outfit/closet cards; "tiles" for tighter garment grid. */
  variant?: "cards" | "tiles";
}

/**
 * Responsive content grid: 1 col default, 2 at sm, 3 at lg, 4 at xl for cards;
 * tiles use 2→3→4→4 for denser layout.
 */
export function ContentGrid({
  children,
  className,
  variant = "cards",
}: ContentGridProps) {
  return (
    <div
      className={cn(
        "grid w-full gap-4 sm:gap-5 md:gap-6 lg:gap-6 xl:gap-6",
        variant === "cards" &&
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        variant === "tiles" &&
          "grid-cols-2 gap-0.5 sm:gap-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}
