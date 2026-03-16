"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { OutfitRecommendationCard } from "@/components/outfit-recommendation-card";
import { StyleInsightsSection } from "@/components/style-insights-section";
import { useOutfitRecommendations } from "@/hooks/use-outfit-recommendations";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import type { Mood, WeatherCondition, ScoreBreakdown } from "@shared/types";
import { MOCK_CLOSET_ITEMS } from "@shared/data/mock-closet";
import { UserAvatar } from "@/components/user-avatar";
import { MoodSelectModal } from "@/components/mood-select-modal";
import { animateShuffleGrid, staggerFadeInContainer } from "@/lib/animations";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

/** Display shape for one garment in the recommendation grid (from Convex doc + UI fields). */
export interface DisplayGarment {
  id: Id<"garments">;
  src: string;
  name: string;
  category: string;
  type: string;
  color: string;
  traits: {
    style?: string[];
    fit?: string;
    occasion?: string[];
    versatility?: string;
    vibrancy?: string;
  };
}

/** One outfit as shown in the home grid (label + resolved garments + context). */
export interface DisplayOutfit {
  label: string;
  garments: DisplayGarment[];
  explanation: string;
  contextMood?: Mood;
  contextWeather?: WeatherCondition;
  contextTemperature?: number;
  scoreBreakdown?: ScoreBreakdown;
}

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

const VALID_MOODS: Mood[] = [
  "casual",
  "formal",
  "adventurous",
  "cozy",
  "energetic",
  "minimalist",
  "bold",
];

function isMood(value: string | null): value is Mood {
  return value !== null && (VALID_MOODS as string[]).includes(value);
}

export default function Home() {
  const currentUser = useRequireAuth("/");
  const searchParams = useSearchParams();
  // Keep the raw value so we can tell "loading" (undefined) from "empty" ([])
  const convexGarmentsRaw = useQuery(api.garments.list);
  const convexGarments = convexGarmentsRaw ?? [];

  const [isShuffling, setIsShuffling] = useState(false);
  const [mood, setMood] = useState<Mood>("bold");
  const [moodModalOpen, setMoodModalOpen] = useState(false);

  // Sync mood from URL when coming from /mood (e.g. ?mood=minimalist)
  useEffect(() => {
    const moodParam = searchParams.get("mood");
    if (isMood(moodParam)) {
      setMood(moodParam);
    }
  }, [searchParams]);

  // Open mood modal when navigating from /mood (e.g. ?openMood=1)
  useEffect(() => {
    const openMood = searchParams.get("openMood");
    if (openMood === "1" || openMood === "true") {
      setMoodModalOpen(true);
    }
  }, [searchParams]);
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  // Always store temperature in Celsius internally so the recommendation engine's
  // thresholds (< 10 °C = cold, > 25 °C = hot) are always in the right unit.
  const [temperatureCelsius, setTemperatureCelsius] = useState<number | null>(
    null
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [allRecommendedOutfits, setAllRecommendedOutfits] = useState<
    DisplayOutfit[]
  >([]);
  const [recommendedOutfit, setRecommendedOutfit] = useState<DisplayOutfit[]>(
    []
  );
  const [tempUnit, setTempUnit] = useState<"F" | "C">("F");
  const [lastFetched, setLastFetched] = useState<string | null>(null);
  // Manual weather fallback when geolocation is denied or fails
  const [cityInput, setCityInput] = useState("");
  const [weatherCityLoading, setWeatherCityLoading] = useState(false);

  // Select mode for Save Look (same UI as closet: multi-select options)
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedOptionIndices, setSelectedOptionIndices] = useState<
    Set<number>
  >(new Set());
  const [isSaving, setIsSaving] = useState(false);
  // Indices of outfit cards the user skipped (hidden from grid, logged as "skipped")
  const [skippedIndices, setSkippedIndices] = useState<Set<number>>(new Set());

  // Derive the display value from Celsius; no extra API call needed on unit switch.
  const displayTemp =
    temperatureCelsius === null
      ? null
      : tempUnit === "F"
        ? Math.round(temperatureCelsius * (9 / 5) + 32)
        : temperatureCelsius;

  const userId = currentUser?._id ?? "default-user";
  const saveOutfit = useMutation(api.outfits.save);
  const logRecommendation = useMutation(api.recommendationLogs.log);
  const seedDevCloset = useMutation(api.seed.seedDevCloset);
  const [savedOutfitId, setSavedOutfitId] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);

  const recommendationGridRef = useRef<HTMLDivElement>(null);
  const justShuffledRef = useRef(false);
  const hasStaggeredInitialRef = useRef(false);
  const lastLoggedShownBatchRef = useRef<string | null>(null);
  const convexGarmentsRef = useRef(convexGarments);
  convexGarmentsRef.current = convexGarments;

  // Stable props for StyleInsightsSection to avoid unnecessary refetches
  const garmentsKey = convexGarments.map((g) => g._id).join(",");
  const stableGarments = useMemo(() => convexGarments, [garmentsKey]);
  const outfitIdsKey =
    recommendedOutfit?.[0]?.garments?.map((g) => g.id).join(",") ?? "";
  const memoizedOutfitGarmentIds = useMemo(
    () => recommendedOutfit?.[0]?.garments?.map((g) => g.id as string) ?? [],
    [outfitIdsKey]
  );

  const {
    outfits,
    loading,
    error: recommendationError,
    generate,
  } = useOutfitRecommendations({
    userId,
    mood,
    weather: weather ?? "cloudy",
    temperature: temperatureCelsius ?? 15, // always Celsius for the engine
    limitCount: 30,
  });

  // Fetch weather once on mount. Open-Meteo returns Celsius by default which
  // is what the recommendation engine expects. The unit toggle converts for display.
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { latitude, longitude } = coords;

          // No temperature_unit param → Open-Meteo defaults to Celsius
          const url =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}&longitude=${longitude}` +
            `&current=temperature_2m,weather_code`;

          const res = await fetch(url);
          if (!res.ok)
            throw new Error(`Weather request failed (${res.status})`);
          const data = await res.json();

          const temp = data?.current?.temperature_2m;
          const code = data?.current?.weather_code;

          setLastFetched(new Date().toISOString());

          if (typeof temp === "number") setTemperatureCelsius(Math.round(temp));
          if (typeof code === "number") setWeather(codeToWeatherLabel(code));

          setLocationError(null);
        } catch (e: unknown) {
          setLocationError(
            e instanceof Error ? e.message : "Failed to fetch weather."
          );
        }
      },
      (err) => {
        setLocationError(err.message || "Location permission denied.");
      }
    );
  }, []); // Run once on mount — unit toggle just converts displayTemp client-side

  const fetchWeatherByCity = async () => {
    const city = cityInput.trim();
    if (!city || city.length < 2) return;
    setWeatherCityLoading(true);
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      );
      if (!geoRes.ok) throw new Error("City lookup failed");
      const geoData = await geoRes.json();
      const results = geoData?.results;
      if (!results?.length) {
        toast.error("City not found. Try another name.");
        return;
      }
      const { latitude, longitude } = results[0];
      const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${latitude}&longitude=${longitude}` +
        `&current=temperature_2m,weather_code`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Weather request failed");
      const data = await res.json();
      const temp = data?.current?.temperature_2m;
      const code = data?.current?.weather_code;
      setLastFetched(new Date().toISOString());
      if (typeof temp === "number") setTemperatureCelsius(Math.round(temp));
      if (typeof code === "number") setWeather(codeToWeatherLabel(code));
      setLocationError(null);
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("outfai_last_weather_city", city);
      }
      toast.success(`Weather set for ${city}`);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not get weather for that city"
      );
    } finally {
      setWeatherCityLoading(false);
    }
  };

  // Pre-fill city from localStorage when location is off
  useEffect(() => {
    if (locationError && !cityInput && typeof localStorage !== "undefined") {
      const last = localStorage.getItem("outfai_last_weather_city");
      if (last) setCityInput(last);
    }
  }, [locationError]);

  // Toast when recommendation API fails
  useEffect(() => {
    if (recommendationError) {
      toast.error(recommendationError);
    }
  }, [recommendationError]);

  // Seed the closet with mock items on the user's first visit (empty closet).
  useEffect(() => {
    if (!currentUser || seeded) return;
    if (convexGarments.length > 0) return;
    setSeeded(true);
    seedDevCloset().catch(console.error);
  }, [currentUser, convexGarments.length, seeded]);

  // Generate recommendations whenever mood, weather, or the garment list changes.
  // Wait until garments have actually loaded (undefined = still loading) so we
  // don't fire with an empty list and fall back to mock data unnecessarily.
  useEffect(() => {
    if (convexGarmentsRaw === undefined) return; // still loading from Convex

    const generateRecommendations = async () => {
      const garments =
        convexGarments.length > 0
          ? convexGarments.map((g: Doc<"garments">) => ({
              id: g._id,
              userId,
              name: g.name,
              category: g.category as
                | "top"
                | "bottom"
                | "shoes"
                | "outerwear"
                | "accessory",
              primaryColor: g.primaryColor,
              secondaryColor: undefined,
              material: g.material,
              season: g.season as
                | "spring"
                | "summer"
                | "fall"
                | "winter"
                | "all-season"
                | undefined,
              tags: g.tags,
              style: g.style,
              fit: g.fit,
              occasion: g.occasion,
              versatility: g.versatility as
                | "high"
                | "medium"
                | "low"
                | undefined,
              vibrancy: g.vibrancy as
                | "muted"
                | "balanced"
                | "vibrant"
                | undefined,
              imageOriginalUrl: g.imageUrl,
              createdAt: new Date(g._creationTime),
            }))
          : MOCK_CLOSET_ITEMS.map((g, i) => ({
              id: `mock-${i}`,
              userId,
              name: g.name,
              category: g.category as
                | "top"
                | "bottom"
                | "shoes"
                | "outerwear"
                | "accessory",
              primaryColor: g.primaryColor,
              secondaryColor: undefined,
              material: undefined,
              season: "all-season" as const,
              tags: g.tags,
              style: g.style,
              fit: g.fit,
              occasion: g.occasion,
              versatility: g.versatility,
              vibrancy: g.vibrancy,
              imageOriginalUrl: g.imageUrl,
              createdAt: new Date(),
            }));

      await generate({
        garments,
        mood,
        weather: weather ?? "cloudy",
        temperature: temperatureCelsius ?? 15, // always Celsius for the engine
        limitCount: 30,
      });
    };

    generateRecommendations();
    // Re-run when mood, weather, or temperature changes, or when garment count changes.
    // convexGarmentsRaw is intentionally omitted — it changes reference on every
    // Convex subscription tick. We only care about the count (a stable number) and use
    // convexGarmentsRaw purely as a loading guard via closure.
  }, [mood, weather, temperatureCelsius, convexGarments.length]);

  // Update displayed outfit when recommendations change.
  // Only depend on outfits so we don't re-run on every Convex subscription tick
  // (convexGarments gets a new array reference often, which caused flicker/crash).
  useEffect(() => {
    if (!outfits?.length) return;
    const garments = convexGarmentsRef.current;
    const convertedOutfits: DisplayOutfit[] = outfits.map((outfit, index) => {
      const rawGarments = outfit.garmentIds
        .map((id) => {
          const item = garments.find((g: Doc<"garments">) => g._id === id);
          if (!item) return null;
          const g: DisplayGarment = {
            id: item._id,
            src: item.imageUrl ?? "",
            name: item.name,
            category: item.category,
            type: item.category,
            color: item.primaryColor,
            traits: {
              style: item.style,
              fit: item.fit,
              occasion: item.occasion,
              versatility: item.versatility,
              vibrancy: item.vibrancy,
            },
          };
          return g;
        })
        .filter((g): g is DisplayGarment => g != null);
      return {
        label: `Option ${index + 1}`,
        garments: rawGarments,
        explanation: outfit.explanation,
        contextMood: mood,
        contextWeather: weather ?? undefined,
        contextTemperature: temperatureCelsius ?? undefined,
        scoreBreakdown: outfit.scoreBreakdown,
      };
    });
    setAllRecommendedOutfits(convertedOutfits);
    setRecommendedOutfit(convertedOutfits.slice(0, 6));
    setSkippedIndices(new Set());

    // Log "shown" once per batch (dedupe by batch key so we don't log on mood/weather re-run)
    const batchKey = outfits
      .slice(0, 6)
      .map((o) => o.garmentIds.join(","))
      .join("|");
    if (batchKey !== lastLoggedShownBatchRef.current) {
      lastLoggedShownBatchRef.current = batchKey;
      const weatherStr = weather ?? undefined;
      outfits.slice(0, 6).forEach((outfit) => {
        logRecommendation({
          action: "shown",
          garmentIds: outfit.garmentIds,
          mood,
          weather: weatherStr,
        }).catch(console.error);
      });
    }
  }, [outfits, mood, weather, temperatureCelsius, logRecommendation]);

  // Shuffle animation: run after grid updates from handleShuffle (defer so DOM is committed)
  useEffect(() => {
    if (!recommendedOutfit?.length || !recommendationGridRef.current) return;
    if (justShuffledRef.current) {
      justShuffledRef.current = false;
      const el = recommendationGridRef.current;
      requestAnimationFrame(() => animateShuffleGrid(el));
    }
  }, [recommendedOutfit]);

  // Staggered entry when recommendations first appear (defer so DOM is committed; avoids duration-of-null on slow/hydration)
  useEffect(() => {
    if (
      !recommendedOutfit?.length ||
      hasStaggeredInitialRef.current ||
      !recommendationGridRef.current
    )
      return;
    hasStaggeredInitialRef.current = true;
    const el = recommendationGridRef.current;
    requestAnimationFrame(() => staggerFadeInContainer(el));
  }, [recommendedOutfit]);

  const toggleSelectMode = () => {
    setIsSelectMode((prev) => !prev);
    setSelectedOptionIndices(new Set());
    setSavedOutfitId(null);
  };

  const toggleOptionIndex = (index: number) => {
    setSelectedOptionIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const selectAllOptions = () => {
    if (!recommendedOutfit?.length) return;
    setSelectedOptionIndices(new Set(recommendedOutfit.map((_, i) => i)));
  };

  const deselectAllOptions = () => {
    setSelectedOptionIndices(new Set());
  };

  const allOptionsSelected =
    recommendedOutfit &&
    recommendedOutfit.length > 0 &&
    recommendedOutfit.every((_, i) => selectedOptionIndices.has(i));

  const handleSaveSelectedLooks = async () => {
    if (selectedOptionIndices.size === 0 || convexGarments.length === 0) return;
    setIsSaving(true);
    try {
      const weatherStr = weather ?? undefined;
      for (const index of selectedOptionIndices) {
        const outfit = recommendedOutfit[index];
        if (!outfit?.garments?.length) continue;
        const garmentIds = convexGarments
          .filter((g: Doc<"garments">) =>
            outfit.garments.some((fg) => fg.id === g._id)
          )
          .map((g: Doc<"garments">) => g._id);
        if (garmentIds.length === 0) continue;
        const outfitId = await saveOutfit({
          garmentIds,
          contextMood: outfit.contextMood ?? mood,
          contextWeather: outfit.contextWeather ?? weather ?? undefined,
          contextTemperature:
            outfit.contextTemperature ?? temperatureCelsius ?? undefined,
          explanation: outfit.explanation,
        });
        await logRecommendation({
          action: "saved",
          outfitId,
          garmentIds: garmentIds.map(String),
          mood: outfit.contextMood ?? mood,
          weather: weatherStr,
        }).catch(console.error);
      }
      setSavedOutfitId("done");
      setSelectedOptionIndices(new Set());
      setIsSelectMode(false);
      toast.success(
        selectedOptionIndices.size === 1
          ? "Outfit saved"
          : `${selectedOptionIndices.size} outfits saved`
      );
    } catch {
      toast.error("Could not save. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = (index: number) => {
    const outfit = recommendedOutfit[index];
    if (!outfit?.garments?.length) return;
    const garmentIds = outfit.garments
      .map((g) => g.id)
      .filter((id): id is NonNullable<typeof id> => id != null) as string[];
    logRecommendation({
      action: "skipped",
      garmentIds,
      mood: outfit.contextMood ?? mood,
      weather: weather ?? undefined,
    }).catch(console.error);
    setSkippedIndices((prev) => new Set([...prev, index]));
  };

  const handleShuffle = () => {
    setIsShuffling(true);
    justShuffledRef.current = true;
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
          <h1 className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium">
            OutfAI
          </h1>
          <UserAvatar />
        </div>
      </header>

      {/* Main content */}
      <div className="pt-24 md:pt-32 px-4 md:px-8 lg:px-12 pb-28">
        {/* Hero Typography */}
        <section className="mb-16 md:mb-24 lg:mb-32">
          <div className="max-w-4xl flex flex-col gap-6 md:gap-8">
            {/* Mood line - oversized editorial; click opens mood modal */}
            <button
              type="button"
              onClick={() => setMoodModalOpen(true)}
              className="text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm w-fit"
              aria-label="Change mood"
            >
              <h2 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl italic text-foreground leading-[0.9] tracking-tight mb-0">
                today feels
              </h2>
              <h2 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl italic text-signal-orange leading-[0.9] tracking-tight group-hover:underline underline-offset-2">
                {mood}
              </h2>
            </button>
            {/* Weather context - below mood */}
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-muted-foreground backdrop-blur w-fit">
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
                    onChange={(e) => setCityInput(e.target.value)}
                    placeholder="e.g. London"
                    className="ml-1 w-28 rounded border border-border/60 bg-background/80 px-2 py-0.5 text-[10px] normal-case text-foreground placeholder:text-muted-foreground outline-none focus:border-signal-orange/50"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        fetchWeatherByCity();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fetchWeatherByCity()}
                    disabled={weatherCityLoading || cityInput.trim().length < 2}
                    className="rounded border border-border/60 bg-background/80 px-2 py-0.5 text-[9px] uppercase tracking-wider text-foreground hover:border-signal-orange/50 disabled:opacity-50"
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
                              : weather === "foggy"
                                ? "Foggy"
                                : weather === "windy"
                                  ? "Windy"
                                  : "Cloudy"}
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
          </div>
        </section>

        <MoodSelectModal
          open={moodModalOpen}
          onOpenChange={setMoodModalOpen}
          currentMood={mood}
          onSelect={setMood}
        />

        {/* Editorial divider */}
        <div className="flex items-center gap-6 mb-12 md:mb-16">
          <div className="h-px bg-border flex-1" />
          <span className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
            {loading ? "Generating..." : `${recommendedOutfit.length} Options`}
          </span>
          <div className="h-px bg-border flex-1" />
        </div>

        {/* Selection toolbar - same as closet */}
        {isSelectMode && recommendedOutfit && recommendedOutfit.length > 0 && (
          <section className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-border px-4 py-3">
            <div className="flex items-center gap-4">
              <span className="text-[11px] uppercase tracking-[0.2em] text-foreground">
                {selectedOptionIndices.size === 0
                  ? "None selected"
                  : `${selectedOptionIndices.size} selected`}
              </span>
              <button
                type="button"
                onClick={
                  allOptionsSelected ? deselectAllOptions : selectAllOptions
                }
                className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-100 underline underline-offset-2"
              >
                {allOptionsSelected ? "Deselect all" : "Select all"}
              </button>
            </div>
            {selectedOptionIndices.size > 0 && (
              <button
                type="button"
                onClick={handleSaveSelectedLooks}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-[0.2em] bg-signal-orange text-background border border-signal-orange hover:opacity-90 transition-colors duration-100 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        opacity="0.25"
                      />
                      <path d="M21 12a9 9 0 01-9-9" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    Save {selectedOptionIndices.size} look
                    {selectedOptionIndices.size !== 1 ? "s" : ""}
                  </>
                )}
              </button>
            )}
          </section>
        )}

        {/* Recommendation Grid */}
        <section className="mb-16 md:mb-24">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="aspect-square w-full rounded-none border border-border"
                />
              ))}
            </div>
          ) : recommendedOutfit && recommendedOutfit.length > 0 ? (
            <div
              ref={recommendationGridRef}
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 transition-opacity duration-100 ${
                isShuffling ? "opacity-30" : "opacity-100"
              }`}
            >
              {recommendedOutfit.map(
                (outfit, index) =>
                  outfit.garments.length > 0 &&
                  !skippedIndices.has(index) && (
                    <OutfitRecommendationCard
                      key={index}
                      label={outfit.label}
                      garments={outfit.garments}
                      explanation={outfit.explanation}
                      contextMood={outfit.contextMood}
                      contextWeather={outfit.contextWeather}
                      contextTemperature={outfit.contextTemperature}
                      scoreBreakdown={outfit.scoreBreakdown}
                      isSelectMode={isSelectMode}
                      isSelected={selectedOptionIndices.has(index)}
                      onToggleSelect={() => toggleOptionIndex(index)}
                      onSkip={
                        isSelectMode ? undefined : () => handleSkip(index)
                      }
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

        {/* Style insights — wardrobe gaps, complete-the-look, style tips (only after outfit results) */}
        <StyleInsightsSection
          userId={userId}
          garments={stableGarments}
          outfitGarmentIds={memoizedOutfitGarmentIds}
          mood={mood}
          weather={weather ?? undefined}
          temperature={temperatureCelsius ?? undefined}
          showWhenHasOutfits={
            !!(recommendedOutfit && recommendedOutfit.length > 0)
          }
        />

        {/* Actions - Save Look (pick options to save) + Shuffle */}
        <section className="flex items-center justify-center gap-8 md:gap-12 mb-20 md:mb-28">
          {recommendedOutfit && recommendedOutfit.length > 0 && (
            <>
              <button
                type="button"
                onClick={toggleSelectMode}
                className={`text-[11px] uppercase tracking-[0.25em] transition-colors duration-100 group flex items-center gap-2 ${
                  isSelectMode
                    ? "text-foreground border-border"
                    : savedOutfitId
                      ? "text-muted-foreground"
                      : "text-foreground hover:text-signal-orange"
                }`}
              >
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
                {isSelectMode
                  ? "Cancel"
                  : savedOutfitId
                    ? "Saved!"
                    : "Save Look"}
              </button>

              <div className="w-px h-4 bg-border" />
            </>
          )}

          <button
            type="button"
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
