"use client";

import Link from "next/link";

export function HomeSampleClosetBanner() {
  return (
    <section className="mb-6 glass-panel rounded-sm px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Using sample items. Add your own for personalized results.
      </p>
      <Link
        href="/add"
        className="text-[11px] uppercase tracking-[0.2em] text-foreground hover:text-signal-orange transition-colors duration-100 underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Add garments
      </Link>
    </section>
  );
}
