"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface SavedLook {
  id: string;
  date: string;
  mood: string;
  garments: {
    src: string;
    name: string;
    type: string;
  }[];
}

const SAVED_LOOKS: SavedLook[] = [
  {
    id: "1",
    date: "Jan 28, 2026",
    mood: "Bold",
    garments: [
      { src: "/garments/look-a-top.jpg", name: "Wool coat", type: "outerwear" },
      {
        src: "/garments/look-a-bottom.jpg",
        name: "Wide trousers",
        type: "bottom",
      },
      {
        src: "/garments/look-a-shoes.jpg",
        name: "Chelsea boots",
        type: "shoes",
      },
    ],
  },
  {
    id: "2",
    date: "Jan 25, 2026",
    mood: "Minimal",
    garments: [
      { src: "/garments/shirt-white.jpg", name: "Oxford shirt", type: "top" },
      { src: "/garments/pants-black.jpg", name: "Dress pants", type: "bottom" },
      { src: "/garments/loafers-brown.jpg", name: "Loafers", type: "shoes" },
    ],
  },
  {
    id: "3",
    date: "Jan 22, 2026",
    mood: "Relaxed",
    garments: [
      { src: "/garments/sweater-grey.jpg", name: "Cashmere knit", type: "top" },
      {
        src: "/garments/jeans-indigo.jpg",
        name: "Selvedge denim",
        type: "bottom",
      },
      { src: "/garments/look-b-shoes.jpg", name: "Sneakers", type: "shoes" },
    ],
  },
  {
    id: "4",
    date: "Jan 18, 2026",
    mood: "Sharp",
    garments: [
      { src: "/garments/look-b-top.jpg", name: "Blazer", type: "top" },
      {
        src: "/garments/look-b-bottom.jpg",
        name: "Tailored pants",
        type: "bottom",
      },
      {
        src: "/garments/look-a-shoes.jpg",
        name: "Chelsea boots",
        type: "shoes",
      },
    ],
  },
];

// Group looks by month
const groupByMonth = (looks: SavedLook[]) => {
  const groups: { [key: string]: SavedLook[] } = {};
  looks.forEach((look) => {
    const month = look.date.split(" ").slice(0, 2).join(" ");
    if (!groups[month]) {
      groups[month] = [];
    }
    groups[month].push(look);
  });
  return groups;
};

export default function ArchivePage() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const groupedLooks = groupByMonth(SAVED_LOOKS);

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-signal-orange selection:text-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-12">
          <Link
            href="/"
            className="text-base md:text-lg tracking-tight font-medium hover:text-signal-orange transition-colors duration-100"
          >
            OutfAI
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/closet"
              className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-100"
            >
              Closet
            </Link>
            <span className="text-[10px] uppercase tracking-[0.2em] text-foreground">
              Archive
            </span>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <div className="pt-24 md:pt-32 px-4 md:px-8 lg:px-12 pb-28">
        {/* Title */}
        <section className="mb-12 md:mb-16">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl italic text-foreground leading-[0.9] tracking-tight mb-3">
            archive
          </h1>
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Your saved looks
          </p>
        </section>

        {/* Grouped looks */}
        {Object.entries(groupedLooks).map(([month, looks]) => (
          <section key={month} className="mb-16">
            {/* Month header */}
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                {month}
              </h2>
              <div className="h-px bg-border flex-1" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
                {looks.length} {looks.length === 1 ? "look" : "looks"}
              </span>
            </div>

            {/* Looks grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {looks.map((look) => (
                <Link
                  key={look.id}
                  href="/explain"
                  className="group block"
                  onMouseEnter={() => setHoveredId(look.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    opacity:
                      hoveredId !== null && hoveredId !== look.id ? 0.5 : 1,
                    transition: "opacity 100ms",
                  }}
                >
                  {/* Compact composition stack */}
                  <div className="flex flex-col gap-[1px] mb-4">
                    {look.garments.map((garment, idx) => (
                      <div
                        key={idx}
                        className="relative border border-border bg-card overflow-hidden"
                      >
                        <div className="aspect-[3/2] relative bg-secondary">
                          <Image
                            src={garment.src || "/placeholder.svg"}
                            alt={garment.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {look.date.split(", ")[0].split(" ")[1]}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground group-hover:text-signal-orange transition-colors duration-100">
                      {look.mood}
                    </span>
                  </div>

                  {/* Hover indicator line */}
                  <div
                    className="h-[2px] mt-3 bg-signal-orange transition-all duration-100"
                    style={{
                      width: hoveredId === look.id ? "100%" : "0%",
                    }}
                  />
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* Empty state hint */}
        {SAVED_LOOKS.length === 0 && (
          <section className="text-center py-20">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
              No saved looks yet
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-foreground hover:text-signal-orange transition-colors duration-100"
            >
              Create your first look
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
