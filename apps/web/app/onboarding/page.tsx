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
import { cn } from "@/lib/utils";

const chipBase =
  "min-h-9 rounded-sm border px-3 py-2 text-[11px] uppercase tracking-[0.16em] transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const chipActive = "border-foreground bg-foreground text-background";
const chipInactive =
  "border-border text-muted-foreground hover:border-foreground";

const headerFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm";

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
      season:
        (g.season as "spring" | "summer" | "fall" | "winter" | "all-season") ??
        undefined,
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
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground selection:bg-signal-orange selection:text-background">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-foreground/[0.06] blur-3xl dark:bg-foreground/[0.08]" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-signal-orange/[0.06] blur-3xl dark:bg-signal-orange/[0.08]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/92 to-background" />
      </div>
      <div
        aria-hidden
        className="glass-veil pointer-events-none absolute inset-0 z-[1]"
      />
      <header className="glass-bar fixed left-0 right-0 top-0 z-50 rounded-none border-x-0 border-t-0 border-b border-border pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between px-4 py-4 md:px-8 md:py-5">
          <Link
            href="/"
            className={cn(
              headerFocus,
              "text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
            )}
          >
            OutfAI
          </Link>
          <button
            type="button"
            onClick={handleSkip}
            className={cn(
              headerFocus,
              "min-h-10 px-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-100 hover:text-foreground"
            )}
          >
            Skip for now
          </button>
        </div>
      </header>

      <p className="sr-only">
        Onboarding step {stepIndex + 1} of {STEPS.length}: {step.title}
      </p>

      <div className="relative z-10 mx-auto max-w-xl px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-[calc(6rem+env(safe-area-inset-top))] md:px-6">
        {/* Progress */}
        <div className="mb-10 flex gap-1.5" aria-hidden>
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                "h-0.5 flex-1 rounded-full",
                i <= stepIndex ? "bg-foreground" : "bg-border"
              )}
            />
          ))}
        </div>

        {step.id === "welcome" && (
          <section className="space-y-6">
            <h1 className="font-serif text-2xl font-normal italic leading-tight tracking-tight text-foreground">
              Set up your wardrobe
            </h1>
            <p className="max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
              We’ll guide you through adding a few items, your style
              preferences, and then show you your first outfit.
            </p>
            <BrutalistButton onClick={handleNext}>Let’s go</BrutalistButton>
          </section>
        )}

        {step.id === "garments" && (
          <section className="space-y-6">
            <h1 className="font-serif text-2xl font-normal italic leading-tight tracking-tight text-foreground">
              Add garments
            </h1>
            <p className="max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
              Add at least {MIN_GARMENTS_SUGGESTED} items to get better
              recommendations. You can add more anytime.
            </p>
            <div className="glass-panel rounded-sm px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Your closet
              </p>
              <p className="mt-1 text-2xl font-light tabular-nums tracking-tight text-foreground">
                {garments.length} item{garments.length !== 1 ? "s" : ""}
              </p>
            </div>
            <BrutalistButton variant="outline" asChild>
              <Link href="/add">Add garment</Link>
            </BrutalistButton>
            <div className="flex gap-3 pt-2">
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
          <section className="space-y-8">
            <div className="space-y-3">
              <h1 className="font-serif text-2xl font-normal italic leading-tight tracking-tight text-foreground">
                Style preferences
              </h1>
              <p className="max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
                Pick moods and styles you like. We’ll use these to tailor
                recommendations.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Favorite moods
              </p>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={favoriteMoods.includes(m)}
                    onClick={() =>
                      toggleList(m, favoriteMoods, setFavoriteMoods)
                    }
                    className={cn(
                      chipBase,
                      favoriteMoods.includes(m) ? chipActive : chipInactive
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Preferred styles
              </p>
              <div className="flex flex-wrap gap-2">
                {PREF_STYLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={preferredStyles.includes(s)}
                    onClick={() =>
                      toggleList(s, preferredStyles, setPreferredStyles)
                    }
                    className={cn(
                      chipBase,
                      preferredStyles.includes(s) ? chipActive : chipInactive
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Preferred colors
              </p>
              <div className="flex flex-wrap gap-2">
                {PREF_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={preferredColors.includes(c)}
                    onClick={() =>
                      toggleList(c, preferredColors, setPreferredColors)
                    }
                    className={cn(
                      chipBase,
                      preferredColors.includes(c) ? chipActive : chipInactive
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap sm:items-center">
              <BrutalistButton
                onClick={handleSavePreferences}
                disabled={prefsSaved}
              >
                {prefsSaved ? "Saved" : "Save preferences"}
              </BrutalistButton>
              <BrutalistButton onClick={handleNext}>Continue</BrutalistButton>
            </div>
          </section>
        )}

        {step.id === "try" && (
          <section className="space-y-6">
            <h1 className="font-serif text-2xl font-normal italic leading-tight tracking-tight text-foreground">
              Try an outfit
            </h1>
            <p className="max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
              Pick a mood and we’ll suggest an outfit from your closet.
            </p>

            {garments.length === 0 ? (
              <div className="glass-panel rounded-sm px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                Add at least one garment first.{" "}
                <Link
                  href="/add"
                  className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-[var(--signal-orange)] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Add garment
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Mood
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        aria-pressed={selectedMood === m}
                        onClick={() => setSelectedMood(m)}
                        className={cn(
                          chipBase,
                          selectedMood === m ? chipActive : chipInactive
                        )}
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
                  <p
                    className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--signal-orange)]"
                    role="alert"
                  >
                    {recError}
                  </p>
                )}

                {outfits.length > 0 &&
                  (() => {
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
                      <div className="glass-panel rounded-sm p-4 sm:p-5">
                        <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
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

            <BrutalistButton onClick={handleNext}>Continue</BrutalistButton>
          </section>
        )}

        {step.id === "done" && (
          <section className="space-y-6">
            <h1 className="font-serif text-2xl font-normal italic leading-tight tracking-tight text-foreground">
              You’re all set
            </h1>
            <p className="max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
              Start from the home screen to get daily outfit ideas based on your
              mood and weather.
            </p>
            <BrutalistButton onClick={handleFinish}>Go to home</BrutalistButton>
          </section>
        )}

        {!isFirstStep && step.id !== "done" && (
          <button
            type="button"
            onClick={() => setStepIndex((i) => i - 1)}
            className={cn(
              headerFocus,
              "mt-10 min-h-10 px-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-100 hover:text-foreground"
            )}
          >
            Back
          </button>
        )}
      </div>
    </main>
  );
}
