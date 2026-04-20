"use client";

import Link from "next/link";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";

export default function PlanPage() {
  useRequireAuth("/plan");

  return (
    <PageContainer narrow className="max-w-xl">
      <SectionHeader
        title="plan"
        subtitle="Calendar and packing for trips — pick a view below"
      />

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
