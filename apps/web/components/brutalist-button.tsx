"use client";

import React from "react";

import { cn } from "@/lib/utils";

interface BrutalistButtonProps {
  children: React.ReactNode;
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function BrutalistButton({
  children,
  variant = "solid",
  size = "md",
  className,
  onClick,
  disabled,
}: BrutalistButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "uppercase tracking-widest font-medium transition-all duration-100 active:translate-y-px",
        // Size variants
        size === "sm" && "text-[10px] px-3 py-2",
        size === "md" && "text-xs px-5 py-3",
        size === "lg" && "text-sm px-6 py-4",
        // Style variants
        variant === "solid" &&
          "bg-foreground text-background hover:bg-foreground/90",
        variant === "outline" &&
          "bg-transparent border border-foreground text-foreground hover:bg-foreground hover:text-background",
        variant === "ghost" &&
          "bg-transparent text-foreground hover:text-signal-orange",
        // Disabled state
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}
