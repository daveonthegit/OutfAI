"use client";

import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
  /** Smaller label above title */
  label?: React.ReactNode;
}

/**
 * Consistent section title + optional subtitle and label for scanability.
 */
export function SectionHeader({
  title,
  subtitle,
  className,
  label,
}: SectionHeaderProps) {
  return (
    <header className={cn("mb-10 md:mb-14", className)}>
      {label && (
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
          {label}
        </p>
      )}
      <h1 className="font-serif italic text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-foreground leading-[0.9] tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          {subtitle}
        </p>
      )}
    </header>
  );
}
