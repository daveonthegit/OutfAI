"use client";

import type { Doc } from "@convex/_generated/dataModel";

type ActivityStats =
  | {
      outfitCount?: number;
      outfitsSavedThisWeek?: number;
      wornCount?: number;
    }
  | null
  | undefined;

export function ProfileWardrobeStatsSection({
  garments,
}: {
  garments: Doc<"garments">[];
}) {
  return (
    <section className="mb-12">
      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
        Wardrobe
      </p>
      <div className="grid grid-cols-2 gap-px border border-border bg-border">
        <div className="bg-background px-5 py-4">
          <p className="text-3xl font-light tabular-nums">{garments.length}</p>
          <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
            Items
          </p>
        </div>
        <div className="bg-background px-5 py-4">
          <p className="text-3xl font-light tabular-nums">
            {new Set(garments.map((g) => g.category)).size}
          </p>
          <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
            Categories
          </p>
        </div>
      </div>
    </section>
  );
}

export function ProfileActivitySection({
  activityStats,
}: {
  activityStats: ActivityStats;
}) {
  return (
    <section className="mb-12" aria-labelledby="activity-heading">
      <p
        id="activity-heading"
        className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4"
      >
        Your activity
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px border border-border bg-border">
        <div className="bg-background px-4 py-4">
          <p className="text-2xl font-light tabular-nums">
            {activityStats?.outfitCount ?? "—"}
          </p>
          <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
            Outfits saved
          </p>
        </div>
        <div className="bg-background px-4 py-4">
          <p className="text-2xl font-light tabular-nums">
            {activityStats?.outfitsSavedThisWeek ?? "—"}
          </p>
          <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
            Saved this week
          </p>
        </div>
        <div className="bg-background px-4 py-4">
          <p className="text-2xl font-light tabular-nums">
            {activityStats?.wornCount ?? "—"}
          </p>
          <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
            Marked worn
          </p>
        </div>
      </div>
    </section>
  );
}
