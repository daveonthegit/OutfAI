"use client";

import { cn } from "@/lib/utils";

interface SplitPaneProps {
  children: React.ReactNode;
  className?: string;
  /** Left (first) pane min width on large screens. Default 1fr 1fr. */
  leftFraction?: "1/3" | "1/2" | "2/5";
}

/**
 * Two-column layout that stacks on small screens and sits side-by-side from md.
 * Use for upload | form, list | detail, etc.
 */
export function SplitPane({
  children,
  className,
  leftFraction = "1/2",
}: SplitPaneProps) {
  const gridCols =
    leftFraction === "1/3"
      ? "md:grid-cols-[1fr_2fr]"
      : leftFraction === "2/5"
        ? "md:grid-cols-[2fr_3fr]"
        : "md:grid-cols-2";

  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 gap-8 md:gap-10 lg:gap-12",
        gridCols,
        className
      )}
    >
      {children}
    </div>
  );
}
