"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Id } from "@convex/_generated/dataModel";
import { animateCardHoverIn, animateCardHoverOut } from "@/lib/animations";

interface Garment {
  id?: Id<"garments">;
  src: string;
  name: string;
  type: string;
}

interface OutfitRecommendationCardProps {
  label: string;
  garments: Garment[];
  explanation?: string;
  contextMood?: string;
  contextWeather?: string;
  contextTemperature?: number;
  /** When true, card toggles selection instead of navigating; show checkbox + selected border (same UI as closet). */
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export function OutfitRecommendationCard({
  label,
  garments,
  explanation,
  contextMood,
  contextWeather,
  contextTemperature,
  isSelectMode = false,
  isSelected = false,
  onToggleSelect,
}: OutfitRecommendationCardProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLButtonElement>(null);

  if (garments.length === 0) return null;

  const handleClick = () => {
    if (isSelectMode && onToggleSelect) {
      onToggleSelect();
    } else {
      const garmentIds = garments
        .map((g) => g.id)
        .filter((id): id is Id<"garments"> => id != null);
      const outfitData = JSON.stringify({
        label,
        garments,
        explanation,
        garmentIds,
        contextMood,
        contextWeather,
        contextTemperature,
      });
      router.push(`/outfit?outfit=${encodeURIComponent(outfitData)}`);
    }
  };

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={handleClick}
      onMouseEnter={() =>
        cardRef.current && animateCardHoverIn(cardRef.current)
      }
      onMouseLeave={() =>
        cardRef.current && animateCardHoverOut(cardRef.current)
      }
      className="relative w-full aspect-square border border-border bg-card hover:bg-secondary/50 transition-colors duration-200 group overflow-hidden text-left origin-center"
      style={{ transformOrigin: "center center" }}
    >
      {/* Overlay composition preview - show first item or grid preview */}
      <div className="w-full h-full relative">
        {garments.length === 1 ? (
          // Single item - show it large
          <Image
            src={garments[0].src || "/placeholder.svg"}
            alt={garments[0].name}
            fill
            className={`object-cover ${isSelectMode && isSelected ? "brightness-75" : ""}`}
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
                  className={`object-cover ${isSelectMode && isSelected ? "brightness-75" : ""}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selection checkbox overlay - same as closet */}
      {isSelectMode && (
        <div className="absolute top-2 right-2 z-10">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-100 ${
              isSelected
                ? "bg-signal-orange border-signal-orange"
                : "bg-background/80 border-border"
            }`}
          >
            {isSelected && (
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-background"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Selected full-border highlight - same as closet */}
      {isSelectMode && isSelected && (
        <div className="absolute inset-0 border-2 border-signal-orange pointer-events-none" />
      )}

      {/* Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-background/95 px-4 py-4 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
        <p className="text-[11px] uppercase tracking-widest text-foreground mb-2">
          {label}
        </p>
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-3">
          {garments.length} pieces
        </p>
        <span className="text-[10px] uppercase tracking-[0.2em] text-signal-orange">
          {isSelectMode
            ? isSelected
              ? "Selected"
              : "Select"
            : "Click to view"}
        </span>
      </div>

      {/* Accent line on hover (only when not in select mode) */}
      {!isSelectMode && (
        <div className="absolute top-0 left-0 w-0.5 h-full bg-signal-orange opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      )}
    </button>
  );
}
