import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassPanelProps extends React.ComponentProps<"div"> {}

/** Wraps the shared `glass-panel` utility for frosted elevated surfaces. */
export function GlassPanel({ className, ...props }: GlassPanelProps) {
  return (
    <div className={cn("glass-panel rounded-none", className)} {...props} />
  );
}

export interface GlassBarProps extends React.ComponentProps<"div"> {}

/** Wraps the shared `glass-bar` utility for sticky headers and nav strips. */
export function GlassBar({ className, ...props }: GlassBarProps) {
  return <div className={cn("glass-bar rounded-none", className)} {...props} />;
}
