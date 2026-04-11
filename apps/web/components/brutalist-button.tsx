"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

interface BrutalistButtonProps {
  children: React.ReactNode;
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit" | "reset";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  /** Render as child element (e.g. `Link`) — merges styles; use for navigation without nested buttons. */
  asChild?: boolean;
}

export function BrutalistButton({
  children,
  variant = "solid",
  size = "md",
  type = "button",
  className,
  onClick,
  disabled,
  asChild = false,
}: BrutalistButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      type={asChild ? undefined : type}
      onClick={asChild ? undefined : onClick}
      disabled={asChild ? undefined : disabled}
      aria-disabled={asChild && disabled ? true : undefined}
      tabIndex={asChild && disabled ? -1 : undefined}
      className={cn(
        "inline-flex items-center justify-center uppercase tracking-widest font-medium transition-all duration-100 motion-reduce:transform-none active:translate-y-px motion-reduce:active:translate-y-0",
        focusRing,
        "rounded-sm",
        // Size variants
        size === "sm" && "min-h-9 text-[10px] px-3 py-2",
        size === "md" && "min-h-11 text-xs px-5 py-3",
        size === "lg" && "min-h-12 text-sm px-6 py-4",
        // Style variants
        variant === "solid" &&
          "bg-foreground text-background hover:bg-foreground/90",
        variant === "outline" &&
          "border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background",
        variant === "ghost" &&
          "bg-transparent text-foreground hover:text-[var(--signal-orange)]",
        // Disabled state
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {children}
    </Comp>
  );
}
