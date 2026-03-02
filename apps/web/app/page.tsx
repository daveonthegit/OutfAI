"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { OutfitRecommendationCard } from "@/components/outfit-recommendation-card";
import { useOutfitRecommendations } from "@/hooks/use-outfit-recommendations";
import { closetItemsToGarments } from "@/lib/closet-to-garment";
import type { Outfit } from "@shared/types";

// Closet items with detailed traits for better recommendations
type ClosetItemType = {
  id: string;
  src: string;
  name: string;
  category: "top" | "bottom" | "shoes" | "outerwear";
  color: string;
  traits: {
    style: string[]; // minimalist, bold, classic, trendy, avant-garde, etc.
    fit: string; // oversized, fitted, relaxed, tapered, etc.
    occasion: string[]; // casual, formal, work, weekend, night, etc.
    versatility: "high" | "medium" | "low";
    vibrancy: "muted" | "balanced" | "vibrant";
  };
};

const CLOSET_ITEMS: ClosetItemType[] = [
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

function codeToWeatherLabel(
  code: number
): "sunny" | "cloudy" | "rainy" | "snowy" | "foggy" {
  if (code === 0) return "sunny"; // clear sky

  if (code === 1) return "sunny"; // mainly clear (feels like sunny)
  if (code === 2) return "cloudy"; // partly cloudy
  if (code === 3) return "cloudy"; // overcast

  if (code === 45 || code === 48) return "foggy";

  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return "rainy";

  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snowy";

  if ([95, 96, 99].includes(code)) return "rainy"; // thunderstorm -> treat as rainy for outfits

  return "cloudy";
}

export default function Home() {
  const [isShuffling, setIsShuffling] = useState(false);
  const [mood, setMood] = useState<any>("bold");
  const [weather, setWeather] = useState<any>(null);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [allRecommendedOutfits, setAllRecommendedOutfits] = useState<any[]>([]);
  const [recommendedOutfit, setRecommendedOutfit] = useState<any[]>([]);
  const [tempUnit, setTempUnit] = useState<"F" | "C">("F");
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  const { outfits, loading, generate } = useOutfitRecommendations({
    userId: "default-user",
    mood,
    weather: weather ?? "cloudy",
    temperature: temperature ?? 12,
    // Fetch a larger pool of high-quality outfits; we'll show 6 at a time
    limitCount: 30,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { latitude, longitude } = coords;

          const url =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}&longitude=${longitude}` +
            `&current=temperature_2m,weather_code` +
            `&temperature_unit=${tempUnit === "F" ? "fahrenheit" : "celsius"}`;

          console.log("Weather API URL:", url);
          const res = await fetch(url);
          if (!res.ok)
            throw new Error(`Weather request failed (${res.status})`);
          const data = await res.json();

          const temp = data?.current?.temperature_2m;
          const code = data?.current?.weather_code;

          setLastFetched(new Date().toISOString());

          if (typeof temp === "number") setTemperature(Math.round(temp));
          if (typeof code === "number") setWeather(codeToWeatherLabel(code));

          setLocationError(null);
        } catch (e: any) {
          setLocationError(e?.message ?? "Failed to fetch weather.");
        }
      },
      (err) => {
        setLocationError(err.message || "Location permission denied.");
      }
    );
  }, [tempUnit]);

  // Generate recommendations on mount
  useEffect(() => {
    const generateRecommendations = async () => {
      const garments = closetItemsToGarments(CLOSET_ITEMS, "default-user");

      await generate({
        garments,
        mood,
        weather: weather ?? "cloudy",
        temperature: temperature ?? 12,
        // Fetch a larger pool of high-quality outfits
        limitCount: 30,
      });
    };

    generateRecommendations();
  }, [mood, weather]);

  // Update displayed outfit when recommendations change
  useEffect(() => {
    if (outfits && outfits.length > 0) {
      const convertedOutfits = outfits.map((outfit, index) => ({
        label: `Option ${index + 1}`,
        garments: outfit.garmentIds
          .map((id) => {
            const item = CLOSET_ITEMS.find((i) => i.id === id);
            if (!item) return null;
            return {
              id: item.id,
              src: item.src,
              name: item.name,
              category: item.category,
              type:
                item.category === "outerwear"
                  ? "outerwear"
                  : item.category === "top"
                    ? "top"
                    : item.category === "bottom"
                      ? "bottom"
                      : "shoes",
              color: item.color,
              traits: item.traits,
            };
          })
          .filter(Boolean),
        explanation: outfit.explanation,
      }));
      // Store full pool and show top 6 by default
      setAllRecommendedOutfits(convertedOutfits);
      setRecommendedOutfit(convertedOutfits.slice(0, 6));
    }
  }, [outfits]);

  const handleShuffle = () => {
    setIsShuffling(true);
    setTimeout(() => setIsShuffling(false), 150);

    // Pick a random 6 from the full pool that already passed the threshold
    setRecommendedOutfit(() => {
      if (!allRecommendedOutfits || allRecommendedOutfits.length === 0) {
        return allRecommendedOutfits;
      }

      // If 6 or fewer, just shuffle them
      if (allRecommendedOutfits.length <= 6) {
        const shuffled = [...allRecommendedOutfits];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      }

      // Otherwise sample 6 unique random outfits from the pool
      const indices = Array.from(
        { length: allRecommendedOutfits.length },
        (_, i) => i
      );
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      const selected = indices
        .slice(0, 6)
        .map((idx) => allRecommendedOutfits[idx]);
      return selected;
    });
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-signal-orange selection:text-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-5 md:px-8 lg:px-12">
          <h1 className="text-base md:text-lg tracking-tight font-medium">
            OutfAI
          </h1>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-acid-lime" />
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              Active
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="pt-24 md:pt-32 px-4 md:px-8 lg:px-12 pb-28">
        {/* Hero Typography */}
        <section className="mb-16 md:mb-24 lg:mb-32">
          <div className="max-w-4xl">
            {/* Weather context - small, peripheral */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-muted-foreground mb-6 md:mb-8 backdrop-blur">
              <span
                className={`h-1.5 w-1.5 rounded-full ${locationError ? "bg-destructive" : "bg-acid-lime"}`}
              />
              {locationError ? (
                <>
                  <span className="text-foreground/80">Location off</span>
                  <span className="opacity-40">·</span>
                  <span className="normal-case tracking-normal text-muted-foreground">
                    ENABLE LOCATION, THEN REFRESH
                  </span>
                </>
              ) : (
                <>
                  <span className="text-foreground/80">
                    {temperature === null ? "--" : temperature}°{tempUnit}
                  </span>
                  <span className="opacity-40">·</span>
                  <span className="text-foreground/80">
                    {weather === null
                      ? "Loading…"
                      : weather === "sunny"
                        ? "Sunny"
                        : weather === "cloudy"
                          ? "Cloudy"
                          : weather === "rainy"
                            ? "Rainy"
                            : weather === "snowy"
                              ? "Snowy"
                              : "Foggy"}
                  </span>
                  {lastFetched && (
                    <>
                      <span className="opacity-40">·</span>
                      <span className="text-muted-foreground">
                        Updated{" "}
                        {new Date(lastFetched).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setTempUnit((u) => (u === "F" ? "C" : "F"))}
                    className="ml-2 rounded-full border border-border/60 px-2 py-0.5 text-[9px] uppercase tracking-[0.28em] text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                  >
                    {tempUnit === "F" ? "°C" : "°F"}
                  </button>
                </>
              )}
            </div>
            {/* Mood line - oversized editorial */}
            <h2 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl italic text-foreground leading-[0.9] tracking-tight mb-0">
              today feels
            </h2>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl italic text-signal-orange leading-[0.9] tracking-tight">
              {mood}
            </h2>
          </div>
        </section>

        {/* Mood Selector */}
        <section className="mb-16 md:mb-24">
          <div className="space-y-6">
            {/* Mood Selection */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
                Select Mood
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "casual",
                  "formal",
                  "adventurous",
                  "cozy",
                  "energetic",
                  "minimalist",
                  "bold",
                ].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] border transition-all duration-100 cursor-pointer ${
                      mood === m
                        ? "bg-signal-orange text-background border-signal-orange"
                        : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Weather Selection removed per user request */}
          </div>
        </section>

        {/* Editorial divider */}
        <div className="flex items-center gap-6 mb-12 md:mb-16">
          <div className="h-px bg-border flex-1" />
          <span className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
            {loading ? "Generating..." : `${recommendedOutfit.length} Options`}
          </span>
          <div className="h-px bg-border flex-1" />
        </div>

        {/* Recommendation Grid */}
        <section className="mb-16 md:mb-24">
          {recommendedOutfit && recommendedOutfit.length > 0 ? (
            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 transition-opacity duration-100 ${
                isShuffling ? "opacity-30" : "opacity-100"
              }`}
            >
              {recommendedOutfit.map(
                (outfit, index) =>
                  outfit.garments.length > 0 && (
                    <OutfitRecommendationCard
                      key={index}
                      label={outfit.label}
                      garments={outfit.garments}
                      explanation={outfit.explanation}
                    />
                  )
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-[11px] uppercase tracking-[0.2em]">
              {loading
                ? "Generating recommendations..."
                : "No recommendations available"}
            </div>
          )}
        </section>

        {/* Actions - Typographic, subtle */}
        <section className="flex items-center justify-center gap-8 md:gap-12 mb-20 md:mb-28">
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

          <div className="w-px h-4 bg-border" />

          <button
            onClick={handleShuffle}
            disabled={loading}
            className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors duration-100 group flex items-center gap-2 disabled:opacity-50"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="transition-transform duration-100 group-hover:rotate-180"
            >
              <polyline points="16 3 21 3 21 8" />
              <line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" />
              <line x1="15" y1="15" x2="21" y2="21" />
              <line x1="4" y1="4" x2="9" y2="9" />
            </svg>
            Shuffle
          </button>
        </section>

        {/* Explanation Entry Point */}
        <section className="border-t border-border pt-10 md:pt-14">
          <Link
            href="/explain"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-100 group"
          >
            Why this works
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
