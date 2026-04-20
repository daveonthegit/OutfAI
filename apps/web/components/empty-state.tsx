"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BrutalistButton } from "@/components/brutalist-button";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        "flex min-h-[120px] flex-col items-center justify-center gap-3 px-4 py-12 text-center",
        className
      )}
    >
      {icon && (
        <div className="text-muted-foreground [&_svg]:size-10" aria-hidden>
          {icon}
        </div>
      )}
      <h2 className="text-display-md text-foreground">{title}</h2>
      {description && (
        <p className="text-body max-w-md text-muted-foreground">
          {description}
        </p>
      )}
      {action}
    </section>
  );
}

export function EmptyStateActionLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <BrutalistButton asChild variant="outline" size="md">
      <Link href={href}>{children}</Link>
    </BrutalistButton>
  );
}
