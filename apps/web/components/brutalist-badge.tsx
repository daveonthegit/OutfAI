import React from "react";
import { cn } from "@/lib/utils";

interface BrutalistBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "orange" | "lime" | "blue" | "outline";
  size?: "sm" | "md";
}

export function BrutalistBadge({
  children,
  variant = "default",
  size = "md",
}: BrutalistBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center uppercase tracking-widest font-medium",
        size === "sm" && "text-[9px] px-2 py-0.5",
        size === "md" && "text-[10px] px-3 py-1",
        variant === "default" && "bg-foreground text-background",
        variant === "orange" && "bg-signal-orange text-background",
        variant === "lime" && "bg-acid-lime text-background",
        variant === "blue" && "bg-electric-blue text-foreground",
        variant === "outline" &&
          "bg-transparent border border-foreground text-foreground"
      )}
    >
      {children}
    </span>
  );
}
