import React from "react";
import { cn } from "@/lib/utils";

export type BrutalistCardDensity = "compact" | "default";

interface BrutalistCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "outlined";
  /** `compact` = p-4 for dense tiles; `default` = p-6 */
  density?: BrutalistCardDensity;
}

export function BrutalistCard({
  children,
  className,
  variant = "default",
  density = "default",
}: BrutalistCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--marketing-radius-apple)] bg-card transition-all duration-150",
        density === "compact" ? "p-4" : "p-6",
        variant === "default" && "border border-border/80",
        variant === "elevated" &&
          "border border-border/80 shadow-[0_24px_80px_-48px_rgba(10,10,10,0.42)] dark:shadow-[0_24px_80px_-48px_rgba(0,0,0,0.72)]",
        variant === "outlined" && "border border-foreground/40",
        className
      )}
    >
      {children}
    </div>
  );
}

export function BrutalistCardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 border-b border-border/80 pb-4", className)}>
      {children}
    </div>
  );
}

export function BrutalistCardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("text-label font-medium text-foreground", className)}>
      {children}
    </h3>
  );
}

export function BrutalistCardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("text-body text-muted-foreground", className)}>
      {children}
    </div>
  );
}
