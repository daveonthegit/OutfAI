"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BrutalistCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function BrutalistCheckbox({
  checked,
  onChange,
  label,
  disabled,
}: BrutalistCheckboxProps) {
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
          "w-5 h-5 border flex items-center justify-center transition-all duration-100",
          checked
            ? "bg-foreground border-foreground"
            : "bg-transparent border-border group-hover:border-foreground"
        )}
      >
        {checked && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-background"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      {label && (
        <span className="text-[11px] uppercase tracking-widest text-foreground group-hover:text-signal-orange transition-colors duration-100">
          {label}
        </span>
      )}
    </button>
  );
}
