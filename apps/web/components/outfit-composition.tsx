"use client";

import Image from "next/image";
import { useState } from "react";

interface Garment {
  src: string;
  name: string;
  type: "outerwear" | "top" | "bottom" | "shoes";
}

interface OutfitCompositionProps {
  label: string;
  garments: Garment[];
}

export function OutfitComposition({ label, garments }: OutfitCompositionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="group">
      {/* Label */}
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {label}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">
          {garments.length} pieces
        </span>
      </div>

      {/* Garment Stack */}
      <div className="flex flex-col gap-[2px]">
        {garments.map((garment, index) => (
          <div
            key={index}
            className="relative overflow-hidden border border-border bg-card transition-all duration-100"
            style={{
              opacity:
                hoveredIndex !== null && hoveredIndex !== index ? 0.4 : 1,
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Garment Image */}
            <div className="aspect-[4/3] relative bg-secondary">
              <Image
                src={garment.src || "/placeholder.svg"}
                alt={garment.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Garment Info - appears on hover */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-background/95 px-3 py-2 transition-all duration-100"
              style={{
                transform:
                  hoveredIndex === index ? "translateY(0)" : "translateY(100%)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-foreground">
                  {garment.name}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                  {garment.type}
                </span>
              </div>
            </div>

            {/* Type indicator line */}
            <div
              className="absolute top-0 left-0 w-[2px] h-full transition-colors duration-100"
              style={{
                backgroundColor:
                  hoveredIndex === index
                    ? "var(--signal-orange)"
                    : "transparent",
              }}
            />
          </div>
        ))}
      </div>

      {/* Composition line */}
      <div className="mt-4 flex items-center gap-2">
        <div className="h-px bg-border flex-1" />
        <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
          Composition
        </span>
        <div className="h-px bg-border flex-1" />
      </div>
    </div>
  );
}
