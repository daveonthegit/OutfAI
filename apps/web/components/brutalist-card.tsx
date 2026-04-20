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
        "bg-card transition-all duration-100",
        density === "compact" ? "p-4" : "p-6",
        variant === "default" && "border border-border",
        variant === "elevated" &&
          "border border-border shadow-[4px_4px_0_0_var(--foreground)]",
        variant === "outlined" && "border-2 border-foreground",
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
    <div className={cn("border-b border-border pb-4 mb-4", className)}>
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
