"use client";

import type { RefObject } from "react";
import { motion } from "framer-motion";
import { OutfitRecommendationCard } from "@/components/outfit-recommendation-card";
import { ContentGrid } from "@/components/layout/content-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { getStaggerVariants } from "@/lib/animations";
import type { DisplayOutfit } from "@/components/home/home-types";
import { DISPLAY_OUTFIT_COUNT } from "@/components/home/home-types";

type HomeRecommendationGridProps = {
  gridRef: RefObject<HTMLDivElement | null>;
  loading: boolean;
  recommendedOutfit: DisplayOutfit[];
  skippedIndices: Set<number>;
  isShuffling: boolean;
  isSelectMode: boolean;
  selectedOptionIndices: Set<number>;
  onToggleSelect: (index: number) => void;
  onSkip: (index: number) => void;
  onSaveSingle: (index: number) => void;
  savingSingleIndex: number | null;
  onCreatePreviewNavigate: (outfit: DisplayOutfit) => Promise<void>;
};

export function HomeRecommendationGrid({
  gridRef,
  loading,
  recommendedOutfit,
  skippedIndices,
  isShuffling,
  isSelectMode,
  selectedOptionIndices,
  onToggleSelect,
  onSkip,
  onSaveSingle,
  savingSingleIndex,
  onCreatePreviewNavigate,
}: HomeRecommendationGridProps) {
  const staggerVariants = getStaggerVariants();

  if (loading) {
    return (
      <section className="mb-16 md:mb-24">
        <ContentGrid variant="cards">
          {Array.from({ length: DISPLAY_OUTFIT_COUNT }).map((_, i) => (
            <Skeleton
              key={i}
              className="aspect-square w-full rounded-none border border-border"
            />
          ))}
        </ContentGrid>
      </section>
    );
  }

  if (!recommendedOutfit || recommendedOutfit.length === 0) {
    return (
      <section className="mb-16 md:mb-24">
        <div className="text-center py-12 text-muted-foreground text-[11px] uppercase tracking-[0.2em]">
          No recommendations available
        </div>
      </section>
    );
  }

  return (
    <section className="mb-16 md:mb-24">
      <motion.div
        ref={gridRef}
        variants={staggerVariants.container}
        initial="hidden"
        animate="visible"
        className={`transition-opacity duration-100 ${
          isShuffling ? "opacity-30" : "opacity-100"
        }`}
      >
        <ContentGrid variant="cards">
          {recommendedOutfit.map(
            (outfit, index) =>
              outfit.garments.length > 0 &&
              !skippedIndices.has(index) && (
                <motion.div key={index} variants={staggerVariants.item}>
                  <OutfitRecommendationCard
                    label={outfit.label}
                    garments={outfit.garments}
                    explanation={outfit.explanation}
                    contextMood={outfit.contextMood}
                    contextWeather={outfit.contextWeather}
                    contextTemperature={outfit.contextTemperature}
                    scoreBreakdown={outfit.scoreBreakdown}
                    isSelectMode={isSelectMode}
                    isSelected={selectedOptionIndices.has(index)}
                    onToggleSelect={() => onToggleSelect(index)}
                    onSkip={isSelectMode ? undefined : () => onSkip(index)}
                    onSave={
                      isSelectMode ? undefined : () => onSaveSingle(index)
                    }
                    isSaving={savingSingleIndex === index}
                    onNavigateToDetail={
                      isSelectMode
                        ? undefined
                        : () => onCreatePreviewNavigate(outfit)
                    }
                  />
                </motion.div>
              )
          )}
        </ContentGrid>
      </motion.div>
    </section>
  );
}
