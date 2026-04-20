"use client";

import type { WeatherCondition } from "@shared/types";
import { weatherLabelToDisplay } from "@/lib/home/weather-utils";
import { LoadingState } from "@/components/loading-state";

const OCCASION_TAGS = [
  "Work",
  "Dinner",
  "Weekend",
  "Gym",
  "Date",
  "Party",
  "Travel",
  "Casual",
] as const;

type HomeWeatherBarProps = {
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

export function HomeOccasionTags({
  occasion,
  onOccasionChange,
}: {
  occasion: string;
  onOccasionChange: (tag: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 max-w-lg">
      <span className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground shrink-0 mr-1">
        Occasion
      </span>
      {OCCASION_TAGS.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onOccasionChange(occasion === tag ? "" : tag)}
          className={`px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] border transition-colors duration-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-signal-orange ${
            occasion === tag
              ? "border-signal-orange text-signal-orange bg-signal-orange/5"
              : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}

export function HomeWeatherBar({
  locationError,
  cityInput,
  onCityInputChange,
  onCitySubmit,
  weatherCityLoading,
  displayTemp,
  tempUnit,
  onToggleTempUnit,
  weather,
  lastFetched,
}: HomeWeatherBarProps) {
  return (
    <div className="inline-flex flex-wrap items-center gap-2 rounded-full glass-panel px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-muted-foreground shadow-none w-fit">
      <span
        className={`h-1.5 w-1.5 rounded-full ${locationError ? "bg-destructive" : "bg-acid-lime"}`}
      />
      {locationError ? (
        <>
          <span className="text-foreground/80">Location off</span>
          <span className="opacity-40">·</span>
          <span className="normal-case tracking-normal text-muted-foreground">
            Enter city
          </span>
          <input
            type="text"
            value={cityInput}
            onChange={(e) => onCityInputChange(e.target.value)}
            placeholder="e.g. London"
            className="ml-1 w-28 rounded border border-[var(--glass-border-strong)] bg-[var(--glass-panel)] px-2 py-0.5 text-[10px] normal-case text-foreground placeholder:text-muted-foreground outline-none focus:border-signal-orange/50 backdrop-blur-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onCitySubmit();
              }
            }}
          />
          <button
            type="button"
            onClick={onCitySubmit}
            disabled={weatherCityLoading || cityInput.trim().length < 2}
            className="rounded border border-[var(--glass-border-strong)] bg-[var(--glass-panel)] px-2 py-0.5 text-[9px] uppercase tracking-wider text-foreground hover:border-signal-orange/50 disabled:opacity-50 backdrop-blur-sm cursor-pointer"
          >
            {weatherCityLoading ? "…" : "Use"}
          </button>
        </>
      ) : (
        <>
          <span className="text-foreground/80">
            {displayTemp === null ? "--" : displayTemp}°{tempUnit}
          </span>
          <span className="opacity-40">·</span>
          {weather === null ? (
            <LoadingState
              mode="spinner"
              showLabel={false}
              label="Loading weather"
              className="text-foreground/80 [&_svg]:size-3"
            />
          ) : (
            <span className="text-foreground/80">
              {weatherLabelToDisplay(weather)}
            </span>
          )}
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
            onClick={onToggleTempUnit}
            className="ml-2 rounded-full border border-border/60 px-2 py-0.5 text-[9px] uppercase tracking-[0.28em] text-muted-foreground hover:text-foreground hover:border-border transition-colors cursor-pointer"
          >
            {tempUnit === "F" ? "°C" : "°F"}
          </button>
        </>
      )}
    </div>
  );
}
