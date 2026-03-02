"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { UserAvatar } from "@/components/user-avatar";

type Category = "all" | "top" | "bottom" | "shoes" | "outerwear" | "accessory";

interface ConvexGarment {
  _id: Id<"garments">;
  _creationTime: number;
  userId: string;
  name: string;
  category: string;
  primaryColor: string;
  tags: string[];
  style?: string[];
  fit?: string;
  occasion?: string[];
  versatility?: string;
  vibrancy?: string;
  imageUrl?: string;
}

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "all", label: "All" },
  { key: "top", label: "Top" },
  { key: "bottom", label: "Bottom" },
  { key: "shoes", label: "Shoes" },
  { key: "outerwear", label: "Outerwear" },
  { key: "accessory", label: "Accessory" },
];

export default function ClosetPage() {
  useRequireAuth("/closet");

  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedGarment, setSelectedGarment] = useState<ConvexGarment | null>(
    null
  );

  const garments = useQuery(api.garments.list) ?? [];

  const filteredItems =
    activeCategory === "all"
      ? garments
      : garments.filter(
          (item: ConvexGarment) => item.category === activeCategory
        );

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
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-foreground">
                Closet
              </span>
              <Link
                href="/archive"
                className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-100"
              >
                Archive
              </Link>
            </nav>
            <UserAvatar />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="pt-24 md:pt-32 px-4 md:px-8 lg:px-12 pb-28">
        {/* Title */}
        <section className="mb-12 md:mb-16">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl italic text-foreground leading-[0.9] tracking-tight mb-3">
            closet
          </h1>
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            What you already own
          </p>
        </section>

        {/* Filter chips */}
        <section className="mb-10 md:mb-14">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] border transition-all duration-100 ${
                  activeCategory === cat.key
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Garment Grid */}
        <section className="mb-16">
          {garments === undefined ? (
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Loading…
            </p>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
                No garments yet
              </p>
              <Link
                href="/add"
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-foreground hover:text-signal-orange transition-colors duration-100"
              >
                Add your first piece
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
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0.5">
              {filteredItems.map((item: ConvexGarment) => (
                <div
                  key={item._id}
                  className="relative border border-border bg-card transition-all duration-100 cursor-pointer"
                  style={{
                    opacity:
                      hoveredId !== null && hoveredId !== item._id ? 0.5 : 1,
                  }}
                  onMouseEnter={() => setHoveredId(item._id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setSelectedGarment(item)}
                >
                  {/* Image */}
                  <div className="aspect-square relative bg-secondary">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                          {item.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info overlay on hover */}
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-background/95 px-3 py-3 transition-all duration-100"
                    style={{
                      transform:
                        hoveredId === item._id
                          ? "translateY(0)"
                          : "translateY(100%)",
                    }}
                  >
                    <p className="text-[11px] uppercase tracking-widest text-foreground mb-1">
                      {item.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                        {item.category}
                      </span>
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                        {item.primaryColor}
                      </span>
                    </div>
                  </div>

                  {/* Accent line */}
                  <div
                    className="absolute top-0 left-0 w-0.5 h-full transition-colors duration-100"
                    style={{
                      backgroundColor:
                        hoveredId === item._id
                          ? "var(--signal-orange)"
                          : "transparent",
                    }}
                  />
                </div>
              ))}
            </div>
          )}
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
                {selectedGarment.imageUrl ? (
                  <Image
                    src={selectedGarment.imageUrl}
                    alt={selectedGarment.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                      No image
                    </span>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-medium mb-2">
                {selectedGarment.name}
              </h3>
              <p className="text-[11px] text-muted-foreground mb-2">
                Category: {selectedGarment.category}
              </p>
              <p className="text-[11px] text-muted-foreground mb-3">
                Color: {selectedGarment.primaryColor}
              </p>
              {(selectedGarment.style ||
                selectedGarment.fit ||
                selectedGarment.occasion) && (
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    Traits
                  </p>
                  <ul className="text-[11px] space-y-1">
                    {selectedGarment.style && (
                      <li>
                        <strong>Style:</strong>{" "}
                        {selectedGarment.style.join(", ")}
                      </li>
                    )}
                    {selectedGarment.fit && (
                      <li>
                        <strong>Fit:</strong> {selectedGarment.fit}
                      </li>
                    )}
                    {selectedGarment.occasion && (
                      <li>
                        <strong>Occasion:</strong>{" "}
                        {selectedGarment.occasion.join(", ")}
                      </li>
                    )}
                    {selectedGarment.versatility && (
                      <li>
                        <strong>Versatility:</strong>{" "}
                        {selectedGarment.versatility}
                      </li>
                    )}
                    {selectedGarment.vibrancy && (
                      <li>
                        <strong>Vibrancy:</strong> {selectedGarment.vibrancy}
                      </li>
                    )}
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

        {/* Add garment action */}
        <section className="border-t border-border pt-10">
          <Link
            href="/add"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-100 group"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add garment
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
