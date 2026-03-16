"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useOutfitRecommendations } from "@/hooks/use-outfit-recommendations";
import type { Mood } from "@shared/types";
import { BrutalistButton } from "@/components/brutalist-button";
import { OutfitRecommendationCard } from "@/components/outfit-recommendation-card";
import { toast } from "sonner";

const STEPS = [
  { id: "welcome", title: "Welcome" },
  { id: "garments", title: "Add garments" },
  { id: "preferences", title: "Preferences" },
  { id: "try", title: "Try it" },
  { id: "done", title: "You're set" },
] as const;

const MOODS: Mood[] = [
  "casual",
  "formal",
  "adventurous",
  "cozy",
  "energetic",
  "minimalist",
  "bold",
];

const PREF_STYLES = ["minimalist", "bold", "classic", "trendy", "cozy"];
const PREF_COLORS = ["black", "white", "gray", "navy", "beige", "red", "blue"];
const MIN_GARMENTS_SUGGESTED = 3;

export default function OnboardingPage() {
  const router = useRouter();
  const currentUser = useRequireAuth("/onboarding");
  const garmentsRaw = useQuery(api.garments.list);
  const userPrefs = useQuery(api.userPreferences.get);
  const completeOnboarding = useMutation(api.profile.completeOnboarding);
  const savePreferences = useMutation(api.userPreferences.save);

  const garments = garmentsRaw ?? [];
  const [stepIndex, setStepIndex] = useState(0);
  const [favoriteMoods, setFavoriteMoods] = useState<string[]>([]);
  const [preferredStyles, setPreferredStyles] = useState<string[]>([]);
  const [preferredColors, setPreferredColors] = useState<string[]>([]);
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [selectedMood, setSelectedMood] = useState<Mood>("casual");

  const {
    outfits,
    loading: recLoading,
    error: recError,
    generate,
    reset: resetRecs,
  } = useOutfitRecommendations({
    userId: currentUser?._id ?? "",
    mood: selectedMood,
    weather: "cloudy",
    temperature: 15,
    limitCount: 3,
  });

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;
  const isFirstStep = stepIndex === 0;

  const handleSkip = useCallback(async () => {
    try {
      await completeOnboarding();
      router.replace("/");
    } catch {
      toast.error("Something went wrong.");
    }
  }, [completeOnboarding, router]);

  const handleNext = useCallback(() => {
    if (isLastStep) return;
    setStepIndex((i) => i + 1);
  }, [isLastStep]);

  const handleFinish = useCallback(async () => {
    try {
      await completeOnboarding();
      router.replace("/");
    } catch {
      toast.error("Something went wrong.");
    }
  }, [completeOnboarding, router]);

  const toggleList = (
    value: string,
    list: string[],
    setter: (next: string[]) => void
  ) => {
    if (list.includes(value)) setter(list.filter((v) => v !== value));
    else setter([...list, value]);
  };

  const handleSavePreferences = useCallback(async () => {
    await savePreferences({
      favoriteMoods: favoriteMoods.length ? favoriteMoods : undefined,
      preferredStyles: preferredStyles.length ? preferredStyles : undefined,
      preferredColors: preferredColors.length ? preferredColors : undefined,
    });
    setPrefsSaved(true);
    toast.success("Preferences saved.");
  }, [favoriteMoods, preferredStyles, preferredColors, savePreferences]);

  const handleTryGenerate = useCallback(async () => {
    if (garments.length === 0) {
      toast.error("Add at least one garment first.");
      return;
    }
    resetRecs();
    const garmentList = garments.map((g: Doc<"garments">) => ({
      id: g._id,
      userId: g.userId,
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
      season: (g.season as "spring" | "summer" | "fall" | "winter" | "all-season") ?? undefined,
      tags: g.tags,
      style: g.style,
      fit: g.fit,
      occasion: g.occasion,
      versatility: (g.versatility as "high" | "medium" | "low") ?? undefined,
      vibrancy: (g.vibrancy as "muted" | "balanced" | "vibrant") ?? undefined,
      imageOriginalUrl: g.imageUrl,
      createdAt: new Date((g as { _creationTime: number })._creationTime),
    }));
    await generate({
      garments: garmentList,
      mood: selectedMood,
      weather: "cloudy",
      temperature: 15,
      limitCount: 3,
    });
  }, [garments, selectedMood, generate, resetRecs]);

  // Sync preferences from Convex when available
  React.useEffect(() => {
    if (userPrefs?.explicit) {
      setFavoriteMoods(userPrefs.explicit.favoriteMoods ?? []);
      setPreferredStyles(userPrefs.explicit.preferredStyles ?? []);
      setPreferredColors(userPrefs.explicit.preferredColors ?? []);
    }
  }, [userPrefs]);

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-signal-orange selection:text-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-5">
          <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-muted-foreground">
            OutfAI
          </span>
          <button
            type="button"
            onClick={handleSkip}
            className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-100"
          >
            Skip for now
          </button>
        </div>
      </header>

      <div className="pt-24 pb-20 px-4 max-w-xl mx-auto">
        {/* Progress */}
        <div className="flex gap-1 mb-10">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`h-0.5 flex-1 ${
                i <= stepIndex ? "bg-foreground" : "bg-border"
              }`}
            />
          ))}
        </div>

        {step.id === "welcome" && (
          <section className="space-y-6">
            <h1 className="text-2xl font-light tracking-tight">
              Set up your wardrobe
            </h1>
            <p className="text-sm text-muted-foreground">
              We’ll guide you through adding a few items, your style preferences,
              and then show you your first outfit.
            </p>
            <BrutalistButton onClick={handleNext}>
              Let’s go
            </BrutalistButton>
          </section>
        )}

        {step.id === "garments" && (
          <section className="space-y-6">
            <h1 className="text-2xl font-light tracking-tight">
              Add garments
            </h1>
            <p className="text-sm text-muted-foreground">
              Add at least {MIN_GARMENTS_SUGGESTED} items to get better
              recommendations. You can add more anytime.
            </p>
            <div className="border border-border px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Your closet
              </p>
              <p className="text-2xl font-light mt-1 tabular-nums">
                {garments.length} item{garments.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Link href="/add">
              <BrutalistButton variant="outline" type="button">
                Add garment
              </BrutalistButton>
            </Link>
            <div className="flex gap-3 pt-4">
              <BrutalistButton
                onClick={handleNext}
                disabled={garments.length === 0}
              >
                Continue
              </BrutalistButton>
            </div>
          </section>
        )}

        {step.id === "preferences" && (
          <section className="space-y-6">
            <h1 className="text-2xl font-light tracking-tight">
              Style preferences
            </h1>
            <p className="text-sm text-muted-foreground">
              Pick moods and styles you like. We’ll use these to tailor
              recommendations.
            </p>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Favorite moods
              </p>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() =>
                      toggleList(m, favoriteMoods, setFavoriteMoods)
                    }
                    className={`px-3 py-1 text-[11px] uppercase tracking-[0.16em] border transition-colors duration-100 ${
                      favoriteMoods.includes(m)
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-foreground"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Preferred styles
              </p>
              <div className="flex flex-wrap gap-2">
                {PREF_STYLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      toggleList(s, preferredStyles, setPreferredStyles)
                    }
                    className={`px-3 py-1 text-[11px] uppercase tracking-[0.16em] border transition-colors duration-100 ${
                      preferredStyles.includes(s)
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Preferred colors
              </p>
              <div className="flex flex-wrap gap-2">
                {PREF_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() =>
                      toggleList(c, preferredColors, setPreferredColors)
                    }
                    className={`px-3 py-1 text-[11px] uppercase tracking-[0.16em] border transition-colors duration-100 ${
                      preferredColors.includes(c)
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <BrutalistButton
              onClick={handleSavePreferences}
              disabled={prefsSaved}
            >
              {prefsSaved ? "Saved" : "Save preferences"}
            </BrutalistButton>
            <BrutalistButton onClick={handleNext}>Continue</BrutalistButton>
          </section>
        )}

        {step.id === "try" && (
          <section className="space-y-6">
            <h1 className="text-2xl font-light tracking-tight">
              Try an outfit
            </h1>
            <p className="text-sm text-muted-foreground">
              Pick a mood and we’ll suggest an outfit from your closet.
            </p>

            {garments.length === 0 ? (
              <p className="text-sm text-muted-foreground border border-border px-5 py-4">
                Add at least one garment first.{" "}
                <Link href="/add" className="underline hover:text-foreground">
                  Add garment
                </Link>
              </p>
            ) : (
              <>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    Mood
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMood(m)}
                        className={`px-3 py-1 text-[11px] uppercase tracking-[0.16em] border transition-colors duration-100 ${
                          selectedMood === m
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-muted-foreground hover:border-foreground"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <BrutalistButton
                  onClick={handleTryGenerate}
                  disabled={recLoading}
                >
                  {recLoading ? "Generating…" : "Generate outfit"}
                </BrutalistButton>

                {recError && (
                  <p className="text-xs uppercase tracking-wider text-signal-orange">
                    {recError}
                  </p>
                )}

                {outfits.length > 0 && (() => {
                  const first = outfits[0];
                  const displayGarments = (first.garmentIds ?? [])
                    .map((id: string) =>
                      garments.find((g: Doc<"garments">) => g._id === id)
                    )
                    .filter((g): g is Doc<"garments"> => g != null)
                    .map((g) => ({
                      id: g._id,
                      src: g.imageUrl ?? "",
                      name: g.name,
                      type: g.category,
                    }));
                  return (
                    <div className="border border-border p-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
                        Suggested outfit
                      </p>
                      <OutfitRecommendationCard
                        label="Suggested"
                        garments={displayGarments}
                        explanation={first.explanation}
                        contextMood={first.contextMood}
                        contextWeather={first.contextWeather}
                        scoreBreakdown={first.scoreBreakdown}
                      />
                    </div>
                  );
                })()}
              </>
            )}

            <BrutalistButton onClick={handleNext}>
              Continue
            </BrutalistButton>
          </section>
        )}

        {step.id === "done" && (
          <section className="space-y-6">
            <h1 className="text-2xl font-light tracking-tight">
              You’re all set
            </h1>
            <p className="text-sm text-muted-foreground">
              Start from the home screen to get daily outfit ideas based on your
              mood and weather.
            </p>
            <BrutalistButton onClick={handleFinish}>
              Go to home
            </BrutalistButton>
          </section>
        )}

        {!isFirstStep && step.id !== "done" && (
          <button
            type="button"
            onClick={() => setStepIndex((i) => i - 1)}
            className="mt-8 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-100"
          >
            Back
          </button>
        )}
      </div>
    </main>
  );
}
