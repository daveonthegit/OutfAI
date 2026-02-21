"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Category = "all" | "top" | "bottom" | "shoes" | "outerwear";

interface Garment {
  id: string;
  src: string;
  name: string;
  category: "top" | "bottom" | "shoes" | "outerwear";
  color: string;
  traits?: {
    style?: string[];
    fit?: string;
    occasion?: string[];
    versatility?: "high" | "medium" | "low";
    vibrancy?: "muted" | "balanced" | "vibrant";
  };
}

const CLOSET_ITEMS: Garment[] = [
  {
    id: "1",
    src: "/garments/look-a-top.jpg",
    name: "Oversized wool coat",
    category: "outerwear",
    color: "Black",
    traits: {
      style: ["bold", "classic", "minimalist"],
      fit: "oversized",
      occasion: ["casual", "smart-casual", "night"],
      versatility: "high",
      vibrancy: "muted",
    },
  },
  {
    id: "2",
    src: "/garments/look-b-top.jpg",
    name: "Deconstructed blazer",
    category: "top",
    color: "Cream",
    traits: {
      style: ["bold", "avant-garde", "trendy"],
      fit: "relaxed",
      occasion: ["smart-casual", "work", "night"],
      versatility: "medium",
      vibrancy: "balanced",
    },
  },
  {
    id: "3",
    src: "/garments/shirt-white.jpg",
    name: "Cotton oxford",
    category: "top",
    color: "White",
    traits: {
      style: ["classic", "minimalist"],
      fit: "fitted",
      occasion: ["casual", "work", "smart-casual"],
      versatility: "high",
      vibrancy: "muted",
    },
  },
  {
    id: "4",
    src: "/garments/sweater-grey.jpg",
    name: "Cashmere crewneck",
    category: "top",
    color: "Grey",
    traits: {
      style: ["minimalist", "classic"],
      fit: "fitted",
      occasion: ["casual", "smart-casual"],
      versatility: "high",
      vibrancy: "muted",
    },
  },
  {
    id: "5",
    src: "/garments/jacket-black.jpg",
    name: "Bomber jacket",
    category: "outerwear",
    color: "Black",
    traits: {
      style: ["bold", "trendy"],
      fit: "fitted",
      occasion: ["casual", "weekend"],
      versatility: "high",
      vibrancy: "muted",
    },
  },
  {
    id: "6",
    src: "/garments/look-a-bottom.jpg",
    name: "Wide-leg trousers",
    category: "bottom",
    color: "Charcoal",
    traits: {
      style: ["bold", "classic"],
      fit: "oversized",
      occasion: ["smart-casual", "work", "night"],
      versatility: "medium",
      vibrancy: "muted",
    },
  },
  {
    id: "7",
    src: "/garments/look-b-bottom.jpg",
    name: "Tailored trousers",
    category: "bottom",
    color: "Black",
    traits: {
      style: ["minimalist", "classic"],
      fit: "tapered",
      occasion: ["formal", "work", "smart-casual"],
      versatility: "high",
      vibrancy: "muted",
    },
  },
  {
    id: "8",
    src: "/garments/pants-black.jpg",
    name: "Dress pants",
    category: "bottom",
    color: "Black",
    traits: {
      style: ["classic", "minimalist"],
      fit: "fitted",
      occasion: ["formal", "work"],
      versatility: "high",
      vibrancy: "muted",
    },
  },
  {
    id: "9",
    src: "/garments/jeans-indigo.jpg",
    name: "Selvedge denim",
    category: "bottom",
    color: "Indigo",
    traits: {
      style: ["classic", "casual"],
      fit: "fitted",
      occasion: ["casual", "weekend"],
      versatility: "high",
      vibrancy: "vibrant",
    },
  },
  {
    id: "10",
    src: "/garments/look-a-shoes.jpg",
    name: "Chelsea boots",
    category: "shoes",
    color: "Black",
    traits: {
      style: ["classic", "bold"],
      fit: "fitted",
      occasion: ["smart-casual", "formal", "night"],
      versatility: "high",
      vibrancy: "muted",
    },
  },
  {
    id: "11",
    src: "/garments/look-b-shoes.jpg",
    name: "Platform sneakers",
    category: "shoes",
    color: "White",
    traits: {
      style: ["trendy", "bold"],
      fit: "fitted",
      occasion: ["casual", "weekend"],
      versatility: "high",
      vibrancy: "balanced",
    },
  },
  {
    id: "12",
    src: "/garments/loafers-brown.jpg",
    name: "Penny loafers",
    category: "shoes",
    color: "Brown",
    traits: {
      style: ["classic"],
      fit: "fitted",
      occasion: ["smart-casual", "work"],
      versatility: "high",
      vibrancy: "balanced",
    },
  },
];

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "all", label: "All" },
  { key: "top", label: "Top" },
  { key: "bottom", label: "Bottom" },
  { key: "shoes", label: "Shoes" },
  { key: "outerwear", label: "Outerwear" },
];

export default function ClosetPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedGarment, setSelectedGarment] = useState<any | null>(null);

  const filteredItems =
    activeCategory === "all"
      ? CLOSET_ITEMS
      : CLOSET_ITEMS.filter((item) => item.category === activeCategory);

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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0.5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="relative border border-border bg-card transition-all duration-100 cursor-pointer"
                style={{
                  opacity:
                    hoveredId !== null && hoveredId !== item.id ? 0.5 : 1,
                }}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setSelectedGarment(item)}
              >
                {/* Image */}
                <div className="aspect-square relative bg-secondary">
                  <Image
                    src={item.src || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info overlay on hover */}
                <div
                  className="absolute bottom-0 left-0 right-0 bg-background/95 px-3 py-3 transition-all duration-100"
                  style={{
                    transform:
                      hoveredId === item.id
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
                      {item.color}
                    </span>
                  </div>
                </div>

                {/* Accent line */}
                <div
                  className="absolute top-0 left-0 w-0.5 h-full transition-colors duration-100"
                  style={{
                    backgroundColor:
                      hoveredId === item.id
                        ? "var(--signal-orange)"
                        : "transparent",
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Garment detail modal for closet items */}
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
              <h3 className="text-lg font-medium mb-2">{selectedGarment.name}</h3>
              <p className="text-[11px] text-muted-foreground mb-2">Category: {selectedGarment.category}</p>
              <p className="text-[11px] text-muted-foreground mb-3">Color: {selectedGarment.color}</p>
              {selectedGarment.traits ? (
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Traits</p>
                  <ul className="text-[11px]">
                    <li><strong>Style:</strong> {Array.isArray(selectedGarment.traits.style) ? selectedGarment.traits.style.join(", ") : selectedGarment.traits.style}</li>
                    <li><strong>Fit:</strong> {selectedGarment.traits.fit}</li>
                    <li><strong>Occasion:</strong> {Array.isArray(selectedGarment.traits.occasion) ? selectedGarment.traits.occasion.join(", ") : selectedGarment.traits.occasion}</li>
                    <li><strong>Versatility:</strong> {selectedGarment.traits.versatility}</li>
                    <li><strong>Vibrancy:</strong> {selectedGarment.traits.vibrancy}</li>
                  </ul>
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground mb-4">No traits available for this item.</p>
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
