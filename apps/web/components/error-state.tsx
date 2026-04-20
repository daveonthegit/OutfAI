"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { BrutalistButton } from "@/components/brutalist-button";
import {
  BrutalistCard,
  BrutalistCardContent,
} from "@/components/brutalist-card";

export interface ErrorStateProps {
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ onRetry, className }: ErrorStateProps) {
  return (
    <BrutalistCard variant="outlined" className={cn("max-w-md", className)}>
      <BrutalistCardContent className="text-foreground">
        <p className="text-label text-muted-foreground mb-2">Something broke</p>
        <p className="text-body text-muted-foreground mb-6">
          We couldn&apos;t load this. Check your connection and try again.
        </p>
        {onRetry && (
          <BrutalistButton
            type="button"
            variant="outline"
            size="md"
            onClick={onRetry}
          >
            Retry
          </BrutalistButton>
        )}
      </BrutalistCardContent>
    </BrutalistCard>
  );
}
