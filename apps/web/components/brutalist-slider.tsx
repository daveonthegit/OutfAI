"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface BrutalistSliderProps {
  min?: number;
  max?: number;
  value?: number;
  onChange?: (value: number) => void;
  label?: string;
  showValue?: boolean;
}

export function BrutalistSlider({
  min = 0,
  max = 100,
  value = 50,
  onChange,
  label,
  showValue = true,
}: BrutalistSliderProps) {
  const [internalValue, setInternalValue] = useState(value);
  const currentValue = onChange ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    if (onChange) {
      onChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  const percentage = ((currentValue - min) / (max - min)) * 100;

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
            <span className="text-[11px] uppercase tracking-widest text-foreground font-medium tabular-nums">
              {currentValue}
            </span>
          )}
        </div>
      )}
      <div className="relative h-1 bg-secondary border border-border">
        <div
          className="absolute top-0 left-0 h-full bg-foreground transition-all duration-100"
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={currentValue}
          onChange={handleChange}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-full h-4 opacity-0 cursor-pointer"
          )}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-foreground border border-foreground transition-all duration-100 pointer-events-none"
          style={{ left: `calc(${percentage}% - 6px)` }}
        />
      </div>
    </div>
  );
}
