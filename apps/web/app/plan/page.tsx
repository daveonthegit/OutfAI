"use client";

import Link from "next/link";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";
import { UserAvatar } from "@/components/user-avatar";

export default function PlanPage() {
  useRequireAuth("/plan");

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-signal-orange selection:text-background">
      <header className="fixed top-0 left-0 right-0 z-50 glass-bar rounded-none border-x-0 border-t-0 border-b border-border">
        <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-10 xl:px-12">
          <Link
            href="/"
            className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium hover:text-signal-orange transition-colors duration-100"
          >
            OutfAI
          </Link>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-4">
              <Link
                href="/archive"
                className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-100"
              >
                Archive
              </Link>
              <span className="text-[10px] uppercase tracking-[0.2em] text-foreground">
                Plan
              </span>
            </nav>
            <UserAvatar />
          </div>
        </div>
      </header>

      <div className="pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-24 md:pb-28">
        <PageContainer narrow className="max-w-xl">
          <SectionHeader
            title="plan"
            subtitle="Calendar and packing for trips"
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <Link
              href="/calendar"
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
              href="/packing"
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
      </div>
    </main>
  );
}
