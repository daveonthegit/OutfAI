"use client";

import type { Mood, WeatherCondition } from "@shared/types";
import {
  HomeOccasionTags,
  HomeWeatherBar,
} from "@/components/home/home-weather-bar";

type HomeHeroSectionProps = {
  mood: Mood;
  onOpenMoodModal: () => void;
  occasion: string;
  onOccasionChange: (tag: string) => void;
  weatherBar: {
    locationError: string | null;
    cityInput: string;
    onCityInputChange: (value: string) => void;
    onCitySubmit: () => void;
    weatherCityLoading: boolean;
    displayTemp: number | null;
    tempUnit: "F" | "C";
    onToggleTempUnit: () => void;
    weather: WeatherCondition | null;
    lastFetched: string | null;
  };
};

export function HomeHeroSection({
  mood,
  onOpenMoodModal,
  occasion,
  onOccasionChange,
  weatherBar,
}: HomeHeroSectionProps) {
  return (
    <section className="mb-16 md:mb-24 lg:mb-32">
      <div className="max-w-4xl flex flex-col gap-6 md:gap-8">
        <button
          type="button"
          onClick={onOpenMoodModal}
          className="text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm w-fit cursor-pointer"
          aria-label="Change mood"
        >
          <h2 className="font-serif italic text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-foreground leading-[0.9] tracking-tight mb-0">
            today feels
          </h2>
          <h2 className="font-serif italic text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-signal-orange leading-[0.9] tracking-tight group-hover:underline underline-offset-2">
            {mood}
          </h2>
        </button>
        <HomeOccasionTags
          occasion={occasion}
          onOccasionChange={onOccasionChange}
        />
        <HomeWeatherBar {...weatherBar} />
      </div>
    </section>
  );
}
