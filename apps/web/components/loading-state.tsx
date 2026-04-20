"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export type LoadingStateMode = "skeleton" | "spinner" | "shimmer";

export interface LoadingStateProps {
  mode: LoadingStateMode;
  /** Number of skeleton blocks when mode is skeleton */
  skeletonCount?: number;
  className?: string;
  /** Visually hidden label for assistive tech */
  label?: string;
  /** When mode is `spinner`, hide the visible "Loading" text (icon + sr-only only). */
  showLabel?: boolean;
}

export function LoadingState({
  mode,
  skeletonCount = 8,
  className,
  label = "Loading",
  showLabel = true,
}: LoadingStateProps) {
  if (mode === "skeleton") {
    return (
      <div
        className={cn(
          "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4",
          className
        )}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="sr-only">{label}</span>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Skeleton
            key={i}
            className="aspect-square w-full rounded-none border border-border"
          />
        ))}
      </div>
    );
  }

  if (mode === "spinner") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 text-muted-foreground",
          className
        )}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="sr-only">{label}</span>
        <svg
          className="size-4 shrink-0 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.25" />
          <path d="M21 12a9 9 0 01-9-9" />
        </svg>
        {showLabel ? (
          <span className="text-label text-muted-foreground">Loading</span>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative min-h-[12rem] w-full overflow-hidden border border-border bg-secondary",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">{label}</span>
      <div
        className="absolute inset-0 animate-pulse bg-gradient-to-r from-secondary via-muted/40 to-secondary bg-[length:200%_100%]"
        aria-hidden
      />
    </div>
  );
}
