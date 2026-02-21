import React from "react";
import { cn } from "@/lib/utils";

interface TagProps {
  children: React.ReactNode;
  variant?: "default" | "accent";
  className?: string;
}

export function Tag({ children, variant = "default", className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-1 text-[10px] uppercase tracking-widest font-medium",
        variant === "default" &&
          "bg-secondary text-secondary-foreground border border-border",
        variant === "accent" && "bg-signal-orange text-background",
        className
      )}
    >
      {children}
    </span>
  );
}
