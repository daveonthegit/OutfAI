"use client";

import Link from "next/link";
import { OutfitRecommendationCard } from "@/components/outfit-recommendation-card";
import { BrutalistButton } from "@/components/brutalist-button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DisplayOutfit } from "@/components/home/authenticated-home";
import type { Mood } from "@shared/types";

export function OutfitIdeasTripSection({
  mood,
  onMoodChange,
  onGenerate,
  loading,
  error,
  displayOutfits,
  tripDates,
  onSaveLook,
  onAssignToDay,
  generateDisabled,
}: {
  mood: Mood;
  onMoodChange: (m: Mood) => void;
  onGenerate: () => void;
  loading: boolean;
  error: string | null;
  displayOutfits: DisplayOutfit[];
  tripDates: Array<{ dateStr: string; label: string }>;
  onSaveLook: (index: number) => void;
  onAssignToDay: (outfitIndex: number, dateStr: string) => void;
  generateDisabled: boolean;
}) {
  return (
    <>
      <section className="mb-8">
        <label className="block text-[11px] uppercase tracking-widest mb-2">
          Mood for outfit ideas
        </label>
        <select
          value={mood}
          onChange={(e) => onMoodChange(e.target.value as Mood)}
          className="border border-border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange cursor-pointer"
          aria-label="Mood"
        >
          {[
            "casual",
            "formal",
            "adventurous",
            "cozy",
            "energetic",
            "minimalist",
            "bold",
          ].map((m) => (
            <option key={m} value={m}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </option>
          ))}
        </select>
        <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground max-w-xl">
          Ideas use sample weather for now: cloudy, 15°C. This keeps suggestions
          consistent until we tie in your forecast. Assignments show on the{" "}
          <Link
            href="/plan/calendar"
            className="text-foreground underline underline-offset-2 hover:text-signal-orange transition-colors"
          >
            outfit calendar
          </Link>
          .
        </p>
        <BrutalistButton
          className="mt-4 cursor-pointer"
          onClick={onGenerate}
          disabled={loading || generateDisabled}
        >
          {loading ? "Generating…" : "Generate outfits from packed pieces"}
        </BrutalistButton>
        {error && <p className="mt-2 text-[11px] text-destructive">{error}</p>}
      </section>

      {displayOutfits.length > 0 && (
        <section>
          <h2 className="text-sm uppercase tracking-widest mb-4">
            Outfit ideas
          </h2>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayOutfits.map((outfit, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <OutfitRecommendationCard
                    label={outfit.label}
                    garments={outfit.garments}
                    explanation={outfit.explanation}
                    contextMood={outfit.contextMood}
                    contextWeather={outfit.contextWeather}
                    scoreBreakdown={outfit.scoreBreakdown}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSaveLook(i)}
                      className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-border hover:border-signal-orange hover:text-signal-orange transition-colors duration-200 cursor-pointer"
                    >
                      Save look
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-border hover:border-signal-orange hover:text-signal-orange transition-colors duration-200 cursor-pointer data-[state=open]:border-signal-orange data-[state=open]:text-signal-orange"
                        >
                          Assign to day…
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="max-h-52 overflow-y-auto"
                      >
                        {tripDates.map(({ dateStr, label }) => (
                          <DropdownMenuItem
                            key={dateStr}
                            className="text-[11px] uppercase tracking-wider cursor-pointer"
                            onClick={() => onAssignToDay(i, dateStr)}
                          >
                            {label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
