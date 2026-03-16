"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { getStaggerVariants, getCardHoverMotionProps } from "@/lib/animations";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";
import { useRequireAuth } from "@/hooks/use-require-auth";

const GARMENT_CATEGORY_ORDER = [
  "top",
  "outerwear",
  "bottom",
  "shoes",
  "accessory",
] as const;

function sortGarmentsByCategory<T extends { category: string }>(
  garments: T[]
): T[] {
  const rank = (c: string) => {
    const i = GARMENT_CATEGORY_ORDER.indexOf(
      c as (typeof GARMENT_CATEGORY_ORDER)[number]
    );
    return i === -1 ? GARMENT_CATEGORY_ORDER.length : i;
  };
  return [...garments].sort((a, b) => rank(a.category) - rank(b.category));
}

interface ArchiveGarment {
  _id: Id<"garments">;
  name: string;
  category: string;
  primaryColor: string;
  imageUrl?: string;
}

interface OutfitWithGarments {
  _id: Id<"outfits">;
  _creationTime: number;
  userId: string;
  garmentIds: Id<"garments">[];
  contextMood?: string;
  contextWeather?: string;
  contextTemperature?: number;
  explanation?: string;
  savedAt: number;
  garments: Array<ArchiveGarment | null>;
}

export default function ArchivePage() {
  useRequireAuth("/archive");
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const staggerVariants = getStaggerVariants();
  const cardHoverProps = getCardHoverMotionProps();
  const outfits = useQuery(api.outfits.list) as
    | OutfitWithGarments[]
    | undefined;
  const removeOutfit = useMutation(api.outfits.remove);
  const logRecommendation = useMutation(api.recommendationLogs.log);

  const handleRemove = async (id: Id<"outfits">, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await removeOutfit({ id });
  };

  const handleWoreThis = async (
    outfit: OutfitWithGarments,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    await logRecommendation({
      action: "worn",
      outfitId: outfit._id,
      garmentIds: outfit.garmentIds.map(String),
      mood: outfit.contextMood,
      weather: outfit.contextWeather,
    }).catch(console.error);
  };

  const handleViewOutfit = (outfit: OutfitWithGarments) => {
    const sorted = sortGarmentsByCategory(
      outfit.garments.filter(Boolean) as ArchiveGarment[]
    );
    const garments = sorted.map((g) => ({
      id: g._id,
      src: g.imageUrl ?? "",
      name: g.name,
      type: g.category,
    }));
    const outfitData = JSON.stringify({
      label: `Saved ${formatDistanceToNow(new Date(outfit.savedAt), { addSuffix: true })}`,
      garments,
      explanation: outfit.explanation,
      garmentIds: outfit.garmentIds,
      contextMood: outfit.contextMood,
      contextWeather: outfit.contextWeather,
      contextTemperature: outfit.contextTemperature,
    });
    router.push(`/outfit?outfit=${encodeURIComponent(outfitData)}`);
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-signal-orange selection:text-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-12">
          <Link
            href="/"
            className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium hover:text-signal-orange transition-colors duration-100"
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

        {outfits === undefined ? (
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Loading…
          </p>
        ) : outfits.length === 0 ? (
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
        ) : (
          <motion.div
            ref={gridRef}
            variants={staggerVariants.container}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
          >
            {outfits.map((outfit) => {
              const sortedGarments = sortGarmentsByCategory(
                outfit.garments.filter(Boolean) as ArchiveGarment[]
              );
              const isHovered = hoveredId === outfit._id;
              return (
                <motion.div
                  key={outfit._id}
                  variants={staggerVariants.item}
                  {...cardHoverProps}
                  className="group relative w-full aspect-square border border-border bg-card hover:bg-secondary/50 transition-all duration-200 overflow-hidden text-left origin-center"
                  onMouseEnter={() => setHoveredId(outfit._id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    opacity: hoveredId !== null && !isHovered ? 0.5 : 1,
                    transition: "opacity 100ms",
                    ...(cardHoverProps.style as React.CSSProperties),
                  }}
                >
                  {/* I wore this + Remove - same z as overlay */}
                  {isHovered && (
                    <div className="absolute top-2 right-2 left-2 z-20 flex justify-between gap-2">
                      <button
                        onClick={(e) => handleWoreThis(outfit, e)}
                        className="p-1.5 bg-background/80 border border-border hover:border-signal-orange hover:text-signal-orange transition-colors text-[9px] uppercase tracking-widest"
                      >
                        I wore this
                      </button>
                      <button
                        onClick={(e) => handleRemove(outfit._id, e)}
                        className="p-1.5 bg-background/80 border border-border hover:border-destructive hover:text-destructive transition-colors text-[9px] uppercase tracking-widest"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Clickable area: same square layout as recommendation options */}
                  <button
                    type="button"
                    className="absolute inset-0 w-full h-full flex flex-col"
                    onClick={() => handleViewOutfit(outfit)}
                  >
                    <div className="w-full h-full relative flex-1 min-h-0">
                      {sortedGarments.length === 1 ? (
                        <div className="absolute inset-0 relative">
                          {sortedGarments[0].imageUrl ? (
                            <Image
                              src={sortedGarments[0].imageUrl}
                              alt={sortedGarments[0].name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-secondary flex items-center justify-center">
                              <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                                {sortedGarments[0].category}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 w-full h-full absolute inset-0">
                          {sortedGarments.slice(0, 4).map((garment, idx) => (
                            <div
                              key={garment._id}
                              className="relative bg-secondary border-l border-t border-border"
                            >
                              {garment.imageUrl ? (
                                <Image
                                  src={garment.imageUrl}
                                  alt={garment.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                                    {garment.category}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Same hover overlay as recommendation cards */}
                    <div className="absolute bottom-0 left-0 right-0 bg-background/95 px-4 py-4 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                      <p className="text-[11px] uppercase tracking-widest text-foreground mb-2">
                        Saved{" "}
                        {formatDistanceToNow(new Date(outfit.savedAt), {
                          addSuffix: true,
                        })}
                      </p>
                      <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-3">
                        {sortedGarments.length} pieces
                      </p>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-signal-orange">
                        Click to view
                      </span>
                    </div>
                  </button>

                  {/* Accent line on hover - same as options */}
                  <div className="absolute top-0 left-0 w-0.5 h-full bg-signal-orange opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </main>
  );
}
