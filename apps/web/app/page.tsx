"use client";

import { useState } from "react";
import Link from "next/link";
import { OutfitComposition } from "@/components/outfit-composition";

const LOOK_A = {
  label: "Look A",
  garments: [
    {
      src: "/garments/look-a-top.jpg",
      name: "Oversized wool coat",
      type: "outerwear" as const,
    },
    {
      src: "/garments/look-a-bottom.jpg",
      name: "Wide-leg trousers",
      type: "bottom" as const,
    },
    {
      src: "/garments/look-a-shoes.jpg",
      name: "Leather Chelsea boots",
      type: "shoes" as const,
    },
  ],
};

const LOOK_B = {
  label: "Look B",
  garments: [
    {
      src: "/garments/look-b-top.jpg",
      name: "Deconstructed blazer",
      type: "top" as const,
    },
    {
      src: "/garments/look-b-bottom.jpg",
      name: "Tailored trousers",
      type: "bottom" as const,
    },
    {
      src: "/garments/look-b-shoes.jpg",
      name: "Platform sneakers",
      type: "shoes" as const,
    },
  ],
};

export default function Home() {
  const [isShuffling, setIsShuffling] = useState(false);

  const handleShuffle = () => {
    setIsShuffling(true);
    setTimeout(() => setIsShuffling(false), 150);
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-signal-orange selection:text-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-12">
          <h1 className="text-base md:text-lg tracking-tight font-medium">
            OutfAI
          </h1>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-acid-lime" />
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              Active
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="pt-24 md:pt-32 px-4 md:px-8 lg:px-12 pb-28">
        {/* Hero Typography */}
        <section className="mb-16 md:mb-24 lg:mb-32">
          <div className="max-w-4xl">
            {/* Weather context - small, peripheral */}
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6 md:mb-8">
              12°C · Light Rain
            </p>

            {/* Mood line - oversized editorial */}
            <h2 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl italic text-foreground leading-[0.9] tracking-tight mb-0">
              today feels
            </h2>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl italic text-signal-orange leading-[0.9] tracking-tight">
              bold
            </h2>
          </div>
        </section>

        {/* Editorial divider */}
        <div className="flex items-center gap-6 mb-12 md:mb-16">
          <div className="h-px bg-border flex-1" />
          <span className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
            Curated Selection
          </span>
          <div className="h-px bg-border flex-1" />
        </div>

        {/* Outfit Compositions - Side by Side */}
        <section className="mb-16 md:mb-24">
          <div
            className={`grid grid-cols-2 gap-4 md:gap-8 lg:gap-12 transition-opacity duration-100 ${
              isShuffling ? "opacity-30" : "opacity-100"
            }`}
          >
            <OutfitComposition
              label={LOOK_A.label}
              garments={LOOK_A.garments}
            />
            <OutfitComposition
              label={LOOK_B.label}
              garments={LOOK_B.garments}
            />
          </div>
        </section>

        {/* Actions - Typographic, subtle */}
        <section className="flex items-center justify-center gap-8 md:gap-12 mb-20 md:mb-28">
          <button className="text-[11px] uppercase tracking-[0.25em] text-foreground hover:text-signal-orange transition-colors duration-100 group flex items-center gap-2">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="transition-transform duration-100 group-hover:scale-110"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            Save Look
          </button>

          <div className="w-px h-4 bg-border" />

          <button
            onClick={handleShuffle}
            className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors duration-100 group flex items-center gap-2"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="transition-transform duration-100 group-hover:rotate-180"
            >
              <polyline points="16 3 21 3 21 8" />
              <line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" />
              <line x1="15" y1="15" x2="21" y2="21" />
              <line x1="4" y1="4" x2="9" y2="9" />
            </svg>
            Shuffle
          </button>
        </section>

        {/* Explanation Entry Point */}
        <section className="border-t border-border pt-10 md:pt-14">
          <Link
            href="/explain"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-100 group"
          >
            Why this works
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="transition-transform duration-100 group-hover:translate-x-1"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </section>
      </div>
    </main>
  );
}
