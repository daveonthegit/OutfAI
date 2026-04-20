"use client";

import { WHY_OUTFIT_MIN_ACTIONS } from "@/lib/personalization/constants";

export type WhyContributor = {
  dim: string;
  value: string;
  contribution: number;
};

type WhyThisOutfitProps = {
  contributors: WhyContributor[];
  totalActions: number;
};

export function WhyThisOutfit({
  contributors,
  totalActions,
}: WhyThisOutfitProps) {
  if (totalActions < WHY_OUTFIT_MIN_ACTIONS || contributors.length === 0) {
    return null;
  }

  const chips = contributors.slice(0, 2);

  return (
    <div className="flex flex-wrap gap-1.5 mt-2" aria-label="Why this outfit">
      {chips.map((c) => (
        <span
          key={`${c.dim}-${c.value}`}
          className="inline-flex items-center px-2 py-0.5 text-[8px] uppercase tracking-widest border border-border text-muted-foreground bg-secondary/40"
        >
          {c.dim}: {c.value}
        </span>
      ))}
    </div>
  );
}
