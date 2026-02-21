"use client";

import Image from "next/image";
import Link from "next/link";

const OUTFIT = {
  garments: [
    {
      src: "/garments/look-a-top.jpg",
      name: "Oversized wool coat",
      type: "Outerwear",
    },
    { src: "/garments/shirt-white.jpg", name: "Cotton oxford", type: "Top" },
    {
      src: "/garments/look-a-bottom.jpg",
      name: "Wide-leg trousers",
      type: "Bottom",
    },
    { src: "/garments/look-a-shoes.jpg", name: "Chelsea boots", type: "Shoes" },
  ],
  explanation: {
    weather:
      "The structured wool coat provides warmth against the 12°C temperature while maintaining a sharp silhouette. Layering allows for temperature adaptation throughout the day.",
    mood: "Bold energy translated through oversized proportions and strong shoulders. The monochrome palette projects confidence without visual noise.",
    styling:
      "Wide-leg trousers balance the coat's volume, creating an intentional column of proportion. Chelsea boots add height and a slight edge without competing with the outerwear statement.",
  },
  notes: [
    "Consider rolling sleeves slightly for a more relaxed interpretation",
    "Bag recommendation: structured black leather tote",
    "Works for: meetings, gallery visits, evening dinners",
  ],
};

export default function ExplainPage() {
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
          <Link
            href="/"
            className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-100 flex items-center gap-2"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="pt-24 md:pt-32 px-4 md:px-8 lg:px-12 pb-28">
        {/* Title */}
        <section className="mb-12 md:mb-16">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Look Analysis
          </p>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl italic text-foreground leading-[0.9] tracking-tight">
            why this works
          </h1>
        </section>

        {/* Two column layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Outfit composition stack */}
          <section>
            <div className="sticky top-28">
              <div className="flex flex-col gap-[2px]">
                {OUTFIT.garments.map((garment, index) => (
                  <div
                    key={index}
                    className="relative border border-border bg-card"
                  >
                    <div className="aspect-[16/9] relative bg-secondary">
                      <Image
                        src={garment.src || "/placeholder.svg"}
                        alt={garment.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-background/90 px-3 py-2 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest text-foreground">
                        {garment.name}
                      </span>
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                        {garment.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Composition label */}
              <div className="mt-4 flex items-center gap-2">
                <div className="h-px bg-border flex-1" />
                <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
                  4 Pieces
                </span>
                <div className="h-px bg-border flex-1" />
              </div>
            </div>
          </section>

          {/* Right: Editorial explanation */}
          <section className="flex flex-col gap-12">
            {/* Weather alignment */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-1.5 bg-electric-blue" />
                <h3 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Weather Alignment
                </h3>
              </div>
              <p className="text-[15px] leading-relaxed text-foreground/90">
                {OUTFIT.explanation.weather}
              </p>
            </div>

            {/* Mood alignment */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-1.5 bg-signal-orange" />
                <h3 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Mood Alignment
                </h3>
              </div>
              <p className="text-[15px] leading-relaxed text-foreground/90">
                {OUTFIT.explanation.mood}
              </p>
            </div>

            {/* Styling logic */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-1.5 bg-acid-lime" />
                <h3 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Styling Logic
                </h3>
              </div>
              <p className="text-[15px] leading-relaxed text-foreground/90">
                {OUTFIT.explanation.styling}
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Editor's notes */}
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-6">
                Editor's Notes
              </h3>
              <div className="flex flex-col gap-4">
                {OUTFIT.notes.map((note, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-[10px] text-muted-foreground/50 mt-0.5">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-[13px] leading-relaxed text-muted-foreground">
                      {note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
