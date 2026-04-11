"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Id } from "@convex/_generated/dataModel";
import { getCardHoverMotionProps } from "@/lib/animations";
import type { ScoreBreakdown } from "@shared/types";

interface Garment {
  id?: Id<"garments">;
  src: string;
  name: string;
  type: string;
}

const BREAKDOWN_MAX: Record<keyof ScoreBreakdown, number> = {
  base: 50,
  colorHarmony: 20,
  moodAlignment: 20,
  styleCoherence: 15,
  occasionMatching: 12,
  versatility: 8,
  fit: 8,
  vibrancy: 8,
  diversity: 10,
  preferences: 15,
  repetitionPenalty: 10,
};

const BREAKDOWN_LABELS: Record<keyof ScoreBreakdown, string> = {
  base: "Foundation",
  colorHarmony: "Colors work together",
  moodAlignment: "Matches your mood",
  styleCoherence: "Style cohesion",
  occasionMatching: "Fits the occasion",
  versatility: "Easy to restyle",
  fit: "Proportion & fit",
  vibrancy: "Color energy",
  diversity: "Variety of pieces",
  preferences: "Matches your taste",
  repetitionPenalty: "Freshness",
};

interface OutfitRecommendationCardProps {
  label: string;
  garments: Garment[];
  explanation?: string;
  contextMood?: string;
  contextWeather?: string;
  contextTemperature?: number;
  /** Per-category score breakdown (Phase 1). When set, show "See why" expandable. */
  scoreBreakdown?: ScoreBreakdown;
  /** When true, card toggles selection instead of navigating; show checkbox + selected border (same UI as closet). */
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  /** When provided, show Skip button; on click log "skipped" and hide card (caller handles state). */
  onSkip?: () => void;
  /** When provided (and not in select mode), show a Save button; on click caller saves this outfit. */
  onSave?: () => void;
  /** When true, Save was just used for this card (e.g. show "Saved" state). */
  isSaving?: boolean;
  /** When set, called instead of pushing JSON in the URL (stable preview id flow). */
  onNavigateToDetail?: () => void | Promise<void>;
}

export function OutfitRecommendationCard({
  label,
  garments,
  explanation,
  contextMood,
  contextWeather,
  contextTemperature,
  scoreBreakdown,
  isSelectMode = false,
  isSelected = false,
  onToggleSelect,
  onSkip,
  onSave,
  isSaving = false,
  onNavigateToDetail,
}: OutfitRecommendationCardProps) {
  const router = useRouter();
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [breakdownExpanded, setBreakdownExpanded] = useState(false);
  const cardMotionProps = getCardHoverMotionProps();
  const cardRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts: S = save, X = skip (when card is focused)
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target !== el && !el.contains(e.target as Node)) return;
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        onSave?.();
      }
      if (e.key === "x" || e.key === "X") {
        e.preventDefault();
        onSkip?.();
      }
    };
    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  }, [onSave, onSkip]);

  if (garments.length === 0) return null;

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSave?.();
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSkip?.();
  };

  const handleSeeWhy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBreakdownOpen((prev) => !prev);
  };

  const handleClick = () => {
    if (isSelectMode && onToggleSelect) {
      onToggleSelect();
    } else if (onNavigateToDetail) {
      void onNavigateToDetail();
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
      router.push(
        `/outfit?outfit=${encodeURIComponent(outfitData)}&source=today`
      );
    }
  };

  return (
    <motion.div
      {...cardMotionProps}
      ref={cardRef}
      tabIndex={0}
      className="relative w-full aspect-square border border-[var(--glass-border-strong)] bg-card/90 shadow-[var(--glass-shadow)] backdrop-blur-[10px] hover:bg-secondary/40 transition-colors duration-100 group overflow-hidden text-left origin-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-1"
      style={{
        transformOrigin: "center center",
        ...(cardMotionProps.style as React.CSSProperties),
      }}
    >
      <button
        type="button"
        onClick={handleClick}
        className="absolute inset-0 w-full h-full flex flex-col text-left cursor-pointer"
      >
        {/* Overlay composition preview - show first item or grid preview */}
        <div className="w-full h-full relative flex-1 min-h-0">
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
      </button>

      {/* Skip + Save - when not in select mode (outside main button to avoid nested buttons) */}
      {!isSelectMode && (onSkip || onSave) && (
        <div className="absolute top-2 left-2 right-2 z-10 flex justify-between gap-2">
          {onSkip && (
            <button
              type="button"
              onClick={handleSkip}
              className="p-1.5 glass-bar border-border hover:border-foreground hover:text-foreground transition-colors text-[9px] uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-1 focus-visible:outline-none rounded-sm"
              aria-label="Skip this outfit"
            >
              Skip
            </button>
          )}
          {onSave && (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="p-1.5 glass-bar border-signal-orange/60 text-signal-orange hover:bg-signal-orange/10 transition-colors text-[9px] uppercase tracking-widest disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-1 focus-visible:outline-none ml-auto rounded-sm"
              aria-label={isSaving ? "Saving…" : "Save this outfit"}
            >
              {isSaving ? "Saving…" : "Save"}
            </button>
          )}
        </div>
      )}

      {/* Selection checkbox overlay - same as closet */}
      {isSelectMode && (
        <div className="absolute top-2 right-2 z-10">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-100 ${
              isSelected
                ? "bg-signal-orange border-signal-orange"
                : "glass-bar border-border rounded-full"
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

      {/* Info overlay + "See why" in one block so they don't overlap */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-100 motion-reduce:transition-none glass-bar !border-x-0 !border-b-0 rounded-none px-4 py-4">
        <div className="pointer-events-none">
          <p className="text-[11px] uppercase tracking-widest text-foreground mb-2">
            {label}
          </p>
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-3">
            {garments.length} pieces
          </p>
        </div>
        {isSelectMode ? (
          <span className="text-[10px] uppercase tracking-[0.2em] text-signal-orange pointer-events-none">
            {isSelected ? "Selected" : "Select"}
          </span>
        ) : (
          <div className="flex flex-wrap items-center gap-2 mt-0.5">
            <button
              type="button"
              onClick={handleClick}
              className="text-[10px] uppercase tracking-[0.2em] text-signal-orange hover:underline cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2 focus-visible:ring-offset-background/95 rounded-sm"
              aria-label="View this outfit"
            >
              Click to view
            </button>
          </div>
        )}
        {scoreBreakdown && (
          <div className="mt-3 flex flex-col items-stretch">
            <button
              type="button"
              onClick={handleSeeWhy}
              className="pointer-events-auto self-start px-2 py-1 text-[9px] uppercase tracking-widest text-muted-foreground hover:text-signal-orange border border-[var(--glass-border-strong)] hover:border-signal-orange/50 glass-panel transition-colors rounded-sm"
              aria-expanded={breakdownOpen}
            >
              {breakdownOpen ? "Hide why" : "See why"}
            </button>
            {breakdownOpen && (
              <div className="pointer-events-auto mt-2 glass-panel rounded-sm px-3 py-2 space-y-1.5">
                {(() => {
                  const entries = (
                    Object.keys(BREAKDOWN_LABELS) as (keyof ScoreBreakdown)[]
                  )
                    .filter((k) => k !== "base" && k !== "repetitionPenalty")
                    .sort((a, b) => {
                      const pctA =
                        BREAKDOWN_MAX[a] > 0
                          ? scoreBreakdown[a] / BREAKDOWN_MAX[a]
                          : 0;
                      const pctB =
                        BREAKDOWN_MAX[b] > 0
                          ? scoreBreakdown[b] / BREAKDOWN_MAX[b]
                          : 0;
                      return pctB - pctA;
                    });
                  const visible = breakdownExpanded
                    ? entries
                    : entries.slice(0, 3);
                  return (
                    <>
                      {visible.map((key) => {
                        const value = scoreBreakdown[key];
                        const max = BREAKDOWN_MAX[key];
                        const pct =
                          max > 0 ? Math.min(100, (value / max) * 100) : 0;
                        return (
                          <div
                            key={key}
                            className="flex items-center gap-2 text-[9px]"
                          >
                            <span className="text-muted-foreground w-28 shrink-0 leading-tight">
                              {BREAKDOWN_LABELS[key]}
                            </span>
                            <div className="flex-1 h-1 bg-secondary overflow-hidden">
                              <div
                                className="h-full bg-signal-orange/80 transition-all"
                                style={{ width: `${Math.max(0, pct)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      {entries.length > 3 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBreakdownExpanded((p) => !p);
                          }}
                          className="text-[9px] text-muted-foreground hover:text-foreground transition-colors mt-0.5"
                        >
                          {breakdownExpanded
                            ? "Show less"
                            : `+${entries.length - 3} more`}
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
