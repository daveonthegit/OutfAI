import React from "react";
import { cn } from "@/lib/utils";

interface BrutalistProgressProps {
  value: number;
  max?: number;
  label?: string;
  variant?: "default" | "orange" | "lime";
  showValue?: boolean;
}

export function BrutalistProgress({
  value,
  max = 100,
  label,
  variant = "default",
  showValue = false,
}: BrutalistProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const barColors = {
    default: "bg-foreground",
    orange: "bg-signal-orange",
    lime: "bg-acid-lime",
  };

  return (
    <div className="flex flex-col gap-2">
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && (
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-[10px] uppercase tracking-widest text-foreground font-medium tabular-nums">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className="h-1 bg-secondary border border-border">
        <div
          className={cn(
            "h-full transition-all duration-300",
            barColors[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
