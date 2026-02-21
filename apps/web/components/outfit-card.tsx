"use client";

import Image from "next/image";
import { useState } from "react";

interface OutfitCardProps {
  imageSrc: string;
  label: string;
  items: string[];
}

export function OutfitCard({ imageSrc, label, items }: OutfitCardProps) {
  const [saved, setSaved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative border border-border bg-card transition-all duration-150"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Label tag */}
      <div className="absolute top-3 left-3 z-10">
        <span className="bg-foreground text-background px-2 py-1 text-[10px] uppercase tracking-widest font-medium">
          {label}
        </span>
      </div>

      {/* Image container */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt="Outfit"
          fill
          className={`object-cover transition-transform duration-300 ${isHovered ? "scale-[1.02]" : "scale-100"}`}
          sizes="(max-width: 768px) 50vw, 33vw"
        />
      </div>

      {/* Item list - reveals on hover */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-background/95 p-3 transition-all duration-150 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
      >
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li
              key={i}
              className="text-[11px] uppercase tracking-wide text-muted-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Save action */}
      <button
        onClick={() => setSaved(!saved)}
        className={`absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center border transition-all duration-150 ${
          saved
            ? "bg-signal-orange border-signal-orange text-background"
            : "bg-background/80 border-border text-foreground hover:border-foreground"
        }`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>
  );
}
