"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BrutalistToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function BrutalistToggle({
  checked,
  onChange,
  label,
  disabled,
}: BrutalistToggleProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        "flex items-center gap-3 group",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div
        className={cn(
          "w-10 h-5 border transition-colors duration-100 relative",
          checked
            ? "bg-acid-lime border-acid-lime"
            : "bg-secondary border-border"
        )}
      >
        <div
          className={cn(
            "absolute top-0.5 w-3.5 h-3.5 transition-all duration-100",
            checked
              ? "left-[calc(100%-16px)] bg-background"
              : "left-0.5 bg-foreground"
          )}
        />
      </div>
      {label && (
        <span className="text-[11px] uppercase tracking-widest text-foreground group-hover:text-signal-orange transition-colors duration-100">
          {label}
        </span>
      )}
    </button>
  );
}
