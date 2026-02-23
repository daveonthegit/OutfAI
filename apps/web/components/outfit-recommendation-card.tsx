"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

interface Garment {
  src: string;
  name: string;
  type: "outerwear" | "top" | "bottom" | "shoes";
}

interface OutfitRecommendationCardProps {
  label: string;
  garments: Garment[];
  explanation?: string;
}

export function OutfitRecommendationCard({
  label,
  garments,
  explanation,
}: OutfitRecommendationCardProps) {
  const router = useRouter();

  if (garments.length === 0) return null;

  const handleViewOutfit = () => {
    const outfitData = JSON.stringify({
      label,
      garments,
      explanation,
    });
    router.push(`/outfit?outfit=${encodeURIComponent(outfitData)}`);
  };

  return (
    <button
      onClick={handleViewOutfit}
      className="relative w-full aspect-square border border-border bg-card hover:bg-secondary/50 transition-all duration-200 group overflow-hidden text-left"
    >
      {/* Overlay composition preview - show first item or grid preview */}
      <div className="w-full h-full relative">
        {garments.length === 1 ? (
          // Single item - show it large
          <Image
            src={garments[0].src || "/placeholder.svg"}
            alt={garments[0].name}
            fill
            className="object-cover"
          />
        ) : (
          // Multiple items - show grid preview
          <div className="grid grid-cols-2 w-full h-full">
            {garments.slice(0, 4).map((garment, idx) => (
              <div
                key={idx}
                className="relative bg-secondary border-l border-t border-border"
              >
                <Image
                  src={garment.src || "/placeholder.svg"}
                  alt={garment.name}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-background/95 px-4 py-4 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
        <p className="text-[11px] uppercase tracking-widest text-foreground mb-2">
          {label}
        </p>
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-3">
          {garments.length} pieces
        </p>
        <span className="text-[10px] uppercase tracking-[0.2em] text-signal-orange">
          Click to view
        </span>
      </div>

      {/* Accent line on hover */}
      <div className="absolute top-0 left-0 w-0.5 h-full bg-signal-orange opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </button>
  );
}
