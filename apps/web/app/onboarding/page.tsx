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
import { GlassBar, GlassPanel } from "@/components/layout/glass";
import { AddGarmentForm } from "@/components/add/add-garment-form";
import { useAddGarmentForm } from "@/hooks/use-add-garment-form";
import {
  BrutalistDialog,
  BrutalistDialogContent,
  BrutalistDialogDescription,
  BrutalistDialogHeader,
  BrutalistDialogTitle,
} from "@/components/brutalist-dialog";

const chipBase =
  "min-h-9 rounded-sm border px-3 py-2 text-[11px] uppercase tracking-[0.16em] transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const chipActive = "border-foreground bg-foreground text-background";
const chipInactive =
  "border-border text-muted-foreground hover:border-foreground";

const headerFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm";

const STEPS = [
  {
    id: "welcome",
    title: "Start",
    summary: "See the setup path",
  },
  {
    id: "garments",
    title: "Closet",
    summary: "Add the first items",
  },
  {
    id: "preferences",
    title: "Taste",
    summary: "Tune the suggestions",
  },
  {
    id: "try",
    title: "Preview",
    summary: "Generate one look",
  },
  {
    id: "done",
    title: "Finish",
    summary: "Open the app",
  },
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
  const seedSampleCloset = useMutation(api.seed.seedSampleCloset);

  const garments = garmentsRaw ?? [];
  const [stepIndex, setStepIndex] = useState(0);
  const [favoriteMoods, setFavoriteMoods] = useState<string[]>([]);
  const [preferredStyles, setPreferredStyles] = useState<string[]>([]);
  const [preferredColors, setPreferredColors] = useState<string[]>([]);
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [selectedMood, setSelectedMood] = useState<Mood>("casual");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [seedingCloset, setSeedingCloset] = useState(false);
  const addGarmentForm = useAddGarmentForm({
    successMessage: "Garment added to onboarding closet.",
    onSaved: () => setAddDialogOpen(false),
  });

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
  const selectedPreferenceCount =
    favoriteMoods.length + preferredStyles.length + preferredColors.length;
  const closetProgress = Math.min(
    100,
    Math.round((garments.length / MIN_GARMENTS_SUGGESTED) * 100)
  );
  const progressPercent = Math.round(((stepIndex + 1) / STEPS.length) * 100);

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

  const handleSavePreferencesAndContinue = useCallback(async () => {
    try {
      if (!prefsSaved) {
        await savePreferences({
          favoriteMoods: favoriteMoods.length ? favoriteMoods : undefined,
          preferredStyles: preferredStyles.length ? preferredStyles : undefined,
          preferredColors: preferredColors.length ? preferredColors : undefined,
        });
        setPrefsSaved(true);
        toast.success("Preferences saved.");
      }
      handleNext();
    } catch {
      toast.error("Could not save preferences.");
    }
  }, [
    favoriteMoods,
    handleNext,
    preferredColors,
    preferredStyles,
    prefsSaved,
    savePreferences,
  ]);

  const handleSeedCloset = useCallback(async () => {
    setSeedingCloset(true);
    try {
      const result = await seedSampleCloset();
      if (result.seeded) {
        toast.success(`Added ${result.count} sample garments.`);
      } else if (garments.length > 0) {
        toast.info("Your closet already has items.");
      } else {
        toast.info("Sample closet is already up to date.");
      }
    } catch {
      toast.error("Could not seed the sample closet.");
    } finally {
      setSeedingCloset(false);
    }
  }, [garments.length, seedSampleCloset]);

  const handleTryGenerate = useCallback(async () => {
    if (garments.length === 0) {
      toast.error("Add at least one garment first.");
      return;
    }
    resetRecs();
    await generate({
      mood: selectedMood,
      weather: "cloudy",
      temperature: 15,
      limitCount: 3,
      garmentIds: garments.map((g) => String(g._id)),
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

  React.useEffect(() => {
    setPrefsSaved(false);
  }, [favoriteMoods, preferredStyles, preferredColors]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground selection:bg-signal-orange selection:text-background">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/92 to-background" />
      </div>
      <div
        aria-hidden
        className="glass-veil pointer-events-none absolute inset-0 z-[1]"
      />
      <GlassBar className="fixed left-0 right-0 top-0 z-50 border-x-0 border-t-0 border-b border-border pt-[env(safe-area-inset-top)]">
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
      </GlassBar>

      <p className="sr-only" aria-live="polite">
        Onboarding step {stepIndex + 1} of {STEPS.length}: {step.title}
      </p>

      <div className="relative z-10 mx-auto grid w-full max-w-5xl gap-8 px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-[calc(6rem+env(safe-area-inset-top))] md:grid-cols-[17rem_minmax(0,1fr)] md:px-8">
        <aside className="space-y-5 md:sticky md:top-28 md:self-start">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              Setup progress
            </p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-foreground transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {progressPercent}% complete
            </p>
          </div>

          <nav aria-label="Onboarding steps" className="space-y-2">
            {STEPS.map((s, i) => {
              const isCurrent = i === stepIndex;
              const isComplete = i < stepIndex;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStepIndex(i)}
                  className={cn(
                    "w-full border px-3 py-3 text-left transition-all duration-150 active:scale-[0.99]",
                    isCurrent
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background/50 text-foreground hover:border-foreground"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-medium uppercase tracking-[0.2em]">
                      {s.title}
                    </span>
                    <span className="text-[10px] tabular-nums opacity-70">
                      {isComplete ? "Done" : `${i + 1}/${STEPS.length}`}
                    </span>
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed opacity-70">
                    {s.summary}
                  </span>
                </button>
              );
            })}
          </nav>

          <GlassPanel className="px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Current setup
            </p>
            <div className="mt-3 space-y-2 text-xs text-muted-foreground">
              <p className="flex items-center justify-between gap-3">
                <span>Closet items</span>
                <span className="font-medium tabular-nums text-foreground">
                  {garments.length}
                </span>
              </p>
              <p className="flex items-center justify-between gap-3">
                <span>Taste picks</span>
                <span className="font-medium tabular-nums text-foreground">
                  {selectedPreferenceCount}
                </span>
              </p>
              <p className="flex items-center justify-between gap-3">
                <span>Preview</span>
                <span className="font-medium text-foreground">
                  {outfits.length > 0 ? "Ready" : "Not yet"}
                </span>
              </p>
            </div>
          </GlassPanel>
        </aside>

        <div className="min-w-0">
          <div className="mb-8 flex items-center justify-between gap-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              Step {stepIndex + 1} of {STEPS.length}
            </p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {step.summary}
            </p>
          </div>

          {step.id === "welcome" && (
            <section className="space-y-8">
              <h1 className="font-serif text-2xl font-normal italic leading-tight tracking-tight text-foreground">
                Build your first useful wardrobe signal.
              </h1>
              <p className="max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
                In a few minutes you’ll add your first closet items, choose the
                style notes that matter, and check one outfit recommendation
                before landing on the home screen.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["1", "Add garments", "One is enough to continue."],
                  ["2", "Pick taste", "Choose any moods, styles, or colors."],
                  ["3", "Preview", "Generate one outfit from your closet."],
                ].map(([number, title, copy]) => (
                  <div key={number} className="border-t border-border pt-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {number}
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {copy}
                    </p>
                  </div>
                ))}
              </div>
              <BrutalistButton onClick={handleNext} size="lg">
                Start with my closet
              </BrutalistButton>
            </section>
          )}

          {step.id === "garments" && (
            <section className="space-y-7">
              <h1 className="font-serif text-2xl font-normal italic leading-tight tracking-tight text-foreground">
                Add what you actually wear first.
              </h1>
              <p className="max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
                Start with the pieces you reach for often. One item unlocks the
                next step; {MIN_GARMENTS_SUGGESTED} gives the recommender a
                stronger read.
              </p>
              <GlassPanel className="px-5 py-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Your closet
                    </p>
                    <p className="mt-1 text-3xl font-light tabular-nums tracking-tight text-foreground">
                      {garments.length}
                    </p>
                  </div>
                  <p className="max-w-40 text-right text-xs leading-relaxed text-muted-foreground">
                    {garments.length === 0
                      ? "Add one item to keep moving."
                      : garments.length < MIN_GARMENTS_SUGGESTED
                        ? `${MIN_GARMENTS_SUGGESTED - garments.length} more suggested.`
                        : "Strong enough for better outfit ideas."}
                  </p>
                </div>
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-[var(--signal-orange)] transition-all duration-300"
                    style={{ width: `${closetProgress}%` }}
                  />
                </div>
              </GlassPanel>
              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
                <BrutalistButton
                  variant={garments.length === 0 ? "solid" : "outline"}
                  onClick={() => setAddDialogOpen(true)}
                >
                  {garments.length === 0 ? "Add first garment" : "Add another"}
                </BrutalistButton>
                <BrutalistButton
                  variant="outline"
                  onClick={handleSeedCloset}
                  disabled={seedingCloset}
                >
                  {seedingCloset ? "Seeding closet..." : "Seed sample closet"}
                </BrutalistButton>
                <BrutalistButton
                  onClick={handleNext}
                  disabled={garments.length === 0}
                >
                  Continue to taste
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
                  Pick anything that sounds like you. These choices are
                  optional, but saving them helps the first recommendations feel
                  less cold.
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
                  variant={prefsSaved ? "outline" : "solid"}
                >
                  {prefsSaved ? "Saved" : "Save preferences"}
                </BrutalistButton>
                <BrutalistButton onClick={handleSavePreferencesAndContinue}>
                  {selectedPreferenceCount > 0
                    ? "Save and preview"
                    : "Skip taste for now"}
                </BrutalistButton>
              </div>
            </section>
          )}

          {step.id === "try" && (
            <section className="space-y-6">
              <h1 className="font-serif text-2xl font-normal italic leading-tight tracking-tight text-foreground">
                Try an outfit
              </h1>
              <p className="max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
                Choose the mood you want to dress for. This preview uses the
                items and preferences you just added.
              </p>

              {garments.length === 0 ? (
                <GlassPanel className="px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                  Add at least one garment first.{" "}
                  <button
                    type="button"
                    onClick={() => setAddDialogOpen(true)}
                    className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-[var(--signal-orange)] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Add garment
                  </button>
                </GlassPanel>
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
                    size="lg"
                  >
                    {recLoading
                      ? "Building your preview..."
                      : outfits.length > 0
                        ? "Generate another outfit"
                        : "Generate first outfit"}
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
                        <GlassPanel className="p-4 sm:p-5">
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
                        </GlassPanel>
                      );
                    })()}
                </>
              )}

              <BrutalistButton
                onClick={handleNext}
                variant={outfits.length > 0 ? "solid" : "outline"}
              >
                {outfits.length > 0
                  ? "Finish setup"
                  : "Continue without preview"}
              </BrutalistButton>
            </section>
          )}

          {step.id === "done" && (
            <section className="space-y-6">
              <h1 className="font-serif text-2xl font-normal italic leading-tight tracking-tight text-foreground">
                You’re all set
              </h1>
              <p className="max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
                Your closet has {garments.length} item
                {garments.length !== 1 ? "s" : ""}, {selectedPreferenceCount}{" "}
                taste signal{selectedPreferenceCount !== 1 ? "s" : ""}, and a
                home screen ready to generate daily outfit ideas.
              </p>
              <BrutalistButton onClick={handleFinish} size="lg">
                Open OutfAI
              </BrutalistButton>
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
      </div>

      <BrutalistDialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <BrutalistDialogContent
          size="lg"
          className="max-h-[calc(100vh-2rem)] overflow-y-auto p-4 sm:p-6"
        >
          <BrutalistDialogHeader className="pr-8">
            <BrutalistDialogTitle>Add a garment</BrutalistDialogTitle>
            <BrutalistDialogDescription>
              Add an item without leaving onboarding. Your progress stays right
              here.
            </BrutalistDialogDescription>
          </BrutalistDialogHeader>
          <AddGarmentForm
            form={addGarmentForm}
            className="mt-2"
            saveBarClassName="sticky bottom-0 bg-background/95"
          />
        </BrutalistDialogContent>
      </BrutalistDialog>
    </main>
  );
}
