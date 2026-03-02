"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";
import { useRequireAuth } from "@/hooks/use-require-auth";

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
  garments: Array<{
    _id: Id<"garments">;
    name: string;
    category: string;
    primaryColor: string;
    imageUrl?: string;
  } | null>;
}

export default function ArchivePage() {
  useRequireAuth("/archive");

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const outfits = useQuery(api.outfits.list) as
    | OutfitWithGarments[]
    | undefined;
  const removeOutfit = useMutation(api.outfits.remove);

  const handleRemove = async (id: Id<"outfits">, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await removeOutfit({ id });
  };

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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {outfits.map((outfit) => (
              <div
                key={outfit._id}
                className="group block relative"
                onMouseEnter={() => setHoveredId(outfit._id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  opacity:
                    hoveredId !== null && hoveredId !== outfit._id ? 0.5 : 1,
                  transition: "opacity 100ms",
                }}
              >
                {/* Compact composition stack */}
                <div className="flex flex-col gap-[1px] mb-4">
                  {outfit.garments
                    .filter(Boolean)
                    .slice(0, 3)
                    .map((garment, idx) =>
                      garment ? (
                        <div
                          key={idx}
                          className="relative border border-border bg-card overflow-hidden"
                        >
                          <div className="aspect-[3/2] relative bg-secondary">
                            {garment.imageUrl ? (
                              <Image
                                src={garment.imageUrl}
                                alt={garment.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                                  {garment.category}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null
                    )}
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {formatDistanceToNow(new Date(outfit.savedAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground group-hover:text-signal-orange transition-colors duration-100">
                    {outfit.contextMood ?? "—"}
                  </span>
                </div>

                {/* Remove button */}
                {hoveredId === outfit._id && (
                  <button
                    onClick={(e) => handleRemove(outfit._id, e)}
                    className="absolute top-2 right-2 p-1.5 bg-background/80 border border-border hover:border-destructive hover:text-destructive transition-colors text-[9px] uppercase tracking-widest"
                  >
                    Remove
                  </button>
                )}

                {/* Hover indicator line */}
                <div
                  className="h-[2px] mt-3 bg-signal-orange transition-all duration-100"
                  style={{
                    width: hoveredId === outfit._id ? "100%" : "0%",
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
