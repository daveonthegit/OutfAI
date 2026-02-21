import React from "react";
import { cn } from "@/lib/utils";

interface BrutalistCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "outlined";
}

export function BrutalistCard({
  children,
  className,
  variant = "default",
}: BrutalistCardProps) {
  return (
    <div
      className={cn(
        "bg-card p-6 transition-all duration-100",
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
    <h3
      className={cn("text-sm uppercase tracking-widest font-medium", className)}
    >
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
    <div className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </div>
  );
}
