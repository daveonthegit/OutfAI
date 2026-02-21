import React from "react";
import { cn } from "@/lib/utils";

interface BrutalistDividerProps {
  label?: string;
  className?: string;
}

export function BrutalistDivider({ label, className }: BrutalistDividerProps) {
  if (label) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          {label}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
    );
  }

  return <div className={cn("h-px bg-border", className)} />;
}
