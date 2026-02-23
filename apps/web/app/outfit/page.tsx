"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function OutfitContent() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedGarment, setSelectedGarment] = useState<any | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get outfit data from query params
  const outfitData = searchParams.get("outfit");

  if (!outfitData) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
          <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-12">
            <Link
              href="/"
              className="text-base md:text-lg tracking-tight font-medium hover:text-signal-orange transition-colors"
            >
              OutfAI
            </Link>
          </div>
        </header>
        <div className="pt-24 md:pt-32 px-4 md:px-8 lg:px-12">
          <p className="text-muted-foreground">No outfit selected</p>
          <Link href="/" className="text-signal-orange hover:underline">
            Back to recommendations
          </Link>
        </div>
      </main>
    );
  }

  let outfit;
  try {
    outfit = JSON.parse(outfitData);
  } catch {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
          <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-12">
            <Link
              href="/"
              className="text-base md:text-lg tracking-tight font-medium hover:text-signal-orange transition-colors"
            >
              OutfAI
            </Link>
          </div>
        </header>
        <div className="pt-24 md:pt-32 px-4 md:px-8 lg:px-12">
          <p className="text-muted-foreground">Invalid outfit data</p>
          <Link href="/" className="text-signal-orange hover:underline">
            Back to recommendations
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-12">
          <Link
            href="/"
            className="text-base md:text-lg tracking-tight font-medium hover:text-signal-orange transition-colors"
          >
            OutfAI
          </Link>
          <button
            onClick={() => router.back()}
            className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
          >
            Back
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="pt-24 md:pt-32 px-4 md:px-8 lg:px-12 pb-28">
        {/* Title */}
        <section className="mb-12 md:mb-16">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl italic text-foreground leading-[0.9] tracking-tight mb-3">
            {outfit.label}
          </h1>
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            {outfit.garments.length} pieces
          </p>
        </section>

        {/* Explanation */}
        {outfit.explanation && (
          <section className="mb-12 md:mb-16 border-t border-b border-border py-6">
            <p className="text-[11px] leading-relaxed text-muted-foreground max-w-2xl">
              {outfit.explanation}
            </p>
          </section>
        )}

        {/* Garment Grid - Same format as closet */}
        <section className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0.5">
            {outfit.garments.map((garment: any, index: number) => (
              <div
                key={index}
                className="relative border border-border bg-card transition-all duration-100 cursor-pointer"
                style={{
                  opacity: hoveredId !== null && hoveredId !== index ? 0.5 : 1,
                }}
                onMouseEnter={() => setHoveredId(index)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setSelectedGarment(garment)}
              >
                {/* Image */}
                <div className="aspect-square relative bg-secondary">
                  <Image
                    src={garment.src || "/placeholder.svg"}
                    alt={garment.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info overlay on hover */}
                <div
                  className="absolute bottom-0 left-0 right-0 bg-background/95 px-3 py-3 transition-all duration-100"
                  style={{
                    transform:
                      hoveredId === index
                        ? "translateY(0)"
                        : "translateY(100%)",
                  }}
                >
                  <p className="text-[11px] uppercase tracking-widest text-foreground mb-1">
                    {garment.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                      {garment.type}
                    </span>
                  </div>
                </div>

                {/* Accent line */}
                <div
                  className="absolute top-0 left-0 w-0.5 h-full transition-colors duration-100"
                  style={{
                    backgroundColor:
                      hoveredId === index
                        ? "var(--signal-orange)"
                        : "transparent",
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Garment detail modal */}
        {selectedGarment && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setSelectedGarment(null)}
          >
            <div
              className="bg-background border border-border max-w-md w-full p-6 rounded shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full aspect-square bg-secondary mb-4">
                <Image
                  src={selectedGarment.src || "/placeholder.svg"}
                  alt={selectedGarment.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-lg font-medium mb-2">
                {selectedGarment.name}
              </h3>
              <p className="text-[11px] text-muted-foreground mb-2">
                Type: {selectedGarment.type || selectedGarment.category}
              </p>
              <p className="text-[11px] text-muted-foreground mb-3">
                Color: {selectedGarment.color}
              </p>
              {selectedGarment.traits && (
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    Traits
                  </p>
                  <ul className="text-[11px]">
                    <li>
                      <strong>Style:</strong>{" "}
                      {Array.isArray(selectedGarment.traits.style)
                        ? selectedGarment.traits.style.join(", ")
                        : selectedGarment.traits.style}
                    </li>
                    <li>
                      <strong>Fit:</strong> {selectedGarment.traits.fit}
                    </li>
                    <li>
                      <strong>Occasion:</strong>{" "}
                      {Array.isArray(selectedGarment.traits.occasion)
                        ? selectedGarment.traits.occasion.join(", ")
                        : selectedGarment.traits.occasion}
                    </li>
                    <li>
                      <strong>Versatility:</strong>{" "}
                      {selectedGarment.traits.versatility}
                    </li>
                    <li>
                      <strong>Vibrancy:</strong>{" "}
                      {selectedGarment.traits.vibrancy}
                    </li>
                  </ul>
                </div>
              )}
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedGarment(null)}
                  className="px-3 py-2 text-[11px] uppercase tracking-[0.2em] border border-border hover:bg-secondary transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action */}
        <section className="border-t border-border pt-10">
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
        </section>
      </div>
    </main>
  );
}

export default function OutfitPage() {
  return (
    <Suspense fallback={null}>
      <OutfitContent />
    </Suspense>
  );
}
