"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";
import { LoadingState } from "@/components/loading-state";
import { GlassPanel } from "@/components/layout/glass";

function formatTripRange(startMs: number, endMs: number) {
  try {
    const a = new Date(startMs);
    const b = new Date(endMs);
    return `${a.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${b.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
  } catch {
    return "Trip";
  }
}

export default function PlanPage() {
  useRequireAuth("/plan");

  const packingLists = useQuery(api.packingLists.list);
  const range = useMemo(() => {
    const start = new Date();
    const startStr = start.toISOString().slice(0, 10);
    const end = new Date();
    end.setDate(end.getDate() + 60);
    const endStr = end.toISOString().slice(0, 10);
    return { startStr, endStr };
  }, []);

  const outfitPlans = useQuery(api.outfitPlans.listByDateRange, {
    startDate: range.startStr,
    endDate: range.endStr,
  });

  const nextTrip =
    packingLists && packingLists.length > 0
      ? [...packingLists].sort((a, b) => b.updatedAt - a.updatedAt)[0]
      : null;

  const nextPlan =
    outfitPlans && outfitPlans.length > 0
      ? [...outfitPlans].sort((a, b) => a.date.localeCompare(b.date))[0]
      : null;

  const previewLoading =
    packingLists === undefined || outfitPlans === undefined;

  return (
    <PageContainer narrow className="max-w-xl">
      <SectionHeader
        title="plan"
        subtitle="Calendar and packing for trips — pick a view below"
      />

      <section className="mb-10">
        {previewLoading ? (
          <LoadingState mode="shimmer" className="min-h-[5rem]" />
        ) : (
          <GlassPanel className="border border-border px-4 py-4">
            <p className="text-label text-muted-foreground mb-3">Coming up</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-body text-foreground">
                  {nextPlan
                    ? `Outfit on ${nextPlan.date}`
                    : "No outfits on the calendar yet"}
                </p>
                <Link
                  href="/plan/calendar"
                  className="text-label text-signal-orange mt-1 inline-block hover:underline"
                >
                  Open calendar
                </Link>
              </div>
              <div>
                <p className="text-body text-foreground">
                  {nextTrip
                    ? `${nextTrip.name} · ${formatTripRange(nextTrip.startDate, nextTrip.endDate)}`
                    : "No trips yet"}
                </p>
                <Link
                  href="/plan/packing"
                  className="text-label text-signal-orange mt-1 inline-block hover:underline"
                >
                  Packing planner
                </Link>
              </div>
            </div>
          </GlassPanel>
        )}
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <Link
          href="/plan/calendar"
          className="group block border border-border bg-card hover:bg-secondary/50 transition-colors duration-200 p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange"
        >
          <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Calendar
          </span>
          <h2 className="mt-2 font-serif italic text-2xl text-foreground group-hover:text-signal-orange transition-colors">
            Outfit calendar
          </h2>
          <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Assign saved outfits to upcoming days
          </p>
          <span className="mt-4 inline-block text-[10px] uppercase tracking-[0.2em] text-signal-orange">
            Open calendar →
          </span>
        </Link>

        <Link
          href="/plan/packing"
          className="group block border border-border bg-card hover:bg-secondary/50 transition-colors duration-200 p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange"
        >
          <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Trips
          </span>
          <h2 className="mt-2 font-serif italic text-2xl text-foreground group-hover:text-signal-orange transition-colors">
            Packing planner
          </h2>
          <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Build a capsule wardrobe for your trip
          </p>
          <span className="mt-4 inline-block text-[10px] uppercase tracking-[0.2em] text-signal-orange">
            Open packing →
          </span>
        </Link>
      </div>
    </PageContainer>
  );
}
