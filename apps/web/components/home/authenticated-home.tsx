"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { StyleInsightsSection } from "@/components/style-insights-section";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useHomeWeather } from "@/hooks/use-home-weather";
import { TrainedCounter } from "@/components/retention/TrainedCounter";
import { StreakBadge } from "@/components/retention/StreakBadge";
import { TasteNudge } from "@/components/retention/TasteNudge";
import { LearningFeedbackPanel } from "@/components/retention/LearningFeedbackPanel";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import type { Mood } from "@shared/types";
import { UserAvatar } from "@/components/user-avatar";
import { MoodSelectModal } from "@/components/mood-select-modal";
import { animateShuffleGrid } from "@/lib/animations";
import { PageContainer } from "@/components/layout/page-container";
import { AppHeader } from "@/components/layout/app-header";
import { HomeHeroSection } from "@/components/home/home-hero-section";
import { HomeSampleClosetBanner } from "@/components/home/home-sample-closet-banner";
import { HomeOutfitSelectionToolbar } from "@/components/home/home-outfit-selection-toolbar";
import { HomeRecommendationGrid } from "@/components/home/home-recommendation-grid";
import { HomeFooterActions } from "@/components/home/home-footer-actions";
import { isHomeMood } from "@/lib/home/mood-params";
import {
  DISPLAY_OUTFIT_COUNT,
  type DisplayGarment,
  type DisplayOutfit,
} from "@/components/home/home-types";
import { toast } from "sonner";

export type {
  DisplayGarment,
  DisplayOutfit,
} from "@/components/home/home-types";

const DEV_SEED_CLOSET = process.env.NEXT_PUBLIC_DEV_SEED_CLOSET === "true";

export default function Home() {
  const currentUser = useRequireAuth("/");
  const router = useRouter();
  const searchParams = useSearchParams();
  const convexGarmentsRaw = useQuery(api.garments.list);
  const convexGarments = convexGarmentsRaw ?? [];
  const pendingTasteNudges = useQuery(api.userPreferences.pendingTasteNudges);
  const createOutfitPreview = useMutation(api.outfitPreviews.create);

  const weather = useHomeWeather();

  const [isShuffling, setIsShuffling] = useState(false);
  const [mood, setMood] = useState<Mood>("bold");
  const [occasion, setOccasion] = useState("");
  const [moodModalOpen, setMoodModalOpen] = useState(false);

  useEffect(() => {
    const moodParam = searchParams.get("mood");
    if (isHomeMood(moodParam)) {
      setMood(moodParam);
    }
  }, [searchParams]);

  const [allRecommendedOutfits, setAllRecommendedOutfits] = useState<
    DisplayOutfit[]
  >([]);
  const [recommendedOutfit, setRecommendedOutfit] = useState<DisplayOutfit[]>(
    []
  );
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedOptionIndices, setSelectedOptionIndices] = useState<
    Set<number>
  >(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [savingSingleIndex, setSavingSingleIndex] = useState<number | null>(
    null
  );
  const [skippedIndices, setSkippedIndices] = useState<Set<number>>(new Set());

  const userId = currentUser?._id ?? "default-user";
  const saveOutfit = useMutation(api.outfits.save);
  const logOutfitAction = useMutation(api.recommendationLogs.logOutfitAction);
  const seedDevCloset = useMutation(api.seed.seedDevCloset);
  const [savedOutfitId, setSavedOutfitId] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);

  const recommendationGridRef = useRef<HTMLDivElement>(null);
  const justShuffledRef = useRef(false);
  const lastLoggedShownBatchRef = useRef<string | null>(null);
  const convexGarmentsRef = useRef(convexGarments);
  convexGarmentsRef.current = convexGarments;

  const garmentsKey = convexGarments.map((g) => g._id).join(",");
  const stableGarments = useMemo(() => convexGarments, [garmentsKey]);
  const outfitIdsKey =
    recommendedOutfit?.[0]?.garments?.map((g) => g.id).join(",") ?? "";
  const memoizedOutfitGarmentIds = useMemo(
    () => recommendedOutfit?.[0]?.garments?.map((g) => g.id as string) ?? [],
    [outfitIdsKey]
  );

  const ranked = useQuery(api.recommendationRank.getRankedRecommendations, {
    mood,
    weather: weather.weather ?? undefined,
    temperature: weather.temperatureCelsius ?? undefined,
    occasion: occasion.trim() || undefined,
    limit: 30,
  });
  const loading = ranked === undefined;

  useEffect(() => {
    if (!DEV_SEED_CLOSET) return;
    if (!currentUser || seeded) return;
    if (convexGarments.length > 0) return;
    setSeeded(true);
    seedDevCloset().catch(console.error);
  }, [currentUser, convexGarments.length, seeded, seedDevCloset]);

  useEffect(() => {
    if (ranked === undefined || !ranked.outfits?.length) {
      if (ranked !== undefined && ranked.outfits.length === 0) {
        setAllRecommendedOutfits([]);
        setRecommendedOutfit([]);
        setSkippedIndices(new Set());
      }
      return;
    }
    const outfits = ranked.outfits;
    const feedTotal = ranked.totalActions;
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
        contextWeather: weather.weather ?? undefined,
        contextTemperature: weather.temperatureCelsius ?? undefined,
        scoreBreakdown: outfit.scoreBreakdown,
        topContributors: outfit.topContributors,
        feedTotalActions: feedTotal,
        pickMode: outfit.pickMode,
      };
    });
    setAllRecommendedOutfits(convertedOutfits);
    setRecommendedOutfit(convertedOutfits.slice(0, DISPLAY_OUTFIT_COUNT));
    setSkippedIndices(new Set());

    const batchKey = outfits
      .slice(0, DISPLAY_OUTFIT_COUNT)
      .map((o) => `${o.garmentIds.join(",")}:${o.pickMode ?? ""}`)
      .join("|");
    if (batchKey !== lastLoggedShownBatchRef.current) {
      lastLoggedShownBatchRef.current = batchKey;
      const weatherStr = weather.weather ?? undefined;
      outfits.slice(0, DISPLAY_OUTFIT_COUNT).forEach((outfit) => {
        logOutfitAction({
          action: "shown",
          garmentIds: outfit.garmentIds,
          mood,
          weather: weatherStr,
          pickMode: outfit.pickMode,
        }).catch(console.error);
      });
    }
  }, [
    ranked,
    mood,
    weather.weather,
    weather.temperatureCelsius,
    logOutfitAction,
  ]);

  useEffect(() => {
    if (!recommendedOutfit?.length || !recommendationGridRef.current) return;
    if (justShuffledRef.current) {
      justShuffledRef.current = false;
      const el = recommendationGridRef.current;
      requestAnimationFrame(() => animateShuffleGrid(el));
    }
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
    const countToSave = selectedOptionIndices.size;
    try {
      const weatherStr = weather.weather ?? undefined;
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
          contextWeather: outfit.contextWeather ?? weather.weather ?? undefined,
          contextTemperature:
            outfit.contextTemperature ??
            weather.temperatureCelsius ??
            undefined,
          explanation: outfit.explanation,
        });
        await logOutfitAction({
          action: "saved",
          outfitId,
          garmentIds: garmentIds.map(String),
          mood: outfit.contextMood ?? mood,
          weather: weatherStr,
          pickMode: outfit.pickMode,
        }).catch(console.error);
      }
      setSavedOutfitId("done");
      setSelectedOptionIndices(new Set());
      setIsSelectMode(false);
      toast.success(
        countToSave === 1 ? "Outfit saved" : `${countToSave} outfits saved`,
        {
          description: "View in your archive",
          action: {
            label: "Archive →",
            onClick: () => router.push("/archive"),
          },
          duration: 4000,
        }
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
    logOutfitAction({
      action: "skipped",
      garmentIds,
      mood: outfit.contextMood ?? mood,
      weather: weather.weather ?? undefined,
      pickMode: outfit.pickMode,
    }).catch(console.error);
    setSkippedIndices((prev) => new Set([...prev, index]));
  };

  const handleSaveSingle = async (index: number) => {
    const outfit = recommendedOutfit?.[index];
    if (!outfit?.garments?.length || convexGarments.length === 0) {
      toast.error("Add garments to your closet to save outfits.");
      return;
    }
    const garmentIds = convexGarments
      .filter((g: Doc<"garments">) =>
        outfit.garments.some((fg) => fg.id === g._id)
      )
      .map((g: Doc<"garments">) => g._id);
    if (garmentIds.length === 0) {
      toast.error(
        "This outfit uses sample items. Add your own garments to save."
      );
      return;
    }
    setSavingSingleIndex(index);
    try {
      const outfitId = await saveOutfit({
        garmentIds,
        contextMood: outfit.contextMood ?? mood,
        contextWeather: outfit.contextWeather ?? weather.weather ?? undefined,
        contextTemperature:
          outfit.contextTemperature ?? weather.temperatureCelsius ?? undefined,
        explanation: outfit.explanation,
      });
      await logOutfitAction({
        action: "saved",
        outfitId,
        garmentIds: garmentIds.map(String),
        mood: outfit.contextMood ?? mood,
        weather: weather.weather ?? undefined,
        pickMode: outfit.pickMode,
      }).catch(console.error);
      toast.success("Outfit saved", {
        description: "View in your archive",
        action: { label: "Archive →", onClick: () => router.push("/archive") },
        duration: 4000,
      });
    } catch {
      toast.error("Could not save. Try again.");
    } finally {
      setSavingSingleIndex(null);
    }
  };

  const handleWorn = (index: number) => {
    const outfit = recommendedOutfit[index];
    if (!outfit?.garments?.length) return;
    const garmentIds = outfit.garments
      .map((g) => g.id)
      .filter((id): id is NonNullable<typeof id> => id != null) as string[];
    logOutfitAction({
      action: "worn",
      garmentIds,
      mood: outfit.contextMood ?? mood,
      weather: weather.weather ?? undefined,
      pickMode: outfit.pickMode,
    }).catch(console.error);
    toast.success("Marked as worn");
  };

  const handleShuffle = () => {
    setIsShuffling(true);
    justShuffledRef.current = true;
    setTimeout(() => setIsShuffling(false), 150);

    setRecommendedOutfit(() => {
      if (!allRecommendedOutfits || allRecommendedOutfits.length === 0) {
        return allRecommendedOutfits;
      }

      if (allRecommendedOutfits.length <= DISPLAY_OUTFIT_COUNT) {
        const shuffled = [...allRecommendedOutfits];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      }

      const indices = Array.from(
        { length: allRecommendedOutfits.length },
        (_, i) => i
      );
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      return indices
        .slice(0, DISPLAY_OUTFIT_COUNT)
        .map((idx) => allRecommendedOutfits[idx]);
    });
  };

  const fetchGeminiExplanation = async (
    outfit: DisplayOutfit,
    garmentIds: Id<"garments">[]
  ): Promise<string | undefined> => {
    try {
      const tempId = "preview";
      const res = await fetch("/api/outfit-narratives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: {
            mood: outfit.contextMood ?? null,
            weather: outfit.contextWeather ?? null,
            temperature: outfit.contextTemperature ?? null,
            occasion: occasion.trim() || null,
          },
          outfits: [
            {
              outfitId: tempId,
              garmentIds: garmentIds.map(String),
              currentExplanation: outfit.explanation ?? "",
              score: 0,
            },
          ],
        }),
      });
      if (!res.ok) return undefined;
      const data = (await res.json()) as {
        enhanced?: boolean;
        outfitNarratives?: Array<{ outfitId: string; explanation: string }>;
      };
      if (!data.enhanced) return undefined;
      const match = data.outfitNarratives?.find((n) => n.outfitId === tempId);
      return match?.explanation;
    } catch {
      return undefined;
    }
  };

  const navigateToOutfitPreview = async (outfit: DisplayOutfit) => {
    const garmentIds = outfit.garments
      .map((g) => g.id)
      .filter((id): id is Id<"garments"> => Boolean(id));
    if (garmentIds.length === 0) return;

    const rewritten = await fetchGeminiExplanation(outfit, garmentIds);
    const explanation = rewritten ?? outfit.explanation;

    const previewId = await createOutfitPreview({
      label: outfit.label,
      garmentIds,
      explanation,
      scoreBreakdown: outfit.scoreBreakdown,
      contextMood: outfit.contextMood,
      contextWeather: outfit.contextWeather,
      contextTemperature: outfit.contextTemperature,
    });
    router.push(`/outfit?preview=${previewId}&source=today`);
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-signal-orange selection:text-background">
      <AppHeader>
        <h1 className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium">
          OutfAI
        </h1>
        <UserAvatar />
      </AppHeader>

      <div className="pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-24 md:pb-28">
        <PageContainer>
          <TasteNudge pending={pendingTasteNudges ?? undefined} />
          <div className="flex flex-wrap items-center justify-end gap-3 mb-6">
            <TrainedCounter totalActions={ranked?.totalActions} />
            <StreakBadge streakDays={ranked?.streakDays} />
          </div>
          <LearningFeedbackPanel
            totalActions={ranked?.totalActions}
            streakDays={ranked?.streakDays}
          />
          <HomeHeroSection
            mood={mood}
            onOpenMoodModal={() => setMoodModalOpen(true)}
            occasion={occasion}
            onOccasionChange={(tag) =>
              setOccasion((prev) => (prev === tag ? "" : tag))
            }
            weatherBar={{
              locationError: weather.locationError,
              cityInput: weather.cityInput,
              onCityInputChange: weather.setCityInput,
              onCitySubmit: () => void weather.fetchWeatherByCity(),
              weatherCityLoading: weather.weatherCityLoading,
              displayTemp: weather.displayTemp,
              tempUnit: weather.tempUnit,
              onToggleTempUnit: () =>
                weather.setTempUnit((u) => (u === "F" ? "C" : "F")),
              weather: weather.weather,
              lastFetched: weather.lastFetched,
            }}
          />

          <MoodSelectModal
            open={moodModalOpen}
            onOpenChange={setMoodModalOpen}
            currentMood={mood}
            onSelect={setMood}
          />

          <div className="flex items-center gap-6 mb-12 md:mb-16">
            <div className="h-px bg-border flex-1" />
            <span className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
              {loading
                ? "Generating..."
                : `${recommendedOutfit.length} Options`}
            </span>
            <div className="h-px bg-border flex-1" />
          </div>

          {convexGarments.length === 0 &&
            recommendedOutfit &&
            recommendedOutfit.length > 0 && <HomeSampleClosetBanner />}

          {isSelectMode &&
            recommendedOutfit &&
            recommendedOutfit.length > 0 && (
              <HomeOutfitSelectionToolbar
                selectedCount={selectedOptionIndices.size}
                allSelected={!!allOptionsSelected}
                onToggleSelectAll={
                  allOptionsSelected ? deselectAllOptions : selectAllOptions
                }
                onSaveSelected={() => void handleSaveSelectedLooks()}
                isSaving={isSaving}
              />
            )}

          <HomeRecommendationGrid
            gridRef={recommendationGridRef}
            loading={loading}
            recommendedOutfit={recommendedOutfit}
            skippedIndices={skippedIndices}
            isShuffling={isShuffling}
            isSelectMode={isSelectMode}
            selectedOptionIndices={selectedOptionIndices}
            onToggleSelect={toggleOptionIndex}
            onSkip={handleSkip}
            onSaveSingle={(i) => void handleSaveSingle(i)}
            onWorn={handleWorn}
            savingSingleIndex={savingSingleIndex}
            onCreatePreviewNavigate={navigateToOutfitPreview}
          />

          <StyleInsightsSection
            userId={userId}
            garments={stableGarments}
            outfitGarmentIds={memoizedOutfitGarmentIds}
            mood={mood}
            weather={weather.weather ?? undefined}
            temperature={weather.temperatureCelsius ?? undefined}
            showWhenHasOutfits={
              !!(recommendedOutfit && recommendedOutfit.length > 0)
            }
          />

          <HomeFooterActions
            hasRecommendations={
              !!(recommendedOutfit && recommendedOutfit.length > 0)
            }
            isSelectMode={isSelectMode}
            savedOutfitId={savedOutfitId}
            onToggleSelectMode={toggleSelectMode}
            onShuffle={handleShuffle}
            shuffleDisabled={loading}
          />
        </PageContainer>
      </div>
    </main>
  );
}
