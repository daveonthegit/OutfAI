"use client";

import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  /** If true, constrain max-width for readability on large screens */
  narrow?: boolean;
  /** If true, remove horizontal padding (e.g. for full-bleed grids inside) */
  noPaddingX?: boolean;
}

/**
 * Consistent horizontal padding and optional max-width for page content.
 * Uses layout tokens: padding scales with breakpoint; max-width avoids over-stretched content on wide screens.
 */
export function PageContainer({
  children,
  className,
  narrow = false,
  noPaddingX = false,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full min-w-0",
        !noPaddingX && "px-4 md:px-8 lg:px-10 xl:px-12",
        narrow ? "max-w-[65rem]" : "max-w-[90rem]",
        className
      )}
    >
      {children}
    </div>
  );
}
