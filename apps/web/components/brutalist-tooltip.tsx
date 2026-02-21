"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface BrutalistTooltipProps {
  children: React.ReactNode;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
}

export function BrutalistTooltip({
  children,
  content,
  position = "top",
}: BrutalistTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <div
        className={cn(
          "absolute z-50 px-3 py-2 bg-foreground text-background text-[10px] uppercase tracking-widest whitespace-nowrap",
          "transition-opacity duration-100",
          positionClasses[position],
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {content}
      </div>
    </div>
  );
}
